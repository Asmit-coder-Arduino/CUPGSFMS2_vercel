import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows } from "@workspace/db";
import { z } from "zod";
import { containsProfanity } from "../lib/profanityFilter";
import { complaintEvents } from "../lib/complaintEvents";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const CATEGORIES = [
  "Academic", "Infrastructure", "Faculty", "Examination",
  "Hostel", "Library", "Lab & Equipment", "Administration", "Other",
] as const;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const SubmitComplaint = z.object({
  studentName: z.string().min(2).max(100),
  rollNumber: z.string().min(2).max(30),
  departmentId: z.number().int(),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES).default("medium"),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  isAnonymous: z.boolean().default(false),
});

function generateComplaintRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CUPGS-CMP-${code}`;
}

router.post("/complaints", async (req, res): Promise<void> => {
  const parsed = SubmitComplaint.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid complaint data", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  if (containsProfanity(data.subject) || containsProfanity(data.description)) {
    res.status(400).json({ error: "Complaint contains inappropriate language. Please use respectful language." });
    return;
  }

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const referenceId = generateComplaintRef();

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({
      reference_id: referenceId,
      student_name: data.isAnonymous ? "Anonymous" : data.studentName,
      roll_number: data.isAnonymous ? "Anonymous" : data.rollNumber,
      department_id: data.departmentId,
      category: data.category,
      priority: data.priority,
      subject: data.subject,
      description: data.description,
      is_anonymous: data.isAnonymous,
      ip_address: clientIp,
    })
    .select()
    .single();

  if (error || !complaint) { res.status(500).json({ error: error?.message || "Insert failed" }); return; }

  const { data: dept } = await supabase.from("departments").select("name").eq("id", data.departmentId).single();

  complaintEvents.notifyNewComplaint({
    ...camelRow(complaint),
    departmentName: dept?.name || "",
    studentName: data.isAnonymous ? "Anonymous" : data.studentName,
    isAnonymous: data.isAnonymous,
  } as any);

  const { ip_address: _ip, ...safeComplaint } = complaint;
  res.status(201).json({ ...camelRow(safeComplaint), message: "Complaint submitted successfully" });
});

router.get("/complaints", async (req, res): Promise<void> => {
  const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;
  const status = req.query.status as string | undefined;
  const priority = req.query.priority as string | undefined;

  let query = supabase
    .from("complaints")
    .select("id, reference_id, student_name, roll_number, department_id, category, priority, subject, description, status, admin_remarks, hod_remarks, is_anonymous, created_at, updated_at, resolved_at");

  if (departmentId) query = query.eq("department_id", departmentId);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data: complaints, error } = await query.order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }

  const result = await Promise.all(
    (complaints || []).map(async (c: any) => {
      const { data: dept } = await supabase.from("departments").select("name, code").eq("id", c.department_id).single();
      return {
        ...camelRow(c),
        departmentName: dept?.name ?? null,
        departmentCode: dept?.code ?? null,
      };
    })
  );

  res.json(result);
});

router.get("/complaints/track/:referenceId", async (req, res): Promise<void> => {
  const refId = req.params.referenceId;

  const { data: complaint } = await supabase
    .from("complaints")
    .select("id, reference_id, category, priority, subject, status, admin_remarks, hod_remarks, created_at, updated_at, resolved_at, department_id")
    .eq("reference_id", refId)
    .single();

  if (!complaint) { res.status(404).json({ error: "Complaint not found" }); return; }

  const { data: dept } = await supabase.from("departments").select("name").eq("id", complaint.department_id).single();
  const { department_id: _did, ...rest } = complaint;

  res.json({ ...camelRow(rest), departmentName: dept?.name ?? null });
});

const UpdateComplaint = z.object({
  status: z.enum(["pending", "in_review", "resolved", "rejected"]).optional(),
  adminRemarks: z.string().max(1000).optional(),
  hodRemarks: z.string().max(1000).optional(),
});

router.patch("/complaints/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid complaint ID" }); return; }

  const parsed = UpdateComplaint.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid update data" }); return; }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.adminRemarks !== undefined) updates.admin_remarks = parsed.data.adminRemarks;
  if (parsed.data.hodRemarks !== undefined) updates.hod_remarks = parsed.data.hodRemarks;
  if (parsed.data.status === "resolved") updates.resolved_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) { res.status(404).json({ error: "Complaint not found" }); return; }
  res.json(camelRow(updated));
});

router.delete("/complaints/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid complaint ID" }); return; }

  const { data: deleted, error } = await supabase
    .from("complaints")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error || !deleted) { res.status(404).json({ error: "Complaint not found" }); return; }
  res.json({ message: "Complaint deleted" });
});

router.get("/complaints/events/stream", (req, res): void => {
  const role = req.query.role as string;
  const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;

  if (role !== "admin" && role !== "hod") {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  const clientId = randomUUID();
  complaintEvents.addClient({ id: clientId, res, role: role as "admin" | "hod", departmentId });

  const keepAlive = setInterval(() => {
    try { res.write(": keepalive\n\n"); } catch { clearInterval(keepAlive); }
  }, 30000);

  req.on("close", () => { clearInterval(keepAlive); });
});

export default router;
