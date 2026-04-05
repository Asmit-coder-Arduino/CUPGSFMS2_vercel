import { Router, type IRouter } from "express";
import { db, feedbackTable, coursesTable, facultyTable, departmentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  ListFeedbackQueryParams,
  SubmitFeedbackBody,
  GetFeedbackParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichFeedback(fb: typeof feedbackTable.$inferSelect) {
  const [course] = await db
    .select({ name: coursesTable.name, code: coursesTable.code, semester: coursesTable.semester, academicYear: coursesTable.academicYear, departmentId: coursesTable.departmentId })
    .from(coursesTable)
    .where(eq(coursesTable.id, fb.courseId));

  const [faculty] = fb.facultyId
    ? await db.select({ name: facultyTable.name }).from(facultyTable).where(eq(facultyTable.id, fb.facultyId))
    : [null];

  const [dept] = await db
    .select({ name: departmentsTable.name })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, fb.departmentId));

  return {
    ...fb,
    courseName: course?.name ?? null,
    courseCode: course?.code ?? null,
    facultyName: faculty?.name ?? null,
    departmentName: dept?.name ?? null,
  };
}

router.get("/feedback", async (req, res): Promise<void> => {
  const params = ListFeedbackQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.courseId) conditions.push(eq(feedbackTable.courseId, params.data.courseId));
  if (params.data.departmentId) conditions.push(eq(feedbackTable.departmentId, params.data.departmentId));
  if (params.data.facultyId) conditions.push(eq(feedbackTable.facultyId, params.data.facultyId));
  if (params.data.semester) conditions.push(eq(feedbackTable.semester, params.data.semester));
  if (params.data.academicYear) conditions.push(eq(feedbackTable.academicYear, params.data.academicYear));
  if (params.data.feedbackType) conditions.push(eq(feedbackTable.feedbackType, params.data.feedbackType));

  const feedbackList = await db
    .select()
    .from(feedbackTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(feedbackTable.createdAt))
    .limit(100);

  const enriched = await Promise.all(feedbackList.map(enrichFeedback));
  res.json(enriched);
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, parsed.data.courseId));

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const referenceId = `BPUT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;

  const [feedback] = await db
    .insert(feedbackTable)
    .values({
      referenceId,
      courseId: parsed.data.courseId,
      facultyId: parsed.data.facultyId ?? null,
      departmentId: course.departmentId,
      semester: course.semester,
      academicYear: course.academicYear,
      studentYear: parsed.data.studentYear ?? null,
      section: parsed.data.section ?? null,
      feedbackType: parsed.data.feedbackType,
      ratingCourseContent: parsed.data.ratingCourseContent,
      ratingTeachingQuality: parsed.data.ratingTeachingQuality,
      ratingLabFacilities: parsed.data.ratingLabFacilities,
      ratingStudyMaterial: parsed.data.ratingStudyMaterial,
      ratingOverall: parsed.data.ratingOverall,
      comments: parsed.data.comments ?? null,
      isAnonymous: parsed.data.isAnonymous ?? true,
    })
    .returning();

  const enriched = await enrichFeedback(feedback);
  res.status(201).json(enriched);
});

router.get("/feedback/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFeedbackParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [feedback] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.id, params.data.id));

  if (!feedback) {
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  const enriched = await enrichFeedback(feedback);
  res.json(enriched);
});

export default router;
