import { Router, type IRouter } from "express";
import { supabase, camelRow } from "@workspace/db";
import {
  CreateWindowBody,
  GetWindowParams,
  UpdateWindowParams,
  UpdateWindowBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/windows", async (req, res): Promise<void> => {
  const { data: windows, error } = await supabase
    .from("feedback_windows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }

  res.json(
    (windows || []).map((w: any) => ({
      ...camelRow(w),
      departmentIds: (w.department_ids ?? []).map(Number),
    }))
  );
});

router.post("/windows", async (req, res): Promise<void> => {
  const parsed = CreateWindowBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { data: win, error } = await supabase
    .from("feedback_windows")
    .insert({
      title: parsed.data.title,
      feedback_type: parsed.data.feedbackType,
      academic_year: parsed.data.academicYear,
      semester: parsed.data.semester,
      start_date: new Date(parsed.data.startDate).toISOString(),
      end_date: new Date(parsed.data.endDate).toISOString(),
      is_active: true,
      department_ids: (parsed.data.departmentIds ?? []).map(String),
    })
    .select()
    .single();

  if (error || !win) { res.status(500).json({ error: error?.message || "Insert failed" }); return; }

  res.status(201).json({
    ...camelRow(win),
    departmentIds: (win.department_ids ?? []).map(Number),
  });
});

router.get("/windows/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetWindowParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { data: win, error } = await supabase
    .from("feedback_windows")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (error || !win) { res.status(404).json({ error: "Window not found" }); return; }

  res.json({ ...camelRow(win), departmentIds: (win.department_ids ?? []).map(Number) });
});

router.patch("/windows/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateWindowParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateWindowBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;
  if (parsed.data.startDate !== undefined) updates.start_date = new Date(parsed.data.startDate).toISOString();
  if (parsed.data.endDate !== undefined) updates.end_date = new Date(parsed.data.endDate).toISOString();

  const { data: win, error } = await supabase
    .from("feedback_windows")
    .update(updates)
    .eq("id", params.data.id)
    .select()
    .single();

  if (error || !win) { res.status(404).json({ error: "Window not found" }); return; }

  res.json({ ...camelRow(win), departmentIds: (win.department_ids ?? []).map(Number) });
});

export default router;
