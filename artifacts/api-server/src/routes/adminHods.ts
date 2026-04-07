import { Router, type IRouter } from "express";
import { supabase, camelRows } from "@workspace/db";

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

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("code");

  const hodsWithFaculty = await Promise.all(
    (departments || []).map(async (dept: any) => {
      const { data: faculty } = await supabase
        .from("faculty")
        .select("id, name, designation, employee_id")
        .eq("department_id", dept.id);

      return {
        departmentId: dept.id,
        departmentCode: dept.code,
        departmentName: dept.name,
        hodName: dept.hod_name,
        hodEmployeeId: dept.hod_employee_id,
        hodPin: dept.hod_pin,
        facultyList: camelRows(faculty || []),
      };
    })
  );

  res.json(hodsWithFaculty);
});

router.put("/admin/hods/:deptId", async (req, res): Promise<void> => {
  if (!verifyAdmin(req, res)) return;

  const deptId = parseInt(req.params.deptId);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { hodName, hodEmployeeId, hodPin } = req.body;
  if (!hodName || !hodEmployeeId || !hodPin) {
    res.status(400).json({ error: "hodName, hodEmployeeId, and hodPin are all required" });
    return;
  }

  const { data: existing } = await supabase
    .from("departments")
    .select("*")
    .eq("id", deptId)
    .single();

  if (!existing) { res.status(404).json({ error: "Department not found" }); return; }

  if (hodEmployeeId !== existing.hod_employee_id) {
    const { data: conflicts } = await supabase
      .from("departments")
      .select("id")
      .eq("hod_employee_id", hodEmployeeId)
      .neq("id", deptId)
      .limit(1);
    if (conflicts && conflicts.length > 0) {
      res.status(409).json({ error: "This HOD Employee ID is already assigned to another department" });
      return;
    }
  }

  if (hodPin !== existing.hod_pin) {
    const { data: pinConflicts } = await supabase
      .from("departments")
      .select("id")
      .eq("hod_pin", hodPin)
      .neq("id", deptId)
      .limit(1);
    if (pinConflicts && pinConflicts.length > 0) {
      res.status(409).json({ error: "This PIN is already used by another HOD" });
      return;
    }
  }

  const { data: updated, error } = await supabase
    .from("departments")
    .update({ hod_name: hodName, hod_employee_id: hodEmployeeId, hod_pin: hodPin })
    .eq("id", deptId)
    .select()
    .single();

  if (error || !updated) { res.status(500).json({ error: "Update failed" }); return; }

  res.json({
    departmentId: updated.id,
    departmentCode: updated.code,
    departmentName: updated.name,
    hodName: updated.hod_name,
    hodEmployeeId: updated.hod_employee_id,
    hodPin: updated.hod_pin,
  });
});

export default router;
