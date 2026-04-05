import { Router, type IRouter } from "express";
import { db, windowsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateWindowBody,
  GetWindowParams,
  UpdateWindowParams,
  UpdateWindowBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/windows", async (req, res): Promise<void> => {
  const windows = await db
    .select()
    .from(windowsTable)
    .orderBy(desc(windowsTable.createdAt));

  res.json(
    windows.map((w) => ({
      ...w,
      departmentIds: (w.departmentIds ?? []).map(Number),
    }))
  );
});

router.post("/windows", async (req, res): Promise<void> => {
  const parsed = CreateWindowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [win] = await db
    .insert(windowsTable)
    .values({
      title: parsed.data.title,
      feedbackType: parsed.data.feedbackType,
      academicYear: parsed.data.academicYear,
      semester: parsed.data.semester,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      isActive: true,
      departmentIds: (parsed.data.departmentIds ?? []).map(String),
    })
    .returning();

  res.status(201).json({
    ...win,
    departmentIds: (win.departmentIds ?? []).map(Number),
  });
});

router.get("/windows/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetWindowParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [win] = await db
    .select()
    .from(windowsTable)
    .where(eq(windowsTable.id, params.data.id));

  if (!win) {
    res.status(404).json({ error: "Window not found" });
    return;
  }

  res.json({ ...win, departmentIds: (win.departmentIds ?? []).map(Number) });
});

router.patch("/windows/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateWindowParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateWindowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.startDate !== undefined) updates.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate !== undefined) updates.endDate = new Date(parsed.data.endDate);

  const [win] = await db
    .update(windowsTable)
    .set(updates)
    .where(eq(windowsTable.id, params.data.id))
    .returning();

  if (!win) {
    res.status(404).json({ error: "Window not found" });
    return;
  }

  res.json({ ...win, departmentIds: (win.departmentIds ?? []).map(Number) });
});

export default router;
