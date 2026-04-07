import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows } from "@workspace/db";

const router: IRouter = Router();

router.post("/auth/faculty-login", async (req, res): Promise<void> => {
  const { employeeId, pin } = req.body;
  if (!employeeId || !pin) {
    res.status(400).json({ error: "Employee ID and PIN are required" });
    return;
  }

  const { data: faculty, error } = await supabase
    .from("faculty")
    .select("id, name, email, designation, department_id, employee_id, qualification, specialization, login_pin")
    .eq("employee_id", employeeId)
    .single();

  if (error || !faculty) {
    res.status(401).json({ error: "Invalid Employee ID. Please check and try again." });
    return;
  }
  if (faculty.login_pin !== pin) {
    res.status(401).json({ error: "Incorrect PIN. Please try again." });
    return;
  }

  const { data: dept } = await supabase
    .from("departments")
    .select("name, code")
    .eq("id", faculty.department_id)
    .single();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, code, name, semester")
    .eq("faculty_id", faculty.id);

  const { data: fbData } = await supabase
    .from("feedback")
    .select("rating_overall")
    .eq("faculty_id", faculty.id);

  const ratings = (fbData || []).map((r: any) => r.rating_overall);
  const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

  const { login_pin: _pin, ...safeData } = faculty;
  res.json({
    ...camelRow(safeData),
    departmentName: dept?.name ?? null,
    departmentCode: dept?.code ?? null,
    courses: camelRows(courses || []),
    avgRating,
    totalFeedbackCount: ratings.length,
  });
});

router.post("/auth/hod-login", async (req, res): Promise<void> => {
  const { employeeId, pin } = req.body;
  if (!employeeId || !pin) {
    res.status(400).json({ error: "HOD Employee ID and PIN are required" });
    return;
  }

  const { data: dept, error } = await supabase
    .from("departments")
    .select("id, code, name, hod_name, hod_employee_id, hod_pin")
    .eq("hod_employee_id", employeeId)
    .single();

  if (error || !dept) {
    res.status(401).json({ error: "Invalid HOD Employee ID. Please check and try again." });
    return;
  }
  if (dept.hod_pin !== pin) {
    res.status(401).json({ error: "Incorrect PIN. Please try again." });
    return;
  }

  const { hod_pin: _pin, ...safeData } = dept;
  res.json(camelRow(safeData));
});

router.post("/auth/admin-login", async (req, res): Promise<void> => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "BPUT_Admin@2025#Secure";
  if (password !== adminPassword) {
    res.status(401).json({ error: "Invalid admin password." });
    return;
  }
  res.json({ success: true, role: "admin" });
});

router.get("/faculty/:id/my-feedback", async (req, res): Promise<void> => {
  const facultyId = parseInt(req.params.id);
  if (isNaN(facultyId)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, code, name, semester, academic_year")
    .eq("faculty_id", facultyId);

  const courseData = await Promise.all(
    (courses || []).map(async (course: any) => {
      const { data: feedbackRows } = await supabase
        .from("feedback")
        .select("rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material, rating_overall, comments, student_year, section, created_at")
        .eq("course_id", course.id)
        .order("created_at", { ascending: false });

      const rows = feedbackRows || [];
      const cnt = rows.length;
      const calcAvg = (key: string) =>
        cnt ? rows.reduce((s: number, f: any) => s + (Number(f[key]) || 0), 0) / cnt : null;
      const comments = rows.filter((f: any) => f.comments).map((f: any) => f.comments as string);

      return {
        ...camelRow(course),
        feedbackCount: cnt,
        avgOverall: calcAvg("rating_overall"),
        avgCourseContent: calcAvg("rating_course_content"),
        avgTeachingQuality: calcAvg("rating_teaching_quality"),
        avgLabFacilities: calcAvg("rating_lab_facilities"),
        avgStudyMaterial: calcAvg("rating_study_material"),
        recentComments: comments.slice(0, 5),
      };
    })
  );

  res.json({ courses: courseData });
});

router.get("/departments/:id/hod-report", async (req, res): Promise<void> => {
  const deptId = parseInt(req.params.id);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("id, name, code, hod_name")
    .eq("id", deptId)
    .single();

  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  const { data: facultyList } = await supabase
    .from("faculty")
    .select("id, name, designation, employee_id")
    .eq("department_id", deptId);

  const { data: courses } = await supabase
    .from("courses")
    .select("id, code, name, semester, faculty_id, academic_year, credits")
    .eq("department_id", deptId);

  const { data: allFeedback } = await supabase
    .from("feedback")
    .select("course_id, faculty_id, rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material, rating_overall, comments, section, feedback_type, created_at")
    .eq("department_id", deptId)
    .order("created_at", { ascending: false });

  const fb = allFeedback || [];
  const fList = camelRows(facultyList || []) as any[];
  const cList = camelRows(courses || []) as any[];

  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const courseStats = cList.map(course => {
    const cfb = fb.filter((f: any) => f.course_id === course.id);
    const facultyMember = fList.find(f => f.id === course.facultyId);
    return {
      ...course,
      facultyName: facultyMember?.name ?? "—",
      feedbackCount: cfb.length,
      avgOverall: calcAvg(cfb.map((f: any) => f.rating_overall)),
      avgCourseContent: calcAvg(cfb.map((f: any) => f.rating_course_content)),
      avgTeachingQuality: calcAvg(cfb.map((f: any) => f.rating_teaching_quality)),
      avgLabFacilities: calcAvg(cfb.map((f: any) => f.rating_lab_facilities)),
      avgStudyMaterial: calcAvg(cfb.map((f: any) => f.rating_study_material)),
      recentComments: cfb.filter((f: any) => f.comments).map((f: any) => f.comments as string).slice(0, 3),
    };
  });

  const facultyStats = fList.map(f => {
    const ffb = fb.filter((x: any) => x.faculty_id === f.id);
    const fCourses = cList.filter(c => c.facultyId === f.id);
    return {
      ...f,
      courseCount: fCourses.length,
      courseNames: fCourses.map(c => `${c.code}: ${c.name}`).join(", "),
      feedbackCount: ffb.length,
      avgOverall: calcAvg(ffb.map((x: any) => x.rating_overall)),
      avgCourseContent: calcAvg(ffb.map((x: any) => x.rating_course_content)),
      avgTeachingQuality: calcAvg(ffb.map((x: any) => x.rating_teaching_quality)),
      avgLabFacilities: calcAvg(ffb.map((x: any) => x.rating_lab_facilities)),
      avgStudyMaterial: calcAvg(ffb.map((x: any) => x.rating_study_material)),
    };
  });

  const recentComments = fb.filter((f: any) => f.comments).slice(0, 10).map((f: any) => ({
    comment: f.comments,
    courseCode: cList.find(c => c.id === f.course_id)?.code ?? "—",
    section: f.section,
    createdAt: f.created_at,
  }));

  res.json({
    department: camelRow(dept),
    summary: {
      totalFeedback: fb.length,
      totalCourses: cList.length,
      totalFaculty: fList.length,
      avgOverall: calcAvg(fb.map((f: any) => f.rating_overall)),
      avgCourseContent: calcAvg(fb.map((f: any) => f.rating_course_content)),
      avgTeachingQuality: calcAvg(fb.map((f: any) => f.rating_teaching_quality)),
      avgLabFacilities: calcAvg(fb.map((f: any) => f.rating_lab_facilities)),
      avgStudyMaterial: calcAvg(fb.map((f: any) => f.rating_study_material)),
    },
    facultyStats,
    courseStats,
    recentComments,
    generatedAt: new Date().toISOString(),
  });
});

router.get("/admin/full-report", async (req, res): Promise<void> => {
  const { data: departments } = await supabase.from("departments").select("*").order("code");
  const { data: allFeedback } = await supabase
    .from("feedback")
    .select("id, course_id, faculty_id, department_id, rating_course_content, rating_teaching_quality, rating_lab_facilities, rating_study_material, rating_overall, comments, section, created_at")
    .order("created_at", { ascending: false });
  const { data: allFaculty } = await supabase
    .from("faculty")
    .select("id, name, designation, employee_id, department_id");
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, code, name, semester, department_id, faculty_id, academic_year");

  const depts = camelRows(departments || []) as any[];
  const fb = allFeedback || [];
  const fac = camelRows(allFaculty || []) as any[];
  const crs = camelRows(allCourses || []) as any[];

  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const deptStats = depts.map(dept => {
    const dfb = fb.filter((f: any) => f.department_id === dept.id);
    const faculty = fac.filter(f => f.departmentId === dept.id);
    const courses = crs.filter(c => c.departmentId === dept.id);

    const facultyStats = faculty.map(f => {
      const ffb = dfb.filter((x: any) => x.faculty_id === f.id);
      return {
        ...f,
        feedbackCount: ffb.length,
        avgOverall: calcAvg(ffb.map((x: any) => x.rating_overall)),
        avgCourseContent: calcAvg(ffb.map((x: any) => x.rating_course_content)),
        avgTeachingQuality: calcAvg(ffb.map((x: any) => x.rating_teaching_quality)),
        avgLabFacilities: calcAvg(ffb.map((x: any) => x.rating_lab_facilities)),
        avgStudyMaterial: calcAvg(ffb.map((x: any) => x.rating_study_material)),
      };
    }).sort((a, b) => (b.avgOverall ?? 0) - (a.avgOverall ?? 0));

    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      hodName: dept.hodName,
      totalFaculty: faculty.length,
      totalCourses: courses.length,
      totalFeedback: dfb.length,
      avgOverall: calcAvg(dfb.map((f: any) => f.rating_overall)),
      avgCourseContent: calcAvg(dfb.map((f: any) => f.rating_course_content)),
      avgTeachingQuality: calcAvg(dfb.map((f: any) => f.rating_teaching_quality)),
      avgLabFacilities: calcAvg(dfb.map((f: any) => f.rating_lab_facilities)),
      avgStudyMaterial: calcAvg(dfb.map((f: any) => f.rating_study_material)),
      facultyStats,
    };
  });

  const topFaculty = fac
    .map(f => {
      const ffb = fb.filter((x: any) => x.faculty_id === f.id);
      const dept = depts.find(d => d.id === f.departmentId);
      return {
        ...f,
        departmentCode: dept?.code ?? "—",
        feedbackCount: ffb.length,
        avgOverall: calcAvg(ffb.map((x: any) => x.rating_overall)),
      };
    })
    .filter(f => f.feedbackCount > 0)
    .sort((a, b) => (b.avgOverall ?? 0) - (a.avgOverall ?? 0))
    .slice(0, 10);

  const recentComments = fb.filter((f: any) => f.comments).slice(0, 20).map((f: any) => ({
    comment: f.comments,
    courseCode: crs.find(c => c.id === f.course_id)?.code ?? "—",
    deptCode: depts.find(d => d.id === f.department_id)?.code ?? "—",
    createdAt: f.created_at,
  }));

  res.json({
    overall: {
      totalFeedback: fb.length,
      totalDepartments: depts.length,
      totalFaculty: fac.length,
      totalCourses: crs.length,
      avgOverall: calcAvg(fb.map((f: any) => f.rating_overall)),
      avgCourseContent: calcAvg(fb.map((f: any) => f.rating_course_content)),
      avgTeachingQuality: calcAvg(fb.map((f: any) => f.rating_teaching_quality)),
      avgLabFacilities: calcAvg(fb.map((f: any) => f.rating_lab_facilities)),
      avgStudyMaterial: calcAvg(fb.map((f: any) => f.rating_study_material)),
    },
    departments: deptStats,
    topFaculty,
    recentComments,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
