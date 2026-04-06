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

router.patch("/departments/:id", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD || "bput@admin2025";
  const authHeader = req.headers["x-admin-password"] as string | undefined;
  if (!authHeader || authHeader !== adminPassword) {
    res.status(403).json({ error: "Admin authentication required" });
    return;
  }

  const deptId = parseInt(req.params.id);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { hodName, hodEmployeeId, hodPin, name, code } = req.body;
  const updates: Record<string, unknown> = {};

  if (hodName !== undefined) {
    if (typeof hodName !== "string" || hodName.trim().length < 2 || hodName.trim().length > 100) {
      res.status(400).json({ error: "HOD name must be 2-100 characters" }); return;
    }
    updates.hodName = hodName.trim();
  }
  if (hodEmployeeId !== undefined) {
    if (typeof hodEmployeeId !== "string" || hodEmployeeId.trim().length < 3 || hodEmployeeId.trim().length > 50) {
      res.status(400).json({ error: "HOD Employee ID must be 3-50 characters" }); return;
    }
    updates.hodEmployeeId = hodEmployeeId.trim();
  }
  if (hodPin !== undefined) {
    if (typeof hodPin !== "string" || hodPin.trim().length < 4 || hodPin.trim().length > 50) {
      res.status(400).json({ error: "HOD PIN must be 4-50 characters" }); return;
    }
    updates.hodPin = hodPin.trim();
  }
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({ error: "Department name must be 2-100 characters" }); return;
    }
    updates.name = name.trim();
  }
  if (code !== undefined) {
    if (typeof code !== "string" || code.trim().length < 2 || code.trim().length > 10) {
      res.status(400).json({ error: "Department code must be 2-10 characters" }); return;
    }
    updates.code = code.trim();
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [updated] = await db
    .update(departmentsTable)
    .set(updates)
    .where(eq(departmentsTable.id, deptId))
    .returning();

  if (!updated) { res.status(404).json({ error: "Department not found" }); return; }

  const { hodPin: _hp, ...safe } = updated;
  res.json(safe);
});

router.get("/departments/:id", async (req, res): Promise<void> => {
  const deptId = parseInt(req.params.id);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, deptId));
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  const { hodPin: _hp, ...safe } = dept;
  res.json(safe);
});

export default router;
