import { Router, type IRouter } from "express";
import { db, facultyTable, departmentsTable, feedbackTable, coursesTable } from "@workspace/db";
import { avg, count, eq } from "drizzle-orm";
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

  const facultyList = await db
    .select({
      id: facultyTable.id, name: facultyTable.name, email: facultyTable.email,
      designation: facultyTable.designation, departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name, employeeId: facultyTable.employeeId,
      qualification: facultyTable.qualification, specialization: facultyTable.specialization,
      photoUrl: facultyTable.photoUrl,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(params.data.departmentId ? eq(facultyTable.departmentId, params.data.departmentId) : undefined)
    .orderBy(facultyTable.name);

  const result = await Promise.all(
    facultyList.map(async (f) => {
      const [avgResult] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable).where(eq(feedbackTable.facultyId, f.id));

      const assignedCourses = await db
        .select({ id: coursesTable.id, code: coursesTable.code, name: coursesTable.name, semester: coursesTable.semester, academicYear: coursesTable.academicYear, credits: coursesTable.credits })
        .from(coursesTable).where(eq(coursesTable.facultyId, f.id));

      return {
        ...f,
        avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
        totalFeedbackCount: Number(avgResult?.cnt ?? 0),
        assignedCourses,
      };
    })
  );

  res.json(result);
});

router.post("/faculty", async (req, res): Promise<void> => {
  const parsed = CreateFacultyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  // Accept extra fields from request body directly
  const body = req.body as Record<string, unknown>;
  const [faculty] = await db.insert(facultyTable).values({
    name: parsed.data.name,
    email: parsed.data.email ?? null,
    designation: parsed.data.designation,
    departmentId: parsed.data.departmentId,
    employeeId: typeof body.employeeId === "string" ? body.employeeId : null,
    loginPin: typeof body.loginPin === "string" ? body.loginPin : null,
    qualification: typeof body.qualification === "string" ? body.qualification : null,
    specialization: typeof body.specialization === "string" ? body.specialization : null,
  }).returning();

  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, faculty.departmentId));

  const { loginPin: _lp, ...safeFaculty } = faculty;
  res.status(201).json({
    ...safeFaculty,
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

  const [faculty] = await db
    .select({
      id: facultyTable.id, name: facultyTable.name, email: facultyTable.email,
      designation: facultyTable.designation, departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name, employeeId: facultyTable.employeeId,
      qualification: facultyTable.qualification, specialization: facultyTable.specialization,
      photoUrl: facultyTable.photoUrl,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(eq(facultyTable.id, params.data.id));

  if (!faculty) { res.status(404).json({ error: "Faculty not found" }); return; }

  const [avgResult] = await db
    .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
    .from(feedbackTable).where(eq(feedbackTable.facultyId, params.data.id));

  res.json({
    ...faculty,
    avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
    totalFeedbackCount: Number(avgResult?.cnt ?? 0),
  });
});

// ── PATCH /faculty/:id — Update faculty details ──────────────────────────────
router.patch("/faculty/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  const parsed = UpdateFacultyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Partial<typeof facultyTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.designation !== undefined) updates.designation = parsed.data.designation;
  if (parsed.data.employeeId !== undefined) updates.employeeId = parsed.data.employeeId;
  if (parsed.data.loginPin !== undefined) updates.loginPin = parsed.data.loginPin;
  if (parsed.data.qualification !== undefined) updates.qualification = parsed.data.qualification;
  if (parsed.data.specialization !== undefined) updates.specialization = parsed.data.specialization;
  if (parsed.data.photoUrl !== undefined) updates.photoUrl = parsed.data.photoUrl;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(facultyTable).set(updates).where(eq(facultyTable.id, id)).returning();

  if (!updated) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { loginPin: _lp2, ...safeUpdated } = updated;
  res.json(safeUpdated);
});

// ── DELETE /faculty/:id — Remove faculty member ──────────────────────────────
router.delete("/faculty/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  // Check if faculty has feedback associated
  const [fbCount] = await db.select({ cnt: count() }).from(feedbackTable).where(eq(feedbackTable.facultyId, id));
  if (Number(fbCount?.cnt ?? 0) > 0) {
    res.status(409).json({
      error: `Cannot delete faculty with ${fbCount.cnt} existing feedback record(s). Unassign from courses first or keep for data integrity.`,
      feedbackCount: Number(fbCount.cnt),
    });
    return;
  }

  // Unassign from all courses first
  await db.update(coursesTable).set({ facultyId: null }).where(eq(coursesTable.facultyId, id));

  const [deleted] = await db.delete(facultyTable).where(eq(facultyTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { loginPin: _lp3, ...safeDeleted } = deleted;
  res.json({ success: true, deleted: safeDeleted });
});

export default router;
