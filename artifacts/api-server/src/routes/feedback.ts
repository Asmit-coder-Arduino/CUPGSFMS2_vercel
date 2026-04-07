import { Router, type IRouter } from "express";
import { supabase, camelRow } from "@workspace/db";
import { randomUUID } from "crypto";
import {
  ListFeedbackQueryParams,
  GetFeedbackParams,
} from "@workspace/api-zod";
import { containsProfanity } from "../lib/profanityFilter";
import { z } from "zod";

const router: IRouter = Router();

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

async function enrichFeedback(fb: any) {
  const { data: course } = await supabase
    .from("courses")
    .select("name, code, semester, academic_year, department_id")
    .eq("id", fb.course_id)
    .single();

  let facultyName = null;
  if (fb.faculty_id) {
    const { data: fac } = await supabase.from("faculty").select("name").eq("id", fb.faculty_id).single();
    facultyName = fac?.name ?? null;
  }

  const { data: dept } = await supabase
    .from("departments")
    .select("name")
    .eq("id", fb.department_id)
    .single();

  return {
    ...camelRow(fb),
    courseName: course?.name ?? null,
    courseCode: course?.code ?? null,
    facultyName,
    departmentName: dept?.name ?? null,
  };
}

router.get("/feedback", async (req, res): Promise<void> => {
  const params = ListFeedbackQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  let query = supabase.from("feedback").select("*");
  if (params.data.courseId) query = query.eq("course_id", params.data.courseId);
  if (params.data.departmentId) query = query.eq("department_id", params.data.departmentId);
  if (params.data.facultyId) query = query.eq("faculty_id", params.data.facultyId);
  if (params.data.semester) query = query.eq("semester", params.data.semester);
  if (params.data.academicYear) query = query.eq("academic_year", params.data.academicYear);
  if (params.data.feedbackType) query = query.eq("feedback_type", params.data.feedbackType);

  const { data: feedbackList, error } = await query.order("created_at", { ascending: false }).limit(100);
  if (error) { res.status(500).json({ error: error.message }); return; }

  const enriched = await Promise.all((feedbackList || []).map(enrichFeedback));
  res.json(enriched.map(({ ipAddress, ...rest }: any) => rest));
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackExtended.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  if (parsed.data.comments && parsed.data.comments.trim().length > 0) {
    if (containsProfanity(parsed.data.comments)) {
      res.status(422).json({
        error: "Your feedback contains inappropriate language. Please keep your comments respectful and constructive.",
        code: "PROFANITY_DETECTED",
      });
      return;
    }
  }

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

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", parsed.data.courseId)
    .single();

  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  const { data: activeWindows } = await supabase
    .from("feedback_windows")
    .select("*")
    .eq("is_active", true);

  const now = new Date();
  const hasEligibleWindow = (activeWindows || []).some((w: any) => {
    const start = new Date(w.start_date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(w.end_date);
    end.setHours(23, 59, 59, 999);
    if (now < start || now > end) return false;
    const deptIds: number[] = (w.department_ids ?? []).map(Number);
    if (deptIds.length === 0) return true;
    return deptIds.includes(course.department_id);
  });

  if (!hasEligibleWindow) {
    res.status(403).json({ error: "No active feedback window is open for this department. Submission not allowed." });
    return;
  }

  const referenceId = `BPUT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress || "unknown";

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      reference_id: referenceId,
      course_id: parsed.data.courseId,
      faculty_id: parsed.data.facultyId ?? null,
      department_id: course.department_id,
      semester: course.semester,
      academic_year: course.academic_year,
      student_year: parsed.data.studentYear ?? null,
      section: parsed.data.section ?? null,
      feedback_type: parsed.data.feedbackType,
      rating_course_content: parsed.data.ratingCourseContent,
      rating_teaching_quality: parsed.data.ratingTeachingQuality,
      rating_lab_facilities: parsed.data.ratingLabFacilities,
      rating_study_material: parsed.data.ratingStudyMaterial,
      rating_overall: parsed.data.ratingOverall,
      comments: parsed.data.comments ?? null,
      custom_answers: parsed.data.customAnswers ?? null,
      is_anonymous: parsed.data.isAnonymous ?? true,
      ip_address: clientIp,
    })
    .select()
    .single();

  if (error || !feedback) { res.status(500).json({ error: error?.message || "Insert failed" }); return; }

  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  const enriched = await enrichFeedback(feedback);
  res.status(201).json({ ...enriched, serialNumber });
});

router.get("/feedback/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFeedbackParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (!feedback) { res.status(404).json({ error: "Feedback not found" }); return; }

  const enriched = await enrichFeedback(feedback);
  const { ipAddress, ...safeData } = enriched as any;
  res.json(safeData);
});

router.get("/feedback/track/:referenceId", async (req, res): Promise<void> => {
  const refId = req.params.referenceId;
  if (!refId) { res.status(400).json({ error: "Reference ID is required" }); return; }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("reference_id", refId)
    .single();

  if (!feedback) {
    res.json({
      found: false, referenceId: refId, status: "DELETED",
      message: "This feedback has been deleted or does not exist. It may have been removed by the HOD.",
    });
    return;
  }

  const enriched = await enrichFeedback(feedback);
  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  res.json({
    found: true, referenceId: refId, status: "ACTIVE",
    message: "Your feedback is active and recorded in the system.",
    serialNumber, submittedAt: feedback.created_at,
    courseName: enriched.courseName, courseCode: enriched.courseCode,
    facultyName: enriched.facultyName, departmentName: enriched.departmentName,
    ratingOverall: feedback.rating_overall,
  });
});

router.get("/feedback/receipt/:referenceId", async (req, res): Promise<void> => {
  const refId = req.params.referenceId;
  if (!refId) { res.status(400).json({ error: "Reference ID is required" }); return; }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("reference_id", refId)
    .single();

  if (!feedback) { res.status(404).json({ error: "Feedback not found" }); return; }

  const enriched = await enrichFeedback(feedback);
  const serialNumber = `CUPGS/FB/${String(feedback.id).padStart(5, "0")}`;
  const date = feedback.created_at ? new Date(feedback.created_at) : new Date();
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const stars = (n: number) => "\u2605".repeat(Math.round(n)) + "\u2606".repeat(5 - Math.round(n));

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CUPGS Feedback Receipt - ${refId}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f9fa;padding:16px}
.receipt{max-width:600px;margin:0 auto;background:#fff;border:2px solid #b45309;border-radius:12px;overflow:hidden}
.header{background:linear-gradient(135deg,#b45309,#d97706);color:#fff;padding:20px;text-align:center}
.header h1{font-size:18px;margin-bottom:4px}
.header p{font-size:11px;opacity:.85}
.body{padding:20px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px}
.row:last-child{border-bottom:none}
.label{color:#6b7280;font-weight:500}
.value{font-weight:600;color:#1f2937;text-align:right;max-width:60%}
.ref-box{background:#fffbeb;border:1px dashed #b45309;border-radius:8px;padding:14px;text-align:center;margin:14px 0}
.ref-box .id{font-size:16px;font-weight:800;color:#b45309;font-family:monospace;letter-spacing:1px}
.section-title{font-weight:700;font-size:12px;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px;padding-top:6px;border-top:2px solid #e5e7eb}
.stars{color:#f59e0b;font-size:14px;letter-spacing:2px}
.footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 20px;text-align:center;font-size:10px;color:#9ca3af}
.comments{background:#f9fafb;border-radius:6px;padding:10px;font-size:12px;color:#374151;margin-top:8px;font-style:italic}
.save-btn{display:block;margin:16px auto;background:#b45309;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
.save-btn:active{background:#92400e}
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
<div class="row"><span class="label">Submission</span><span class="value">Verified ✓</span></div>
<div class="section-title">Course & Faculty</div>
<div class="row"><span class="label">Department</span><span class="value">${enriched.departmentName || "N/A"}</span></div>
<div class="row"><span class="label">Course</span><span class="value">[${enriched.courseCode}] ${enriched.courseName}</span></div>
<div class="row"><span class="label">Faculty</span><span class="value">${enriched.facultyName || "Not Assigned"}</span></div>
<div class="section-title">Ratings Given</div>
<div class="row"><span class="label">Course Content</span><span class="value"><span class="stars">${stars(feedback.rating_course_content)}</span> ${feedback.rating_course_content}/5</span></div>
<div class="row"><span class="label">Teaching Quality</span><span class="value"><span class="stars">${stars(feedback.rating_teaching_quality)}</span> ${feedback.rating_teaching_quality}/5</span></div>
<div class="row"><span class="label">Lab Facilities</span><span class="value"><span class="stars">${stars(feedback.rating_lab_facilities)}</span> ${feedback.rating_lab_facilities}/5</span></div>
<div class="row"><span class="label">Study Material</span><span class="value"><span class="stars">${stars(feedback.rating_study_material)}</span> ${feedback.rating_study_material}/5</span></div>
<div class="row"><span class="label">Overall Rating</span><span class="value" style="color:#b45309;font-size:15px"><span class="stars">${stars(feedback.rating_overall)}</span> ${feedback.rating_overall}/5</span></div>
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
  if (isNaN(feedbackId)) { res.status(400).json({ error: "Invalid feedback ID" }); return; }

  const { hodEmployeeId, hodPin } = req.body;
  if (!hodEmployeeId || !hodPin) {
    res.status(400).json({ error: "HOD Employee ID and PIN are required for deletion" });
    return;
  }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", feedbackId)
    .single();

  if (!feedback) { res.status(404).json({ error: "Feedback not found" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("id, hod_employee_id, hod_pin")
    .eq("id", feedback.department_id)
    .single();

  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  if (dept.hod_employee_id !== hodEmployeeId) {
    res.status(403).json({ error: "You are not authorized to delete feedback from this department" });
    return;
  }
  if (dept.hod_pin !== hodPin) {
    res.status(401).json({ error: "Incorrect HOD PIN. Deletion requires valid credentials." });
    return;
  }

  await supabase.from("feedback").delete().eq("id", feedbackId);
  res.json({ success: true, message: "Feedback deleted successfully", deletedId: feedbackId });
});

export default router;
