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

router.get("/feedback/receipt/:referenceId", async (req, res): Promise<void> => {
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
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  const enriched = await enrichFeedback(feedback);
  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  const date = feedback.createdAt ? new Date(feedback.createdAt) : new Date();
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const stars = (n: number) => "\u2605".repeat(Math.round(n)) + "\u2606".repeat(5 - Math.round(n));

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CUPGS Feedback Receipt - ${refId}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f9fa;padding:16px}
.receipt{max-width:600px;margin:0 auto;background:#fff;border:2px solid #4f46e5;border-radius:12px;overflow:hidden}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:20px;text-align:center}
.header h1{font-size:18px;margin-bottom:4px}
.header p{font-size:11px;opacity:.85}
.body{padding:20px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px}
.row:last-child{border-bottom:none}
.label{color:#6b7280;font-weight:500}
.value{font-weight:600;color:#1f2937;text-align:right;max-width:60%}
.ref-box{background:#f0f0ff;border:1px dashed #4f46e5;border-radius:8px;padding:14px;text-align:center;margin:14px 0}
.ref-box .id{font-size:16px;font-weight:800;color:#4f46e5;font-family:monospace;letter-spacing:1px}
.section-title{font-weight:700;font-size:12px;color:#4f46e5;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px;padding-top:6px;border-top:2px solid #e5e7eb}
.stars{color:#f59e0b;font-size:14px;letter-spacing:2px}
.footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 20px;text-align:center;font-size:10px;color:#9ca3af}
.comments{background:#f9fafb;border-radius:6px;padding:10px;font-size:12px;color:#374151;margin-top:8px;font-style:italic}
.save-btn{display:block;margin:16px auto;background:#4f46e5;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
.save-btn:active{background:#4338ca}
@media print{.save-btn{display:none}body{padding:0;background:#fff}.receipt{border:1px solid #ccc}}
</style></head><body>
<div class="receipt">
<div class="header">
<h1>CUPGS - BPUT, Rourkela</h1>
<p>Centre for UG & PG Studies | Academic Feedback Receipt</p>
</div>
<div class="body">
<div class="ref-box">
<div style="font-size:11px;color:#6b7280;margin-bottom:4px">REFERENCE NUMBER</div>
<div class="id">${refId}</div>
</div>
<div class="row"><span class="label">Form Serial No.</span><span class="value">${serialNumber}</span></div>
<div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
<div class="row"><span class="label">Time</span><span class="value">${timeStr}</span></div>
<div class="row"><span class="label">IP Address</span><span class="value">${feedback.ipAddress || "N/A"}</span></div>
<div class="section-title">Course & Faculty</div>
<div class="row"><span class="label">Department</span><span class="value">${enriched.departmentName || "N/A"}</span></div>
<div class="row"><span class="label">Course</span><span class="value">[${enriched.courseCode}] ${enriched.courseName}</span></div>
<div class="row"><span class="label">Faculty</span><span class="value">${enriched.facultyName || "Not Assigned"}</span></div>
<div class="section-title">Ratings Given</div>
<div class="row"><span class="label">Course Content</span><span class="value"><span class="stars">${stars(feedback.ratingCourseContent)}</span> ${feedback.ratingCourseContent}/5</span></div>
<div class="row"><span class="label">Teaching Quality</span><span class="value"><span class="stars">${stars(feedback.ratingTeachingQuality)}</span> ${feedback.ratingTeachingQuality}/5</span></div>
<div class="row"><span class="label">Lab Facilities</span><span class="value"><span class="stars">${stars(feedback.ratingLabFacilities)}</span> ${feedback.ratingLabFacilities}/5</span></div>
<div class="row"><span class="label">Study Material</span><span class="value"><span class="stars">${stars(feedback.ratingStudyMaterial)}</span> ${feedback.ratingStudyMaterial}/5</span></div>
<div class="row"><span class="label">Overall Rating</span><span class="value" style="color:#4f46e5;font-size:15px"><span class="stars">${stars(feedback.ratingOverall)}</span> ${feedback.ratingOverall}/5</span></div>
${feedback.comments ? `<div class="section-title">Your Comments</div><div class="comments">"${feedback.comments}"</div>` : ""}
</div>
<div class="footer">
<p>This is a computer-generated receipt. Save your Reference Number to track your feedback.</p>
<p style="margin-top:4px">Track at: CUPGS Feedback Portal &rarr; Track Feedback &rarr; Enter Reference ID</p>
</div>
</div>
<button class="save-btn" onclick="window.print()">Save as PDF / Print</button>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
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
