import { Router, type IRouter } from "express";
import { db, departmentsTable, facultyTable, coursesTable, feedbackTable } from "@workspace/db";
import { avg, count, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/departments", async (req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.code);

  const result = await Promise.all(
    departments.map(async (dept) => {
      const [facultyCount] = await db
        .select({ count: count() })
        .from(facultyTable)
        .where(eq(facultyTable.departmentId, dept.id));

      const [courseCount] = await db
        .select({ count: count() })
        .from(coursesTable)
        .where(eq(coursesTable.departmentId, dept.id));

      const [avgResult] = await db
        .select({ avg: avg(feedbackTable.ratingOverall) })
        .from(feedbackTable)
        .where(eq(feedbackTable.departmentId, dept.id));

      const { hodPin: _hp, ...safeDept } = dept;
      return {
        ...safeDept,
        totalFaculty: facultyCount?.count ?? 0,
        totalCourses: courseCount?.count ?? 0,
        avgRating: avgResult?.avg ? parseFloat(avgResult.avg) : null,
      };
    })
  );

  res.json(result);
});

export default router;
