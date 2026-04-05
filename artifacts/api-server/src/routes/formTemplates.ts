import { Router, type IRouter } from "express";
import { db, formTemplatesTable, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { FieldConfig } from "@workspace/db";
import { DEFAULT_FIELDS } from "@workspace/db";

const router: IRouter = Router();

// ── Default template when no custom one exists ────────────────────────────────

function buildDefaultTemplate(departmentId: number) {
  return {
    id: null,
    departmentId,
    title: "Student Feedback Form",
    description: "Your feedback helps us improve teaching quality and academic experience at CUPGS.",
    isActive: true,
    fields: DEFAULT_FIELDS,
    commentLabel: "Additional Comments / Suggestions",
    commentRequired: false,
    isDefault: true,
  };
}

// ── GET /api/departments/:id/form-template ────────────────────────────────────
// Returns the active form template for the department.
// If no custom template exists, returns the default fields.

router.get("/departments/:id/form-template", async (req, res): Promise<void> => {
  const departmentId = parseInt(req.params.id, 10);
  if (isNaN(departmentId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const [dept] = await db.select({ id: departmentsTable.id }).from(departmentsTable).where(eq(departmentsTable.id, departmentId));
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  const [template] = await db.select().from(formTemplatesTable).where(eq(formTemplatesTable.departmentId, departmentId));

  if (!template) {
    res.json(buildDefaultTemplate(departmentId));
    return;
  }
  res.json({ ...template, isDefault: false });
});

// ── POST /api/departments/:id/form-template ───────────────────────────────────
// Create or fully replace the department's form template.

router.post("/departments/:id/form-template", async (req, res): Promise<void> => {
  const departmentId = parseInt(req.params.id, 10);
  if (isNaN(departmentId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { title, description, fields, commentLabel, commentRequired, isActive } = req.body as {
    title?: string; description?: string; fields?: FieldConfig[];
    commentLabel?: string; commentRequired?: boolean; isActive?: boolean;
  };

  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: "fields array is required and must not be empty" });
    return;
  }

  // Validate: at least one standard field enabled and required
  const enabledStandard = fields.filter(f => f.isStandard && f.enabled);
  if (enabledStandard.length === 0) {
    res.status(400).json({ error: "At least one standard rating field must be enabled" });
    return;
  }

  // Re-index order to keep clean 1..N ordering
  const orderedFields = fields.map((f, i) => ({ ...f, order: i + 1 }));

  const payload = {
    departmentId,
    title: title?.trim() || "Student Feedback Form",
    description: description?.trim() || null,
    fields: orderedFields,
    commentLabel: commentLabel?.trim() || "Additional Comments / Suggestions",
    commentRequired: commentRequired ?? false,
    isActive: isActive ?? true,
    updatedAt: new Date(),
  };

  // Upsert (insert or update)
  const [existing] = await db.select({ id: formTemplatesTable.id }).from(formTemplatesTable).where(eq(formTemplatesTable.departmentId, departmentId));

  let result;
  if (existing) {
    [result] = await db.update(formTemplatesTable).set(payload).where(eq(formTemplatesTable.departmentId, departmentId)).returning();
  } else {
    [result] = await db.insert(formTemplatesTable).values(payload).returning();
  }

  res.status(existing ? 200 : 201).json({ ...result, isDefault: false });
});

// ── DELETE /api/departments/:id/form-template ─────────────────────────────────
// Removes custom template; department will revert to the system default.

router.delete("/departments/:id/form-template", async (req, res): Promise<void> => {
  const departmentId = parseInt(req.params.id, 10);
  if (isNaN(departmentId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  await db.delete(formTemplatesTable).where(eq(formTemplatesTable.departmentId, departmentId));
  res.json({ success: true, message: "Custom template removed. Department will use default form." });
});

export default router;
