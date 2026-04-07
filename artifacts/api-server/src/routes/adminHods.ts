import { Router, type IRouter } from "express";
import { db, departmentsTable, facultyTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function verifyAdmin(req: any, res: any): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "BPUT_Admin@2025#Secure";
  const pw = req.headers["x-admin-password"] as string;
  if (pw !== adminPassword) {
    res.status(401).json({ error: "Admin authentication required" });
    return false;
  }
  return true;
}

router.get("/admin/hods", async (req, res): Promise<void> => {
  if (!verifyAdmin(req, res)) return;

  const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.code);

  const hodsWithFaculty = await Promise.all(
    departments.map(async (dept) => {
      const faculty = await db
        .select({ id: facultyTable.id, name: facultyTable.name, designation: facultyTable.designation, employeeId: facultyTable.employeeId })
        .from(facultyTable)
        .where(eq(facultyTable.departmentId, dept.id));

      return {
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        hodName: dept.hodName,
        hodEmployeeId: dept.hodEmployeeId,
        hodPin: dept.hodPin,
        facultyList: faculty,
      };
    })
  );

  res.json(hodsWithFaculty);
});

router.put("/admin/hods/:deptId", async (req, res): Promise<void> => {
  if (!verifyAdmin(req, res)) return;

  const deptId = parseInt(req.params.deptId);
  if (isNaN(deptId)) {
    res.status(400).json({ error: "Invalid department ID" });
    return;
  }

  const { hodName, hodEmployeeId, hodPin } = req.body;

  if (!hodName || !hodEmployeeId || !hodPin) {
    res.status(400).json({ error: "hodName, hodEmployeeId, and hodPin are all required" });
    return;
  }

  const [existing] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, deptId));
  if (!existing) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  if (hodEmployeeId !== existing.hodEmployeeId) {
    const [conflict] = await db
      .select({ id: departmentsTable.id })
      .from(departmentsTable)
      .where(eq(departmentsTable.hodEmployeeId, hodEmployeeId));
    if (conflict && conflict.id !== deptId) {
      res.status(409).json({ error: "This HOD Employee ID is already assigned to another department" });
      return;
    }
  }

  if (hodPin !== existing.hodPin) {
    const [pinConflict] = await db
      .select({ id: departmentsTable.id })
      .from(departmentsTable)
      .where(eq(departmentsTable.hodPin, hodPin));
    if (pinConflict && pinConflict.id !== deptId) {
      res.status(409).json({ error: "This PIN is already used by another HOD" });
      return;
    }
  }

  const [updated] = await db
    .update(departmentsTable)
    .set({ hodName, hodEmployeeId, hodPin })
    .where(eq(departmentsTable.id, deptId))
    .returning();

  res.json({
    departmentId: updated.id,
    departmentCode: updated.code,
    departmentName: updated.name,
    hodName: updated.hodName,
    hodEmployeeId: updated.hodEmployeeId,
    hodPin: updated.hodPin,
  });
});

export default router;
