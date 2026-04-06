import { Router, type IRouter } from "express";
import { db, feedbackTable, coursesTable, facultyTable, departmentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  ListFeedbackQueryParams,
  GetFeedbackParams,
} from "@workspace/api-zod";
import { containsProfanity } from "../lib/profanityFilter";
import { z } from "zod";

const router: IRouter = Router();

// Extended submit schema — standard ratings made optional (default 3)
// so HOD-disabled fields don't break submission.
const SubmitFeedbackExtended = z.object({
  courseId: z.number().int(),
  facultyId: z.number().int().optional(),
  studentYear: z.number().int().min(1).max(4).optional(),
  section: z.string().max(10).optional(),
  feedbackType: z.enum(["semester_end", "mid_semester", "event_based", "placement"]).default("semester_end"),
  ratingCourseContent: z.number().min(0.5).max(5).multipleOf(0.5).default(3),
  ratingTeachingQuality: z.number().min(0.5).max(5).multipleOf(0.5).default(3),
  ratingLabFacilities: z.number().min(0.5).max(5).multipleOf(0.5).default(3),
  ratingStudyMaterial: z.number().min(0.5).max(5).multipleOf(0.5).default(3),
  ratingOverall: z.number().min(0.5).max(5).multipleOf(0.5).default(3),
  comments: z.string().max(1000).optional(),
  customAnswers: z.record(z.unknown()).optional(),
  isAnonymous: z.boolean().default(true),
});

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
  const parsed = SubmitFeedbackExtended.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Profanity check on comments
  if (parsed.data.comments && parsed.data.comments.trim().length > 0) {
    if (containsProfanity(parsed.data.comments)) {
      res.status(422).json({
        error: "Your feedback contains inappropriate language. Please keep your comments respectful and constructive.",
        code: "PROFANITY_DETECTED",
      });
      return;
    }
  }

  // Also check custom text answers for profanity
  if (parsed.data.customAnswers) {
    for (const [, val] of Object.entries(parsed.data.customAnswers)) {
      if (typeof val === "string" && val.trim() && containsProfanity(val)) {
        res.status(422).json({
          error: "Your response contains inappropriate language. Please keep your feedback respectful.",
          code: "PROFANITY_DETECTED",
        });
        return;
      }
    }
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

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "unknown";

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
      customAnswers: parsed.data.customAnswers ?? null,
      isAnonymous: parsed.data.isAnonymous ?? true,
      ipAddress: clientIp,
    })
    .returning();

  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  const enriched = await enrichFeedback(feedback);
  res.status(201).json({ ...enriched, serialNumber, ipAddress: clientIp });
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

router.get("/feedback/track/:referenceId", async (req, res): Promise<void> => {
  const refId = req.params.referenceId;
  if (!refId) {
    res.status(400).json({ error: "Reference ID is required" });
    return;
  }

  const [feedback] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.referenceId, refId));

  if (!feedback) {
    res.json({
      found: false,
      referenceId: refId,
      status: "DELETED",
      message: "This feedback has been deleted or does not exist. It may have been removed by the HOD.",
    });
    return;
  }

  const enriched = await enrichFeedback(feedback);
  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  res.json({
    found: true,
    referenceId: refId,
    status: "ACTIVE",
    message: "Your feedback is active and recorded in the system.",
    serialNumber,
    submittedAt: feedback.createdAt,
    courseName: enriched.courseName,
    courseCode: enriched.courseCode,
    facultyName: enriched.facultyName,
    departmentName: enriched.departmentName,
    ratingOverall: feedback.ratingOverall,
  });
});

router.delete("/feedback/:id/hod-delete", async (req, res): Promise<void> => {
  const feedbackId = parseInt(req.params.id, 10);
  if (isNaN(feedbackId)) {
    res.status(400).json({ error: "Invalid feedback ID" });
    return;
  }

  const { hodEmployeeId, hodPin } = req.body;
  if (!hodEmployeeId || !hodPin) {
    res.status(400).json({ error: "HOD Employee ID and PIN are required for deletion" });
    return;
  }

  const [feedback] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.id, feedbackId));

  if (!feedback) {
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  const [dept] = await db
    .select({
      id: departmentsTable.id,
      hodEmployeeId: departmentsTable.hodEmployeeId,
      hodPin: departmentsTable.hodPin,
    })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, feedback.departmentId));

  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  if (dept.hodEmployeeId !== hodEmployeeId) {
    res.status(403).json({ error: "You are not authorized to delete feedback from this department" });
    return;
  }

  if (dept.hodPin !== hodPin) {
    res.status(401).json({ error: "Incorrect HOD PIN. Deletion requires valid credentials." });
    return;
  }

  await db.delete(feedbackTable).where(eq(feedbackTable.id, feedbackId));

  res.json({ success: true, message: "Feedback deleted successfully", deletedId: feedbackId });
});

export default router;
