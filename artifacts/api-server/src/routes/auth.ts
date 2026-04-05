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

  res.json({
    ...safeData,
    courses,
    avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
    totalFeedbackCount: Number(avgResult?.cnt ?? 0),
  });
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
          id: feedbackTable.id,
          referenceId: feedbackTable.referenceId,
          ratingCourseContent: feedbackTable.ratingCourseContent,
          ratingTeachingQuality: feedbackTable.ratingTeachingQuality,
          ratingLabFacilities: feedbackTable.ratingLabFacilities,
          ratingStudyMaterial: feedbackTable.ratingStudyMaterial,
          ratingOverall: feedbackTable.ratingOverall,
          comments: feedbackTable.comments,
          isAnonymous: feedbackTable.isAnonymous,
          feedbackType: feedbackTable.feedbackType,
          studentYear: feedbackTable.studentYear,
          section: feedbackTable.section,
          createdAt: feedbackTable.createdAt,
        })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, course.id))
        .orderBy(desc(feedbackTable.createdAt));

      const cnt = feedbackRows.length;
      const avgOverall = cnt ? feedbackRows.reduce((s, f) => s + f.ratingOverall, 0) / cnt : null;
      const avgContent = cnt ? feedbackRows.reduce((s, f) => s + f.ratingCourseContent, 0) / cnt : null;
      const avgTeaching = cnt ? feedbackRows.reduce((s, f) => s + f.ratingTeachingQuality, 0) / cnt : null;
      const avgLab = cnt ? feedbackRows.reduce((s, f) => s + f.ratingLabFacilities, 0) / cnt : null;
      const avgMaterial = cnt ? feedbackRows.reduce((s, f) => s + f.ratingStudyMaterial, 0) / cnt : null;
      const comments = feedbackRows.filter(f => f.comments).map(f => f.comments as string);

      return {
        ...course,
        feedbackCount: cnt,
        avgOverall,
        avgCourseContent: avgContent,
        avgTeachingQuality: avgTeaching,
        avgLabFacilities: avgLab,
        avgStudyMaterial: avgMaterial,
        recentComments: comments.slice(0, 5),
        feedback: feedbackRows,
      };
    })
  );

  res.json({ courses: courseData });
});

export default router;
