import { Router, type IRouter } from "express";
import { db, coursesTable, departmentsTable, facultyTable, feedbackTable } from "@workspace/db";
import { avg, count, eq, and } from "drizzle-orm";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  GetCourseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const params = ListCoursesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.departmentId) {
    conditions.push(eq(coursesTable.departmentId, params.data.departmentId));
  }
  if (params.data.semester) {
    conditions.push(eq(coursesTable.semester, params.data.semester));
  }
  if (params.data.academicYear) {
    conditions.push(eq(coursesTable.academicYear, params.data.academicYear));
  }

  const courses = await db
    .select({
      id: coursesTable.id,
      code: coursesTable.code,
      name: coursesTable.name,
      departmentId: coursesTable.departmentId,
      departmentName: departmentsTable.name,
      facultyId: coursesTable.facultyId,
      facultyName: facultyTable.name,
      semester: coursesTable.semester,
      academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(coursesTable.code);

  const result = await Promise.all(
    courses.map(async (c) => {
      const [avgResult] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, c.id));

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
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();

  const [dept] = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, course.departmentId));

  let facultyName = null;
  if (course.facultyId) {
    const [faculty] = await db
      .select()
      .from(facultyTable)
      .where(eq(facultyTable.id, course.facultyId));
    facultyName = faculty?.name ?? null;
  }

  res.status(201).json({
    ...course,
    departmentName: dept?.name,
    facultyName,
    avgRating: null,
    feedbackCount: 0,
  });
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCourseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db
    .select({
      id: coursesTable.id,
      code: coursesTable.code,
      name: coursesTable.name,
      departmentId: coursesTable.departmentId,
      departmentName: departmentsTable.name,
      facultyId: coursesTable.facultyId,
      facultyName: facultyTable.name,
      semester: coursesTable.semester,
      academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
    })
    .from(coursesTable)
    .leftJoin(departmentsTable, eq(coursesTable.departmentId, departmentsTable.id))
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id))
    .where(eq(coursesTable.id, params.data.id));

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const [avgResult] = await db
    .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.courseId, params.data.id));

  res.json({
    ...course,
    avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
    feedbackCount: Number(avgResult?.cnt ?? 0),
  });
});

export default router;
