import { Router, type IRouter } from "express";
import { db, coursesTable, departmentsTable, facultyTable, feedbackTable } from "@workspace/db";
import { avg, count, eq, and } from "drizzle-orm";
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

  const conditions = [];
  if (params.data.departmentId) conditions.push(eq(coursesTable.departmentId, params.data.departmentId));
  if (params.data.semester) conditions.push(eq(coursesTable.semester, params.data.semester));
  if (params.data.academicYear) conditions.push(eq(coursesTable.academicYear, params.data.academicYear));

  const courses = await db
    .select({
      id: coursesTable.id, code: coursesTable.code, name: coursesTable.name,
      departmentId: coursesTable.departmentId, departmentName: departmentsTable.name,
      facultyId: coursesTable.facultyId, facultyName: facultyTable.name,
      semester: coursesTable.semester, academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(coursesTable.semester, coursesTable.code);

  const result = await Promise.all(
    courses.map(async (c) => {
      const [avgResult] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable).where(eq(feedbackTable.courseId, c.id));
      return {
        ...c,
        avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
        feedbackCount: Number(avgResult?.cnt ?? 0),
      };
    })
  );

  res.json(result);
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();

  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, course.departmentId));

  let facultyName = null;
  if (course.facultyId) {
    const [faculty] = await db.select().from(facultyTable).where(eq(facultyTable.id, course.facultyId));
    facultyName = faculty?.name ?? null;
  }

  res.status(201).json({ ...course, departmentName: dept?.name, facultyName, avgRating: null, feedbackCount: 0 });
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCourseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [course] = await db
    .select({
      id: coursesTable.id, code: coursesTable.code, name: coursesTable.name,
      departmentId: coursesTable.departmentId, departmentName: departmentsTable.name,
      facultyId: coursesTable.facultyId, facultyName: facultyTable.name,
      semester: coursesTable.semester, academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id))
    .where(eq(coursesTable.id, params.data.id));

  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  const [avgResult] = await db
    .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
    .from(feedbackTable).where(eq(feedbackTable.courseId, params.data.id));

  res.json({
    ...course,
    avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
    feedbackCount: Number(avgResult?.cnt ?? 0),
  });
});

// ── PATCH /courses/:id — Update course (incl. faculty assignment) ─────────────
router.patch("/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid course ID" }); return; }

  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Partial<typeof coursesTable.$inferInsert> = {};
  if (parsed.data.code !== undefined) updates.code = parsed.data.code;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.semester !== undefined) updates.semester = parsed.data.semester;
  if (parsed.data.academicYear !== undefined) updates.academicYear = parsed.data.academicYear;
  if (parsed.data.credits !== undefined) updates.credits = parsed.data.credits;
  if ("facultyId" in parsed.data) updates.facultyId = parsed.data.facultyId;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Course not found" }); return; }

  let facultyName = null;
  if (updated.facultyId) {
    const [faculty] = await db.select({ name: facultyTable.name }).from(facultyTable).where(eq(facultyTable.id, updated.facultyId));
    facultyName = faculty?.name ?? null;
  }

  res.json({ ...updated, facultyName });
});

// ── DELETE /courses/:id ───────────────────────────────────────────────────────
router.delete("/courses/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid course ID" }); return; }

  const [fbCount] = await db.select({ cnt: count() }).from(feedbackTable).where(eq(feedbackTable.courseId, id));
  if (Number(fbCount?.cnt ?? 0) > 0) {
    res.status(409).json({
      error: `Cannot delete course with ${fbCount.cnt} existing feedback record(s). Data integrity must be preserved.`,
      feedbackCount: Number(fbCount.cnt),
    });
    return;
  }

  const [deleted] = await db.delete(coursesTable).where(eq(coursesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({ success: true, deleted });
});

export default router;
