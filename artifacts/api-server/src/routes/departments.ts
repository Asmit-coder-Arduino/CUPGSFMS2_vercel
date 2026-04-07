import { Router, type IRouter } from "express";
import { supabase, camelRow, camelRows, snakeObj } from "@workspace/db";

const router: IRouter = Router();

router.get("/departments", async (req, res): Promise<void> => {
  const { data: departments, error } = await supabase
    .from("departments")
    .select("*")
    .order("code");

  if (error) { res.status(500).json({ error: error.message }); return; }

  const result = await Promise.all(
    (departments || []).map(async (dept: any) => {
      const { count: facultyCount } = await supabase
        .from("faculty")
        .select("*", { count: "exact", head: true })
        .eq("department_id", dept.id);

      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("department_id", dept.id);

      const { data: avgData } = await supabase
        .from("feedback")
        .select("rating_overall")
        .eq("department_id", dept.id);

      const ratings = (avgData || []).map((r: any) => r.rating_overall);
      const avgRating = ratings.length > 0 ? ratings.reduce((s: number, v: number) => s + v, 0) / ratings.length : null;

      const { hod_pin: _hp, ...safeDept } = dept;
      return {
        ...camelRow(safeDept),
        totalFaculty: facultyCount ?? 0,
        totalCourses: courseCount ?? 0,
        avgRating,
      };
    })
  );

  res.json(result);
});

router.patch("/departments/:id", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD || "BPUT_Admin@2025#Secure";
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
    updates.hod_name = hodName.trim();
  }
  if (hodEmployeeId !== undefined) {
    if (typeof hodEmployeeId !== "string" || hodEmployeeId.trim().length < 3 || hodEmployeeId.trim().length > 50) {
      res.status(400).json({ error: "HOD Employee ID must be 3-50 characters" }); return;
    }
    updates.hod_employee_id = hodEmployeeId.trim();
  }
  if (hodPin !== undefined) {
    if (typeof hodPin !== "string" || hodPin.trim().length < 4 || hodPin.trim().length > 50) {
      res.status(400).json({ error: "HOD PIN must be 4-50 characters" }); return;
    }
    updates.hod_pin = hodPin.trim();
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

  const { data: updated, error } = await supabase
    .from("departments")
    .update(updates)
    .eq("id", deptId)
    .select()
    .single();

  if (error || !updated) { res.status(404).json({ error: "Department not found" }); return; }

  const { hod_pin: _hp, ...safe } = updated;
  res.json(camelRow(safe));
});

router.get("/departments/:id", async (req, res): Promise<void> => {
  const deptId = parseInt(req.params.id);
  if (isNaN(deptId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { data: dept, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", deptId)
    .single();

  if (error || !dept) { res.status(404).json({ error: "Department not found" }); return; }

  const { hod_pin: _hp, ...safe } = dept;
  res.json(camelRow(safe));
});

export default router;
