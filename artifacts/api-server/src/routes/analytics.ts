import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows } from "@workspace/db";
import {
  GetDepartmentAnalyticsParams,
  GetDepartmentAnalyticsQueryParams,
  GetFacultyAnalyticsParams,
  GetTrendsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (req, res): Promise<void> => {
  const { count: totalFeedback } = await supabase.from("feedback").select("*", { count: "exact", head: true });
  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true });
  const { count: totalFaculty } = await supabase.from("faculty").select("*", { count: "exact", head: true });
  const { count: totalDepartments } = await supabase.from("departments").select("*", { count: "exact", head: true });
  const { count: activeWindows } = await supabase.from("feedback_windows").select("*", { count: "exact", head: true }).eq("is_active", true);

  const { data: allRatings } = await supabase
    .from("feedback")
    .select("rating_overall, rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material");

  const r = allRatings || [];
  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const { data: recentFeedbackRaw } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentFeedback = await Promise.all(
    (recentFeedbackRaw || []).map(async (fb: any) => {
      const { data: course } = await supabase.from("courses").select("name, code").eq("id", fb.course_id).single();
      const { data: dept } = await supabase.from("departments").select("name").eq("id", fb.department_id).single();
      let facultyName = null;
      if (fb.faculty_id) {
        const { data: fac } = await supabase.from("faculty").select("name").eq("id", fb.faculty_id).single();
        facultyName = fac?.name ?? null;
      }
      return {
        ...camelRow(fb),
        courseName: course?.name ?? null,
        courseCode: course?.code ?? null,
        departmentName: dept?.name ?? null,
        facultyName,
      };
    })
  );

  const { data: departments } = await supabase.from("departments").select("id, name");
  let topDepartment = "";
  let topDeptAvg = 0;
  for (const dept of departments || []) {
    const { data: deptFb } = await supabase.from("feedback").select("rating_overall").eq("department_id", dept.id);
    const vals = (deptFb || []).map((f: any) => f.rating_overall);
    const val = vals.length > 0 ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : 0;
    if (val > topDeptAvg) { topDeptAvg = val; topDepartment = dept.name; }
  }

  res.json({
    totalFeedback: totalFeedback ?? 0,
    totalCourses: totalCourses ?? 0,
    totalFaculty: totalFaculty ?? 0,
    totalDepartments: totalDepartments ?? 0,
    avgOverallRating: calcAvg(r.map((f: any) => f.rating_overall)),
    activeWindows: activeWindows ?? 0,
    feedbackThisMonth: totalFeedback ?? 0,
    topDepartment,
    recentFeedback,
    ratingBreakdown: {
      courseContent: calcAvg(r.map((f: any) => f.rating_course_content)),
      teachingQuality: calcAvg(r.map((f: any) => f.rating_teaching_quality)),
      labFacilities: calcAvg(r.map((f: any) => f.rating_lab_facilities)),
      studyMaterial: calcAvg(r.map((f: any) => f.rating_study_material)),
      overall: calcAvg(r.map((f: any) => f.rating_overall)),
    },
  });
});

router.get("/analytics/department/:departmentId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.departmentId) ? req.params.departmentId[0] : req.params.departmentId;
  const params = GetDepartmentAnalyticsParams.safeParse({ departmentId: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const qp = GetDepartmentAnalyticsQueryParams.safeParse(req.query);

  const { data: dept } = await supabase.from("departments").select("*").eq("id", params.data.departmentId).single();
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  let fbQuery = supabase.from("feedback").select("*").eq("department_id", params.data.departmentId);
  if (qp.success && qp.data.academicYear) fbQuery = fbQuery.eq("academic_year", qp.data.academicYear);
  const { data: fbData } = await fbQuery;
  const fb = fbData || [];

  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("id, code, name, department_id, faculty_id, semester, academic_year, credits")
    .eq("department_id", params.data.departmentId)
    .limit(10);

  const topCourses = await Promise.all(
    (coursesRaw || []).map(async (c: any) => {
      let facultyName = null;
      if (c.faculty_id) {
        const { data: fac } = await supabase.from("faculty").select("name").eq("id", c.faculty_id).single();
        facultyName = fac?.name ?? null;
      }
      const cfb = fb.filter((f: any) => f.course_id === c.id);
      return {
        ...camelRow(c),
        departmentName: dept.name,
        facultyName,
        avgRating: cfb.length > 0 ? calcAvg(cfb.map((f: any) => f.rating_overall)) : null,
        feedbackCount: cfb.length,
      };
    })
  );

  const { data: facultyRaw } = await supabase
    .from("faculty")
    .select("id, name, email, designation, department_id")
    .eq("department_id", params.data.departmentId);

  const facultyPerformance = (facultyRaw || []).map((f: any) => {
    const ffb = fb.filter((x: any) => x.faculty_id === f.id);
    return {
      ...camelRow(f),
      departmentName: dept.name,
      avgRating: ffb.length > 0 ? calcAvg(ffb.map((x: any) => x.rating_overall)) : null,
      totalFeedbackCount: ffb.length,
    };
  });

  res.json({
    departmentId: dept.id,
    departmentName: dept.name,
    totalFeedback: fb.length,
    avgRating: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_overall)) : 0,
    avgCourseContent: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_course_content)) : 0,
    avgTeachingQuality: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_teaching_quality)) : 0,
    avgLabFacilities: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_lab_facilities)) : 0,
    avgStudyMaterial: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_study_material)) : 0,
    topCourses,
    facultyPerformance,
  });
});

router.get("/analytics/faculty/:facultyId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.facultyId) ? req.params.facultyId[0] : req.params.facultyId;
  const params = GetFacultyAnalyticsParams.safeParse({ facultyId: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { data: faculty } = await supabase
    .from("faculty")
    .select("id, name, email, designation, department_id")
    .eq("id", params.data.facultyId)
    .single();

  if (!faculty) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { data: dept } = await supabase.from("departments").select("name").eq("id", faculty.department_id).single();

  const { data: fbData } = await supabase.from("feedback").select("*").eq("faculty_id", params.data.facultyId);
  const fb = fbData || [];
  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("id, code, name, department_id, faculty_id, semester, academic_year, credits")
    .eq("faculty_id", params.data.facultyId);

  const courses = (coursesRaw || []).map((c: any) => {
    const cfb = fb.filter((f: any) => f.course_id === c.id);
    return {
      ...camelRow(c),
      departmentName: dept?.name ?? null,
      facultyName: faculty.name,
      avgRating: cfb.length > 0 ? calcAvg(cfb.map((f: any) => f.rating_overall)) : null,
      feedbackCount: cfb.length,
    };
  });

  const recentComments = fb
    .filter((f: any) => f.comments && f.comments.trim() !== "")
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((f: any) => f.comments);

  res.json({
    facultyId: faculty.id,
    facultyName: faculty.name,
    designation: faculty.designation,
    departmentName: dept?.name ?? "",
    totalFeedback: fb.length,
    avgOverall: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_overall)) : 0,
    avgCourseContent: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_course_content)) : 0,
    avgTeachingQuality: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_teaching_quality)) : 0,
    avgLabFacilities: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_lab_facilities)) : 0,
    avgStudyMaterial: fb.length > 0 ? calcAvg(fb.map((f: any) => f.rating_study_material)) : 0,
    courses,
    recentComments,
  });
});

router.get("/analytics/trends", async (req, res): Promise<void> => {
  const params = GetTrendsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  let query = supabase
    .from("feedback")
    .select("academic_year, semester, rating_overall, rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material, department_id");

  if (params.data.departmentId) query = query.eq("department_id", params.data.departmentId);

  const { data: allFeedback } = await query;

  const grouped = new Map<string, { sum: number; count: number }>();
  for (const fb of allFeedback || []) {
    const key = `${fb.academic_year}|${fb.semester}`;
    const metric = params.data.metric ?? "overall";
    let value = fb.rating_overall;
    if (metric === "course_content") value = fb.rating_course_content;
    else if (metric === "teaching_quality") value = fb.rating_teaching_quality;
    else if (metric === "lab_facilities") value = fb.rating_lab_facilities;
    else if (metric === "study_material") value = fb.rating_study_material;

    const existing = grouped.get(key);
    if (existing) { existing.sum += value; existing.count++; }
    else { grouped.set(key, { sum: value, count: 1 }); }
  }

  const trends = Array.from(grouped.entries())
    .map(([key, { sum, count }]) => {
      const [academicYear, semStr] = key.split("|");
      const semester = parseInt(semStr, 10);
      return {
        academicYear, semester,
        avgRating: Math.round((sum / count) * 100) / 100,
        feedbackCount: count,
        label: `${academicYear} Sem ${semester}`,
      };
    })
    .sort((a, b) => a.academicYear !== b.academicYear ? a.academicYear.localeCompare(b.academicYear) : a.semester - b.semester);

  res.json(trends);
});

router.get("/analytics/top-rated", async (req, res): Promise<void> => {
  const { data: allFaculty } = await supabase
    .from("faculty")
    .select("id, name, email, designation, department_id, photo_url");

  const { data: allDepts } = await supabase.from("departments").select("id, name, code");
  const { data: allFb } = await supabase.from("feedback").select("faculty_id, course_id, rating_overall");
  const { data: allLikes } = await supabase.from("faculty_likes").select("faculty_id");

  const fb = allFb || [];
  const likes = allLikes || [];

  const facultyWithRatings = (allFaculty || []).map((f: any) => {
    const ffb = fb.filter((x: any) => x.faculty_id === f.id);
    const fLikes = likes.filter((x: any) => x.faculty_id === f.id);
    const dept = (allDepts || []).find((d: any) => d.id === f.department_id);
    const ratings = ffb.map((x: any) => x.rating_overall);
    return {
      ...camelRow(f),
      departmentName: dept?.name ?? null,
      departmentCode: dept?.code ?? null,
      avgRating: ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null,
      totalFeedbackCount: ratings.length,
      likeCount: fLikes.length,
    };
  });

  const topFaculty = facultyWithRatings
    .filter((f: any) => f.totalFeedbackCount > 0)
    .sort((a: any, b: any) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 5);

  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, code, name, department_id, faculty_id, semester, academic_year, credits");

  const coursesWithRatings = (allCourses || []).map((c: any) => {
    const cfb = fb.filter((x: any) => x.course_id === c.id);
    const dept = (allDepts || []).find((d: any) => d.id === c.department_id);
    const fac = (allFaculty || []).find((f: any) => f.id === c.faculty_id);
    const ratings = cfb.map((x: any) => x.rating_overall);
    return {
      ...camelRow(c),
      departmentName: dept?.name ?? null,
      facultyName: fac?.name ?? null,
      avgRating: ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null,
      feedbackCount: ratings.length,
    };
  });

  const topCourses = coursesWithRatings
    .filter((c: any) => c.feedbackCount > 0)
    .sort((a: any, b: any) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 5);

  res.json({ topFaculty, topCourses });
});

router.post("/faculty/:id/like", async (req, res): Promise<void> => {
  const facultyId = parseInt(req.params.id);
  const { sessionId } = req.body;
  if (!sessionId) { res.status(400).json({ error: "sessionId required" }); return; }

  const { data: existing } = await supabase
    .from("faculty_likes")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("session_id", sessionId);

  if (existing && existing.length > 0) {
    await supabase.from("faculty_likes").delete().eq("faculty_id", facultyId).eq("session_id", sessionId);
    const { count } = await supabase.from("faculty_likes").select("*", { count: "exact", head: true }).eq("faculty_id", facultyId);
    res.json({ liked: false, likeCount: count ?? 0 });
  } else {
    await supabase.from("faculty_likes").insert({ faculty_id: facultyId, session_id: sessionId });
    const { count } = await supabase.from("faculty_likes").select("*", { count: "exact", head: true }).eq("faculty_id", facultyId);
    res.json({ liked: true, likeCount: count ?? 0 });
  }
});

router.get("/faculty/:id/top-detail", async (req, res): Promise<void> => {
  const facultyId = parseInt(req.params.id);
  const sessionId = (req.query.sessionId as string) || "";

  const { data: faculty } = await supabase
    .from("faculty")
    .select("id, name, designation, department_id, photo_url")
    .eq("id", facultyId)
    .single();

  if (!faculty) { res.status(404).json({ error: "Faculty not found" }); return; }

  const { data: dept } = await supabase.from("departments").select("name, code").eq("id", faculty.department_id).single();

  const { data: fbData } = await supabase
    .from("feedback")
    .select("rating_overall, rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material, comments, course_id, created_at")
    .eq("faculty_id", facultyId);

  const fb = fbData || [];
  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const { data: commentsRaw } = await supabase
    .from("feedback")
    .select("comments, course_id, created_at, rating_overall")
    .eq("faculty_id", facultyId)
    .not("comments", "is", null)
    .neq("comments", "")
    .order("created_at", { ascending: false })
    .limit(20);

  const comments = await Promise.all(
    (commentsRaw || []).map(async (c: any) => {
      const { data: course } = await supabase.from("courses").select("code, name").eq("id", c.course_id).single();
      return {
        comment: c.comments,
        courseCode: course?.code ?? null,
        courseName: course?.name ?? null,
        createdAt: c.created_at,
        ratingOverall: c.rating_overall,
      };
    })
  );

  const { count: likeCount } = await supabase
    .from("faculty_likes")
    .select("*", { count: "exact", head: true })
    .eq("faculty_id", facultyId);

  let likedByMe = false;
  if (sessionId) {
    const { data: myLike } = await supabase
      .from("faculty_likes")
      .select("id")
      .eq("faculty_id", facultyId)
      .eq("session_id", sessionId);
    likedByMe = (myLike || []).length > 0;
  }

  let aiAnalysis = "";
  try {
    const commentTexts = comments.map(c => c.comment).filter(Boolean);
    if (commentTexts.length > 0) {
      const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      if (baseUrl && apiKey) {
        const avgOverall = calcAvg(fb.map((f: any) => f.rating_overall));
        const resp = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are an academic feedback analyst. Analyze student comments about a professor and explain in 3-4 concise sentences why this teacher is highly rated. Be specific, referencing themes from the comments. Write in a professional yet warm tone. Keep it brief." },
              { role: "user", content: `Professor: ${faculty.name} (${faculty.designation}, ${dept?.name})\n\nStudent Comments:\n${commentTexts.map((c: any, i: number) => `${i + 1}. "${c}"`).join("\n")}\n\nAverage Rating: ${avgOverall ? avgOverall.toFixed(1) : "N/A"}/5.0 from ${fb.length} reviews.\n\nAnalyze why this teacher is top-rated based on the feedback.` }
            ],
            max_completion_tokens: 300,
          }),
        });
        const data = await resp.json();
        aiAnalysis = data.choices?.[0]?.message?.content || "";
      }
    }
  } catch (e) {
    console.error("AI analysis error:", e);
  }

  res.json({
    faculty: {
      id: faculty.id,
      name: faculty.name,
      designation: faculty.designation,
      departmentName: dept?.name ?? null,
      departmentCode: dept?.code ?? null,
      photoUrl: faculty.photo_url,
    },
    ratings: {
      avgOverall: calcAvg(fb.map((f: any) => f.rating_overall)),
      avgContent: calcAvg(fb.map((f: any) => f.rating_course_content)),
      avgTeaching: calcAvg(fb.map((f: any) => f.rating_teaching_quality)),
      avgLab: calcAvg(fb.map((f: any) => f.rating_lab_facilities)),
      avgMaterial: calcAvg(fb.map((f: any) => f.rating_study_material)),
      totalFeedback: fb.length,
    },
    comments,
    likeCount: likeCount ?? 0,
    likedByMe,
    aiAnalysis,
  });
});

export default router;
