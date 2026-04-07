import { Router, type IRouter } from "express";
import { db, complaintsTable, departmentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { containsProfanity } from "../lib/profanityFilter";
import { complaintEvents } from "../lib/complaintEvents";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const CATEGORIES = [
  "Academic",
  "Infrastructure",
  "Faculty",
  "Examination",
  "Hostel",
  "Library",
  "Lab & Equipment",
  "Administration",
  "Other",
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

  const [complaint] = await db.insert(complaintsTable).values({
    referenceId,
    studentName: data.isAnonymous ? "Anonymous" : data.studentName,
    rollNumber: data.isAnonymous ? "Anonymous" : data.rollNumber,
    departmentId: data.departmentId,
    category: data.category,
    priority: data.priority,
    subject: data.subject,
    description: data.description,
    isAnonymous: data.isAnonymous,
    ipAddress: clientIp,
  }).returning();

  const [dept] = await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, data.departmentId));

  complaintEvents.notifyNewComplaint({
    ...complaint,
    departmentName: dept?.name || "",
    studentName: data.studentName,
    isAnonymous: data.isAnonymous,
  });

  res.status(201).json({
    ...complaint,
    message: "Complaint submitted successfully",
  });
});

router.get("/complaints", async (req, res): Promise<void> => {
  const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;
  const status = req.query.status as string | undefined;
  const priority = req.query.priority as string | undefined;

  const conditions = [];
  if (departmentId) conditions.push(eq(complaintsTable.departmentId, departmentId));
  if (status) conditions.push(eq(complaintsTable.status, status));
  if (priority) conditions.push(eq(complaintsTable.priority, priority));

  const complaints = await db
    .select({
      id: complaintsTable.id,
      referenceId: complaintsTable.referenceId,
      studentName: complaintsTable.studentName,
      rollNumber: complaintsTable.rollNumber,
      departmentId: complaintsTable.departmentId,
      departmentName: departmentsTable.name,
      departmentCode: departmentsTable.code,
      category: complaintsTable.category,
      priority: complaintsTable.priority,
      subject: complaintsTable.subject,
      description: complaintsTable.description,
      status: complaintsTable.status,
      adminRemarks: complaintsTable.adminRemarks,
      hodRemarks: complaintsTable.hodRemarks,
      isAnonymous: complaintsTable.isAnonymous,
      createdAt: complaintsTable.createdAt,
      updatedAt: complaintsTable.updatedAt,
      resolvedAt: complaintsTable.resolvedAt,
    })
    .from(complaintsTable)
    .leftJoin(departmentsTable, eq(complaintsTable.departmentId, departmentsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(complaintsTable.createdAt));

  res.json(complaints);
});

router.get("/complaints/track/:referenceId", async (req, res): Promise<void> => {
  const refId = req.params.referenceId;
  const [complaint] = await db
    .select({
      id: complaintsTable.id,
      referenceId: complaintsTable.referenceId,
      category: complaintsTable.category,
      priority: complaintsTable.priority,
      subject: complaintsTable.subject,
      status: complaintsTable.status,
      adminRemarks: complaintsTable.adminRemarks,
      hodRemarks: complaintsTable.hodRemarks,
      createdAt: complaintsTable.createdAt,
      updatedAt: complaintsTable.updatedAt,
      resolvedAt: complaintsTable.resolvedAt,
      departmentName: departmentsTable.name,
    })
    .from(complaintsTable)
    .leftJoin(departmentsTable, eq(complaintsTable.departmentId, departmentsTable.id))
    .where(eq(complaintsTable.referenceId, refId));

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.json(complaint);
});

const UpdateComplaint = z.object({
  status: z.enum(["pending", "in_review", "resolved", "rejected"]).optional(),
  adminRemarks: z.string().max(1000).optional(),
  hodRemarks: z.string().max(1000).optional(),
});

router.patch("/complaints/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid complaint ID" });
    return;
  }

  const parsed = UpdateComplaint.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid update data" });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.adminRemarks !== undefined) updates.adminRemarks = parsed.data.adminRemarks;
  if (parsed.data.hodRemarks !== undefined) updates.hodRemarks = parsed.data.hodRemarks;
  if (parsed.data.status === "resolved") updates.resolvedAt = new Date();

  const [updated] = await db
    .update(complaintsTable)
    .set(updates)
    .where(eq(complaintsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  res.json(updated);
});

router.delete("/complaints/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid complaint ID" });
    return;
  }

  const [deleted] = await db
    .delete(complaintsTable)
    .where(eq(complaintsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

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
  complaintEvents.addClient({
    id: clientId,
    res,
    role: role as "admin" | "hod",
    departmentId,
  });

  const keepAlive = setInterval(() => {
    try { res.write(": keepalive\n\n"); } catch { clearInterval(keepAlive); }
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

export default router;
