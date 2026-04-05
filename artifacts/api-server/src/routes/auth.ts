import { Router, type IRouter } from "express";
import { db, facultyTable, departmentsTable, coursesTable, feedbackTable } from "@workspace/db";
import { eq, avg, count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/faculty-login", async (req, res): Promise<void> => {
  const { employeeId, pin } = req.body;
  if (!employeeId || !pin) {
    res.status(400).json({ error: "Employee ID and PIN are required" });
    return;
  }

  const [faculty] = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      employeeId: facultyTable.employeeId,
      qualification: facultyTable.qualification,
      specialization: facultyTable.specialization,
      departmentName: departmentsTable.name,
      departmentCode: departmentsTable.code,
      loginPin: facultyTable.loginPin,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(eq(facultyTable.employeeId, employeeId));

  if (!faculty) {
    res.status(401).json({ error: "Invalid Employee ID. Please check and try again." });
    return;
  }
  if (faculty.loginPin !== pin) {
    res.status(401).json({ error: "Incorrect PIN. Please try again." });
    return;
  }

  const courses = await db
    .select({ id: coursesTable.id, code: coursesTable.code, name: coursesTable.name, semester: coursesTable.semester })
    .from(coursesTable)
    .where(eq(coursesTable.facultyId, faculty.id));

  const [avgResult] = await db
    .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.facultyId, faculty.id));

  const { loginPin: _pin, ...safeData } = faculty;
  res.json({ ...safeData, courses, avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null, totalFeedbackCount: Number(avgResult?.cnt ?? 0) });
});

router.post("/auth/hod-login", async (req, res): Promise<void> => {
  const { employeeId, pin } = req.body;
  if (!employeeId || !pin) {
    res.status(400).json({ error: "HOD Employee ID and PIN are required" });
    return;
  }

  const [dept] = await db
    .select({
      id: departmentsTable.id,
      code: departmentsTable.code,
      name: departmentsTable.name,
      hodName: departmentsTable.hodName,
      hodEmployeeId: departmentsTable.hodEmployeeId,
      hodPin: departmentsTable.hodPin,
    })
    .from(departmentsTable)
    .where(eq(departmentsTable.hodEmployeeId, employeeId));

  if (!dept) {
    res.status(401).json({ error: "Invalid HOD Employee ID. Please check and try again." });
    return;
  }
  if (dept.hodPin !== pin) {
    res.status(401).json({ error: "Incorrect PIN. Please try again." });
    return;
  }

  const { hodPin: _pin, ...safeData } = dept;
  res.json(safeData);
});

router.post("/auth/admin-login", async (req, res): Promise<void> => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "bput@admin2025";
  if (password !== adminPassword) {
    res.status(401).json({ error: "Invalid admin password." });
    return;
  }
  res.json({ success: true, role: "admin" });
});

router.get("/faculty/:id/my-feedback", async (req, res): Promise<void> => {
  const facultyId = parseInt(req.params.id);
  if (isNaN(facultyId)) { res.status(400).json({ error: "Invalid faculty ID" }); return; }

  const courses = await db
    .select({ id: coursesTable.id, code: coursesTable.code, name: coursesTable.name, semester: coursesTable.semester, academicYear: coursesTable.academicYear })
    .from(coursesTable)
    .where(eq(coursesTable.facultyId, facultyId));

  const courseData = await Promise.all(
    courses.map(async (course) => {
      const feedbackRows = await db
        .select({
          ratingCourseContent: feedbackTable.ratingCourseContent,
          ratingTeachingQuality: feedbackTable.ratingTeachingQuality,
          ratingLabFacilities: feedbackTable.ratingLabFacilities,
          ratingStudyMaterial: feedbackTable.ratingStudyMaterial,
          ratingOverall: feedbackTable.ratingOverall,
          comments: feedbackTable.comments,
          studentYear: feedbackTable.studentYear,
          section: feedbackTable.section,
          createdAt: feedbackTable.createdAt,
        })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, course.id))
        .orderBy(desc(feedbackTable.createdAt));

      const cnt = feedbackRows.length;
      const calcAvg = (key: keyof typeof feedbackRows[0]) =>
        cnt ? feedbackRows.reduce((s, f) => s + (Number(f[key]) || 0), 0) / cnt : null;
      const comments = feedbackRows.filter(f => f.comments).map(f => f.comments as string);

      return {
        ...course,
        feedbackCount: cnt,
        avgOverall: calcAvg("ratingOverall"),
        avgCourseContent: calcAvg("ratingCourseContent"),
        avgTeachingQuality: calcAvg("ratingTeachingQuality"),
        avgLabFacilities: calcAvg("ratingLabFacilities"),
        avgStudyMaterial: calcAvg("ratingStudyMaterial"),
        recentComments: comments.slice(0, 5),
      };
    })
  );

  res.json({ courses: courseData });
});

router.get("/departments/:id/hod-report", async (req, res): Promise<void> => {
  const deptId = parseInt(req.params.id);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const [dept] = await db
    .select({ id: departmentsTable.id, name: departmentsTable.name, code: departmentsTable.code, hodName: departmentsTable.hodName })
    .from(departmentsTable)
    .where(eq(departmentsTable.id, deptId));

  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  const facultyList = await db
    .select({ id: facultyTable.id, name: facultyTable.name, designation: facultyTable.designation, employeeId: facultyTable.employeeId })
    .from(facultyTable)
    .where(eq(facultyTable.departmentId, deptId));

  const courses = await db
    .select({ id: coursesTable.id, code: coursesTable.code, name: coursesTable.name, semester: coursesTable.semester, facultyId: coursesTable.facultyId, academicYear: coursesTable.academicYear, credits: coursesTable.credits })
    .from(coursesTable)
    .where(eq(coursesTable.departmentId, deptId));

  const allFeedback = await db
    .select({
      courseId: feedbackTable.courseId,
      facultyId: feedbackTable.facultyId,
      ratingCourseContent: feedbackTable.ratingCourseContent,
      ratingTeachingQuality: feedbackTable.ratingTeachingQuality,
      ratingLabFacilities: feedbackTable.ratingLabFacilities,
      ratingStudyMaterial: feedbackTable.ratingStudyMaterial,
      ratingOverall: feedbackTable.ratingOverall,
      comments: feedbackTable.comments,
      section: feedbackTable.section,
      feedbackType: feedbackTable.feedbackType,
      createdAt: feedbackTable.createdAt,
    })
    .from(feedbackTable)
    .where(eq(feedbackTable.departmentId, deptId))
    .orderBy(desc(feedbackTable.createdAt));

  const calcAvg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const courseStats = courses.map(course => {
    const fb = allFeedback.filter(f => f.courseId === course.id);
    const facultyMember = facultyList.find(f => f.id === course.facultyId);
    return {
      ...course,
      facultyName: facultyMember?.name ?? "—",
      feedbackCount: fb.length,
      avgOverall: calcAvg(fb.map(f => f.ratingOverall)),
      avgCourseContent: calcAvg(fb.map(f => f.ratingCourseContent)),
      avgTeachingQuality: calcAvg(fb.map(f => f.ratingTeachingQuality)),
      avgLabFacilities: calcAvg(fb.map(f => f.ratingLabFacilities)),
      avgStudyMaterial: calcAvg(fb.map(f => f.ratingStudyMaterial)),
      recentComments: fb.filter(f => f.comments).map(f => f.comments as string).slice(0, 3),
    };
  });

  const facultyStats = facultyList.map(f => {
    const fb = allFeedback.filter(x => x.facultyId === f.id);
    const fCourses = courses.filter(c => c.facultyId === f.id);
    return {
      ...f,
      courseCount: fCourses.length,
      courseNames: fCourses.map(c => `${c.code}: ${c.name}`).join(", "),
      feedbackCount: fb.length,
      avgOverall: calcAvg(fb.map(x => x.ratingOverall)),
      avgCourseContent: calcAvg(fb.map(x => x.ratingCourseContent)),
      avgTeachingQuality: calcAvg(fb.map(x => x.ratingTeachingQuality)),
      avgLabFacilities: calcAvg(fb.map(x => x.ratingLabFacilities)),
      avgStudyMaterial: calcAvg(fb.map(x => x.ratingStudyMaterial)),
    };
  });

  const recentComments = allFeedback.filter(f => f.comments).slice(0, 10).map(f => ({
    comment: f.comments,
    courseCode: courses.find(c => c.id === f.courseId)?.code ?? "—",
    section: f.section,
    createdAt: f.createdAt,
  }));

  res.json({
    department: dept,
    summary: {
      totalFeedback: allFeedback.length,
      totalCourses: courses.length,
      totalFaculty: facultyList.length,
      avgOverall: calcAvg(allFeedback.map(f => f.ratingOverall)),
      avgCourseContent: calcAvg(allFeedback.map(f => f.ratingCourseContent)),
      avgTeachingQuality: calcAvg(allFeedback.map(f => f.ratingTeachingQuality)),
      avgLabFacilities: calcAvg(allFeedback.map(f => f.ratingLabFacilities)),
      avgStudyMaterial: calcAvg(allFeedback.map(f => f.ratingStudyMaterial)),
    },
    facultyStats,
    courseStats,
    recentComments,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
