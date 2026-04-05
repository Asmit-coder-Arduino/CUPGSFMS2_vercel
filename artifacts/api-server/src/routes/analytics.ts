import { Router, type IRouter } from "express";
import {
  db,
  feedbackTable,
  coursesTable,
  facultyTable,
  departmentsTable,
} from "@workspace/db";
import { eq, avg, count, desc, and } from "drizzle-orm";
import {
  GetDepartmentAnalyticsParams,
  GetDepartmentAnalyticsQueryParams,
  GetFacultyAnalyticsParams,
  GetTrendsQueryParams,
} from "@workspace/api-zod";
import { windowsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (req, res): Promise<void> => {
  const [totalFeedbackRow] = await db.select({ cnt: count() }).from(feedbackTable);
  const [totalCoursesRow] = await db.select({ cnt: count() }).from(coursesTable);
  const [totalFacultyRow] = await db.select({ cnt: count() }).from(facultyTable);
  const [totalDeptRow] = await db.select({ cnt: count() }).from(departmentsTable);
  const [avgRow] = await db.select({ avg: avg(feedbackTable.ratingOverall) }).from(feedbackTable);
  const [activeWindowsRow] = await db
    .select({ cnt: count() })
    .from(windowsTable)
    .where(eq(windowsTable.isActive, true));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthRow] = await db
    .select({ cnt: count() })
    .from(feedbackTable);

  const [avgCC] = await db.select({ avg: avg(feedbackTable.ratingCourseContent) }).from(feedbackTable);
  const [avgTQ] = await db.select({ avg: avg(feedbackTable.ratingTeachingQuality) }).from(feedbackTable);
  const [avgLF] = await db.select({ avg: avg(feedbackTable.ratingLabFacilities) }).from(feedbackTable);
  const [avgSM] = await db.select({ avg: avg(feedbackTable.ratingStudyMaterial) }).from(feedbackTable);
  const [avgOA] = await db.select({ avg: avg(feedbackTable.ratingOverall) }).from(feedbackTable);

  const recentFeedbackRaw = await db
    .select()
    .from(feedbackTable)
    .orderBy(desc(feedbackTable.createdAt))
    .limit(5);

  const recentFeedback = await Promise.all(
    recentFeedbackRaw.map(async (fb) => {
      const [course] = await db
        .select({ name: coursesTable.name, code: coursesTable.code })
        .from(coursesTable)
        .where(eq(coursesTable.id, fb.courseId));
      const [dept] = await db
        .select({ name: departmentsTable.name })
        .from(departmentsTable)
        .where(eq(departmentsTable.id, fb.departmentId));
      const [faculty] = fb.facultyId
        ? await db
            .select({ name: facultyTable.name })
            .from(facultyTable)
            .where(eq(facultyTable.id, fb.facultyId))
        : [null];
      return {
        ...fb,
        courseName: course?.name ?? null,
        courseCode: course?.code ?? null,
        departmentName: dept?.name ?? null,
        facultyName: faculty?.name ?? null,
      };
    })
  );

  const departments = await db.select().from(departmentsTable);
  let topDepartment = "";
  let topDeptAvg = 0;
  for (const dept of departments) {
    const [r] = await db
      .select({ avg: avg(feedbackTable.ratingOverall) })
      .from(feedbackTable)
      .where(eq(feedbackTable.departmentId, dept.id));
    const val = r?.avg ? parseFloat(r.avg) : 0;
    if (val > topDeptAvg) {
      topDeptAvg = val;
      topDepartment = dept.name;
    }
  }

  res.json({
    totalFeedback: Number(totalFeedbackRow?.cnt ?? 0),
    totalCourses: Number(totalCoursesRow?.cnt ?? 0),
    totalFaculty: Number(totalFacultyRow?.cnt ?? 0),
    totalDepartments: Number(totalDeptRow?.cnt ?? 0),
    avgOverallRating: avgRow?.avg ? parseFloat(avgRow.avg) : 0,
    activeWindows: Number(activeWindowsRow?.cnt ?? 0),
    feedbackThisMonth: Number(monthRow?.cnt ?? 0),
    topDepartment,
    recentFeedback,
    ratingBreakdown: {
      courseContent: avgCC?.avg ? parseFloat(avgCC.avg) : 0,
      teachingQuality: avgTQ?.avg ? parseFloat(avgTQ.avg) : 0,
      labFacilities: avgLF?.avg ? parseFloat(avgLF.avg) : 0,
      studyMaterial: avgSM?.avg ? parseFloat(avgSM.avg) : 0,
      overall: avgOA?.avg ? parseFloat(avgOA.avg) : 0,
    },
  });
});

router.get("/analytics/department/:departmentId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.departmentId)
    ? req.params.departmentId[0]
    : req.params.departmentId;
  const params = GetDepartmentAnalyticsParams.safeParse({ departmentId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const qp = GetDepartmentAnalyticsQueryParams.safeParse(req.query);

  const [dept] = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, params.data.departmentId));

  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  const conditions = [eq(feedbackTable.departmentId, params.data.departmentId)];
  if (qp.success && qp.data.academicYear) {
    conditions.push(eq(feedbackTable.academicYear, qp.data.academicYear));
  }

  const [avgData] = await db
    .select({
      avgRating: avg(feedbackTable.ratingOverall),
      avgCC: avg(feedbackTable.ratingCourseContent),
      avgTQ: avg(feedbackTable.ratingTeachingQuality),
      avgLF: avg(feedbackTable.ratingLabFacilities),
      avgSM: avg(feedbackTable.ratingStudyMaterial),
      total: count(),
    })
    .from(feedbackTable)
    .where(and(...conditions));

  const coursesRaw = await db
    .select({
      id: coursesTable.id,
      code: coursesTable.code,
      name: coursesTable.name,
      departmentId: coursesTable.departmentId,
      facultyId: coursesTable.facultyId,
      semester: coursesTable.semester,
      academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
      facultyName: facultyTable.name,
    })
    .from(coursesTable)
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id))
    .where(eq(coursesTable.departmentId, params.data.departmentId))
    .limit(10);

  const topCourses = await Promise.all(
    coursesRaw.map(async (c) => {
      const [r] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, c.id));
      return {
        ...c,
        departmentName: dept.name,
        avgRating: r?.avg ? parseFloat(r.avg) : null,
        feedbackCount: Number(r?.cnt ?? 0),
      };
    })
  );

  const facultyRaw = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
    })
    .from(facultyTable)
    .where(eq(facultyTable.departmentId, params.data.departmentId));

  const facultyPerformance = await Promise.all(
    facultyRaw.map(async (f) => {
      const [r] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.facultyId, f.id));
      return {
        ...f,
        departmentName: dept.name,
        avgRating: r?.avg ? parseFloat(r.avg) : null,
        totalFeedbackCount: Number(r?.cnt ?? 0),
      };
    })
  );

  res.json({
    departmentId: dept.id,
    departmentName: dept.name,
    totalFeedback: Number(avgData?.total ?? 0),
    avgRating: avgData?.avgRating ? parseFloat(avgData.avgRating) : 0,
    avgCourseContent: avgData?.avgCC ? parseFloat(avgData.avgCC) : 0,
    avgTeachingQuality: avgData?.avgTQ ? parseFloat(avgData.avgTQ) : 0,
    avgLabFacilities: avgData?.avgLF ? parseFloat(avgData.avgLF) : 0,
    avgStudyMaterial: avgData?.avgSM ? parseFloat(avgData.avgSM) : 0,
    topCourses,
    facultyPerformance,
  });
});

router.get("/analytics/faculty/:facultyId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.facultyId) ? req.params.facultyId[0] : req.params.facultyId;
  const params = GetFacultyAnalyticsParams.safeParse({ facultyId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [faculty] = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id))
    .where(eq(facultyTable.id, params.data.facultyId));

  if (!faculty) {
    res.status(404).json({ error: "Faculty not found" });
    return;
  }

  const [avgData] = await db
    .select({
      avgOverall: avg(feedbackTable.ratingOverall),
      avgCC: avg(feedbackTable.ratingCourseContent),
      avgTQ: avg(feedbackTable.ratingTeachingQuality),
      avgLF: avg(feedbackTable.ratingLabFacilities),
      avgSM: avg(feedbackTable.ratingStudyMaterial),
      total: count(),
    })
    .from(feedbackTable)
    .where(eq(feedbackTable.facultyId, params.data.facultyId));

  const coursesRaw = await db
    .select({
      id: coursesTable.id,
      code: coursesTable.code,
      name: coursesTable.name,
      departmentId: coursesTable.departmentId,
      facultyId: coursesTable.facultyId,
      semester: coursesTable.semester,
      academicYear: coursesTable.academicYear,
      credits: coursesTable.credits,
    })
    .from(coursesTable)
    .where(eq(coursesTable.facultyId, params.data.facultyId));

  const courses = await Promise.all(
    coursesRaw.map(async (c) => {
      const [r] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, c.id));
      return {
        ...c,
        departmentName: faculty.departmentName,
        facultyName: faculty.name,
        avgRating: r?.avg ? parseFloat(r.avg) : null,
        feedbackCount: Number(r?.cnt ?? 0),
      };
    })
  );

  const recentCommentsRaw = await db
    .select({ comments: feedbackTable.comments })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.facultyId, params.data.facultyId)))
    .orderBy(desc(feedbackTable.createdAt))
    .limit(5);

  const recentComments = recentCommentsRaw
    .map((r) => r.comments)
    .filter((c): c is string => c !== null && c.trim() !== "");

  res.json({
    facultyId: faculty.id,
    facultyName: faculty.name,
    designation: faculty.designation,
    departmentName: faculty.departmentName ?? "",
    totalFeedback: Number(avgData?.total ?? 0),
    avgOverall: avgData?.avgOverall ? parseFloat(avgData.avgOverall) : 0,
    avgCourseContent: avgData?.avgCC ? parseFloat(avgData.avgCC) : 0,
    avgTeachingQuality: avgData?.avgTQ ? parseFloat(avgData.avgTQ) : 0,
    avgLabFacilities: avgData?.avgLF ? parseFloat(avgData.avgLF) : 0,
    avgStudyMaterial: avgData?.avgSM ? parseFloat(avgData.avgSM) : 0,
    courses,
    recentComments,
  });
});

router.get("/analytics/trends", async (req, res): Promise<void> => {
  const params = GetTrendsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const allFeedback = await db
    .select({
      academicYear: feedbackTable.academicYear,
      semester: feedbackTable.semester,
      ratingOverall: feedbackTable.ratingOverall,
      ratingCourseContent: feedbackTable.ratingCourseContent,
      ratingTeachingQuality: feedbackTable.ratingTeachingQuality,
      ratingLabFacilities: feedbackTable.ratingLabFacilities,
      ratingStudyMaterial: feedbackTable.ratingStudyMaterial,
      departmentId: feedbackTable.departmentId,
    })
    .from(feedbackTable)
    .where(
      params.data.departmentId
        ? eq(feedbackTable.departmentId, params.data.departmentId)
        : undefined
    );

  const grouped = new Map<string, { sum: number; count: number }>();
  for (const fb of allFeedback) {
    const key = `${fb.academicYear}|${fb.semester}`;
    const metric = params.data.metric ?? "overall";
    let value = fb.ratingOverall;
    if (metric === "course_content") value = fb.ratingCourseContent;
    else if (metric === "teaching_quality") value = fb.ratingTeachingQuality;
    else if (metric === "lab_facilities") value = fb.ratingLabFacilities;
    else if (metric === "study_material") value = fb.ratingStudyMaterial;

    const existing = grouped.get(key);
    if (existing) {
      existing.sum += value;
      existing.count++;
    } else {
      grouped.set(key, { sum: value, count: 1 });
    }
  }

  const trends = Array.from(grouped.entries())
    .map(([key, { sum, count }]) => {
      const [academicYear, semStr] = key.split("|");
      const semester = parseInt(semStr, 10);
      return {
        academicYear,
        semester,
        avgRating: Math.round((sum / count) * 100) / 100,
        feedbackCount: count,
        label: `${academicYear} Sem ${semester}`,
      };
    })
    .sort((a, b) => {
      if (a.academicYear !== b.academicYear) return a.academicYear.localeCompare(b.academicYear);
      return a.semester - b.semester;
    });

  res.json(trends);
});

router.get("/analytics/top-rated", async (req, res): Promise<void> => {
  const allFaculty = await db
    .select({
      id: facultyTable.id,
      name: facultyTable.name,
      email: facultyTable.email,
      designation: facultyTable.designation,
      departmentId: facultyTable.departmentId,
      departmentName: departmentsTable.name,
    })
    .from(facultyTable)
    .leftJoin(departmentsTable, eq(facultyTable.departmentId, departmentsTable.id));

  const facultyWithRatings = await Promise.all(
    allFaculty.map(async (f) => {
      const [r] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.facultyId, f.id));
      return {
        ...f,
        avgRating: r?.avg ? parseFloat(r.avg) : null,
        totalFeedbackCount: Number(r?.cnt ?? 0),
      };
    })
  );

  const topFaculty = facultyWithRatings
    .filter((f) => f.totalFeedbackCount > 0)
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 5);

  const allCourses = await db
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
    .leftJoin(facultyTable, eq(coursesTable.facultyId, facultyTable.id));

  const coursesWithRatings = await Promise.all(
    allCourses.map(async (c) => {
      const [r] = await db
        .select({ avg: avg(feedbackTable.ratingOverall), cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.courseId, c.id));
      return {
        ...c,
        avgRating: r?.avg ? parseFloat(r.avg) : null,
        feedbackCount: Number(r?.cnt ?? 0),
      };
    })
  );

  const topCourses = coursesWithRatings
    .filter((c) => c.feedbackCount > 0)
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, 5);

  res.json({ topFaculty, topCourses });
});

export default router;
