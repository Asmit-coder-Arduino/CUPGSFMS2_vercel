import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows } from "@workspace/db";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  GetCourseParams,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const UpdateCourseBody = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  academicYear: z.string().min(1).optional(),
  credits: z.number().int().min(1).max(6).optional(),
  facultyId: z.number().int().nullable().optional(),
});

router.get("/courses", async (req, res): Promise<void> => {
  const params = ListCoursesQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  let query = supabase
    .from("courses")
    .select("id, code, name, department_id, faculty_id, semester, academic_year, credits");

  if (params.data.departmentId) query = query.eq("department_id", params.data.departmentId);
  if (params.data.semester) query = query.eq("semester", params.data.semester);
  if (params.data.academicYear) query = query.eq("academic_year", params.data.academicYear);

  const { data: courses, error } = await query.order("semester").order("code");
  if (error) { res.status(500).json({ error: error.message }); return; }

  const result = await Promise.all(
    (courses || []).map(async (c: any) => {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", c.department_id)
        .single();

      let facultyName = null;
      if (c.faculty_id) {
        const { data: fac } = await supabase
          .from("faculty")
          .select("name")
          .eq("id", c.faculty_id)
          .single();
        facultyName = fac?.name ?? null;
      }

      const { data: fbData } = await supabase
        .from("feedback")
        .select("rating_overall")
        .eq("course_id", c.id);

      const ratings = (fbData || []).map((r: any) => r.rating_overall);
      const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

      return {
        ...camelRow(c),
        departmentName: dept?.name ?? null,
        facultyName,
        avgRating,
        feedbackCount: ratings.length,
      };
    })
  );

  res.json(result);
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      code: parsed.data.code,
      name: parsed.data.name,
      department_id: parsed.data.departmentId,
      faculty_id: parsed.data.facultyId ?? null,
      semester: parsed.data.semester,
      academic_year: parsed.data.academicYear,
      credits: parsed.data.credits ?? 3,
    })
    .select()
    .single();

  if (error || !course) { res.status(500).json({ error: error?.message || "Insert failed" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("name")
    .eq("id", course.department_id)
    .single();

  let facultyName = null;
  if (course.faculty_id) {
    const { data: fac } = await supabase
      .from("faculty")
      .select("name")
      .eq("id", course.faculty_id)
      .single();
    facultyName = fac?.name ?? null;
  }

  res.status(201).json({ ...camelRow(course), departmentName: dept?.name, facultyName, avgRating: null, feedbackCount: 0 });
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCourseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, code, name, department_id, faculty_id, semester, academic_year, credits")
    .eq("id", params.data.id)
    .single();

  if (error || !course) { res.status(404).json({ error: "Course not found" }); return; }

  const { data: dept } = await supabase.from("departments").select("name").eq("id", course.department_id).single();
  let facultyName = null;
  if (course.faculty_id) {
    const { data: fac } = await supabase.from("faculty").select("name").eq("id", course.faculty_id).single();
    facultyName = fac?.name ?? null;
  }

  const { data: fbData } = await supabase.from("feedback").select("rating_overall").eq("course_id", params.data.id);
  const ratings = (fbData || []).map((r: any) => r.rating_overall);
  const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

  res.json({
    ...camelRow(course),
    departmentName: dept?.name ?? null,
    facultyName,
    avgRating,
    feedbackCount: ratings.length,
  });
});

router.patch("/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid course ID" }); return; }

  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.code !== undefined) updates.code = parsed.data.code;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.semester !== undefined) updates.semester = parsed.data.semester;
  if (parsed.data.academicYear !== undefined) updates.academic_year = parsed.data.academicYear;
  if (parsed.data.credits !== undefined) updates.credits = parsed.data.credits;
  if ("facultyId" in parsed.data) updates.faculty_id = parsed.data.facultyId;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const { data: updated, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) { res.status(404).json({ error: "Course not found" }); return; }

  let facultyName = null;
  if (updated.faculty_id) {
    const { data: fac } = await supabase.from("faculty").select("name").eq("id", updated.faculty_id).single();
    facultyName = fac?.name ?? null;
  }

  res.json({ ...camelRow(updated), facultyName });
});

router.delete("/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid course ID" }); return; }

  const { count: fbCount } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("course_id", id);

  if ((fbCount ?? 0) > 0) {
    res.status(409).json({
      error: `Cannot delete course with ${fbCount} existing feedback record(s). Data integrity must be preserved.`,
      feedbackCount: fbCount,
    });
    return;
  }

  const { data: deleted, error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !deleted) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({ success: true, deleted: camelRow(deleted) });
});

export default router;
