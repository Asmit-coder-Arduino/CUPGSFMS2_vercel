import { Router, type IRouter } from "express";
import { db, feedbackTable, facultyTable, departmentsTable, coursesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const analysisCache = new Map<number, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many AI analysis requests. Please try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const defaultAnalysisFields = {
  summary: "",
  strengths: [] as string[],
  improvements: [] as string[],
  overallSentiment: "neutral",
  teachingStyle: "",
  studentSatisfaction: "moderate",
  recommendation: "",
  commentsSummary: "",
  ratingTrend: "",
};

const defaultAvgRatings = {
  courseContent: "0.00",
  teachingQuality: "0.00",
  labFacilities: "0.00",
  studyMaterial: "0.00",
  overall: "0.00",
};

router.get("/faculty/:id/ai-analysis", aiRateLimit, async (req, res): Promise<void> => {
  const facultyId = parseInt(req.params.id, 10);
  if (isNaN(facultyId)) {
    res.status(400).json({ error: "Invalid faculty ID" });
    return;
  }

  const cached = analysisCache.get(facultyId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.json(cached.data);
    return;
  }

  const [faculty] = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(eq(facultyTable.id, facultyId));

  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  const feedbacks = await db
    .select({
      ratingCourseContent: feedbackTable.ratingCourseContent,
      ratingTeachingQuality: feedbackTable.ratingTeachingQuality,
      ratingLabFacilities: feedbackTable.ratingLabFacilities,
      ratingStudyMaterial: feedbackTable.ratingStudyMaterial,
      ratingOverall: feedbackTable.ratingOverall,
      comments: feedbackTable.comments,
      courseName: coursesTable.name,
      courseCode: coursesTable.code,
      createdAt: feedbackTable.createdAt,
    })
    .from(feedbackTable)
    .leftJoin(coursesTable, eq(feedbackTable.courseId, coursesTable.id))
    .where(eq(feedbackTable.facultyId, facultyId))
    .orderBy(desc(feedbackTable.createdAt))
    .limit(100);

  if (feedbacks.length === 0) {
    res.json({
      facultyName: faculty.name,
      designation: faculty.designation,
      department: faculty.departmentName,
      totalFeedbacks: 0,
      totalComments: 0,
      avgRatings: defaultAvgRatings,
      courses: [],
      ...defaultAnalysisFields,
      summary: "No feedback received yet. AI analysis will be available once students submit feedback.",
    });
    return;
  }

  const comments = feedbacks
    .filter(f => f.comments && f.comments.trim())
    .map(f => f.comments!.trim());

  const avgRatings = {
    courseContent: (feedbacks.reduce((s, f) => s + f.ratingCourseContent, 0) / feedbacks.length).toFixed(2),
    teachingQuality: (feedbacks.reduce((s, f) => s + f.ratingTeachingQuality, 0) / feedbacks.length).toFixed(2),
    labFacilities: (feedbacks.reduce((s, f) => s + f.ratingLabFacilities, 0) / feedbacks.length).toFixed(2),
    studyMaterial: (feedbacks.reduce((s, f) => s + f.ratingStudyMaterial, 0) / feedbacks.length).toFixed(2),
    overall: (feedbacks.reduce((s, f) => s + f.ratingOverall, 0) / feedbacks.length).toFixed(2),
  };

  const courses = [...new Set(feedbacks.map(f => `${f.courseCode} - ${f.courseName}`).filter(Boolean))];

  const prompt = `You are an academic feedback analyst for CUPGS, BPUT Rourkela (a university in Odisha, India). Analyze the following faculty feedback data and provide a comprehensive, professional assessment.

Faculty: ${faculty.name}
Designation: ${faculty.designation}
Department: ${faculty.departmentName}
Total Feedbacks: ${feedbacks.length}
Courses: ${courses.join(", ")}

Average Ratings (out of 5):
- Course Content: ${avgRatings.courseContent}
- Teaching Quality: ${avgRatings.teachingQuality}
- Lab Facilities: ${avgRatings.labFacilities}
- Study Material: ${avgRatings.studyMaterial}
- Overall: ${avgRatings.overall}

${comments.length > 0 ? `Student Comments (${comments.length} comments):\n${comments.slice(0, 30).map((c, i) => `${i + 1}. "${c}"`).join("\n")}` : "No student comments available."}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "summary": "A 2-3 sentence professional summary of the faculty's performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area for improvement 1", "area for improvement 2"],
  "overallSentiment": "positive" or "neutral" or "negative",
  "teachingStyle": "Brief description of perceived teaching style based on ratings and comments",
  "studentSatisfaction": "high" or "moderate" or "low",
  "recommendation": "A brief professional recommendation for the faculty member",
  "commentsSummary": "Summary of what students are saying in their comments (if comments exist)",
  "ratingTrend": "Brief analysis of the rating pattern across different parameters"
}`;

  let openai;
  try {
    const mod = await import("@workspace/integrations-openai-ai-server");
    openai = mod.openai;
  } catch {
    res.status(503).json({ error: "AI service is not configured" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: "You are an academic feedback analyst. Respond only with valid JSON, no markdown formatting." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        ...defaultAnalysisFields,
        summary: content,
      };
    }

    const result = {
      facultyName: faculty.name,
      designation: faculty.designation,
      department: faculty.departmentName,
      totalFeedbacks: feedbacks.length,
      totalComments: comments.length,
      avgRatings,
      courses,
      ...defaultAnalysisFields,
      ...analysis,
    };

    analysisCache.set(facultyId, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (err: any) {
    console.error("AI analysis error:", err);
    res.status(500).json({ error: "Failed to generate AI analysis" });
  }
});

export default router;
