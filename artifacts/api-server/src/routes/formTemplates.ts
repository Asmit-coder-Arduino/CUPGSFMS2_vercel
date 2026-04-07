import { Router, type IRouter } from "express";
import { supabase, camelRow } from "@workspace/db";
import type { FieldConfig } from "@workspace/db";
import { DEFAULT_FIELDS } from "@workspace/db";

const router: IRouter = Router();

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

router.get("/departments/:id/form-template", async (req, res): Promise<void> => {
  const departmentId = parseInt(req.params.id, 10);
  if (isNaN(departmentId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  const { data: dept } = await supabase
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .single();

  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }

  const { data: template } = await supabase
    .from("form_templates")
    .select("*")
    .eq("department_id", departmentId)
    .single();

  if (!template) {
    res.json(buildDefaultTemplate(departmentId));
    return;
  }
  res.json({ ...camelRow(template), isDefault: false });
});

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

  const enabledStandard = fields.filter(f => f.isStandard && f.enabled);
  if (enabledStandard.length === 0) {
    res.status(400).json({ error: "At least one standard rating field must be enabled" });
    return;
  }

  const orderedFields = fields.map((f, i) => ({ ...f, order: i + 1 }));

  const payload = {
    department_id: departmentId,
    title: title?.trim() || "Student Feedback Form",
    description: description?.trim() || null,
    fields: orderedFields,
    comment_label: commentLabel?.trim() || "Additional Comments / Suggestions",
    comment_required: commentRequired ?? false,
    is_active: isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("form_templates")
    .select("id")
    .eq("department_id", departmentId)
    .single();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from("form_templates")
      .update(payload)
      .eq("department_id", departmentId)
      .select()
      .single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    result = data;
  } else {
    const { data, error } = await supabase
      .from("form_templates")
      .insert(payload)
      .select()
      .single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    result = data;
  }

  res.status(existing ? 200 : 201).json({ ...camelRow(result), isDefault: false });
});

router.delete("/departments/:id/form-template", async (req, res): Promise<void> => {
  const departmentId = parseInt(req.params.id, 10);
  if (isNaN(departmentId)) { res.status(400).json({ error: "Invalid department ID" }); return; }

  await supabase.from("form_templates").delete().eq("department_id", departmentId);
  res.json({ success: true, message: "Custom template removed. Department will use default form." });
});

export default router;
