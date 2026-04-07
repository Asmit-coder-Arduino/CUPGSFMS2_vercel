import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows } from "@workspace/db";
import {
  ListFacultyQueryParams,
  CreateFacultyBody,
  GetFacultyParams,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const UpdateFacultyBody = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  designation: z.string().min(1).optional(),
  employeeId: z.string().optional().nullable(),
  loginPin: z.string().min(4).max(20).optional().nullable(),
  qualification: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

router.get("/faculty", async (req, res): Promise<void> => {
  const params = ListFacultyQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  let query = supabase
    .from("faculty")
    .select("id, name, email, designation, department_id, employee_id, qualification, specialization, photo_url");

  if (params.data.departmentId) {
    query = query.eq("department_id", params.data.departmentId);
  }

  const { data: facultyList, error } = await query.order("name");
  if (error) { res.status(500).json({ error: error.message }); return; }

  const result = await Promise.all(
    (facultyList || []).map(async (f: any) => {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", f.department_id)
        .single();

      const { data: fbData } = await supabase
        .from("feedback")
        .select("rating_overall")
        .eq("faculty_id", f.id);

      const ratings = (fbData || []).map((r: any) => r.rating_overall);
      const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

      const { data: assignedCourses } = await supabase
        .from("courses")
        .select("id, code, name, semester, academic_year, credits")
        .eq("faculty_id", f.id);

      return {
        ...camelRow(f),
        departmentName: dept?.name ?? null,
        avgRating,
        totalFeedbackCount: ratings.length,
        assignedCourses: camelRows(assignedCourses || []),
      };
    })
  );

  res.json(result);
});

router.post("/faculty", async (req, res): Promise<void> => {
  const parsed = CreateFacultyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const body = req.body as Record<string, unknown>;
  const { data: faculty, error } = await supabase
    .from("faculty")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      designation: parsed.data.designation,
      department_id: parsed.data.departmentId,
      employee_id: typeof body.employeeId === "string" ? body.employeeId : null,
      login_pin: typeof body.loginPin === "string" ? body.loginPin : null,
      qualification: typeof body.qualification === "string" ? body.qualification : null,
      specialization: typeof body.specialization === "string" ? body.specialization : null,
    })
    .select()
    .single();

  if (error || !faculty) { res.status(500).json({ error: error?.message || "Insert failed" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("name")
    .eq("id", faculty.department_id)
    .single();

  const { login_pin: _lp, ...safeFaculty } = faculty;
  res.status(201).json({
    ...camelRow(safeFaculty),
    departmentName: dept?.name,
    avgRating: null,
    totalFeedbackCount: 0,
    assignedCourses: [],
  });
});

router.get("/faculty/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFacultyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { data: faculty, error } = await supabase
    .from("faculty")
    .select("id, name, email, designation, department_id, employee_id, qualification, specialization, photo_url")
    .eq("id", params.data.id)
    .single();

  if (error || !faculty) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("name")
    .eq("id", faculty.department_id)
    .single();

  const { data: fbData } = await supabase
    .from("feedback")
    .select("rating_overall")
    .eq("faculty_id", params.data.id);

  const ratings = (fbData || []).map((r: any) => r.rating_overall);
  const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

  res.json({
    ...camelRow(faculty),
    departmentName: dept?.name ?? null,
    avgRating,
    totalFeedbackCount: ratings.length,
  });
});

router.patch("/faculty/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  const parsed = UpdateFacultyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.designation !== undefined) updates.designation = parsed.data.designation;
  if (parsed.data.employeeId !== undefined) updates.employee_id = parsed.data.employeeId;
  if (parsed.data.loginPin !== undefined) updates.login_pin = parsed.data.loginPin;
  if (parsed.data.qualification !== undefined) updates.qualification = parsed.data.qualification;
  if (parsed.data.specialization !== undefined) updates.specialization = parsed.data.specialization;
  if (parsed.data.photoUrl !== undefined) updates.photo_url = parsed.data.photoUrl;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const { data: updated, error } = await supabase
    .from("faculty")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { login_pin: _lp2, ...safeUpdated } = updated;
  res.json(camelRow(safeUpdated));
});

router.delete("/faculty/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  const { count: fbCount } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("faculty_id", id);

  if ((fbCount ?? 0) > 0) {
    res.status(409).json({
      error: `Cannot delete faculty with ${fbCount} existing feedback record(s). Unassign from courses first or keep for data integrity.`,
      feedbackCount: fbCount,
    });
    return;
  }

  await supabase.from("courses").update({ faculty_id: null }).eq("faculty_id", id);

  const { data: deleted, error } = await supabase
    .from("faculty")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !deleted) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { login_pin: _lp3, ...safeDeleted } = deleted;
  res.json({ success: true, deleted: camelRow(safeDeleted) });
});

export default router;
