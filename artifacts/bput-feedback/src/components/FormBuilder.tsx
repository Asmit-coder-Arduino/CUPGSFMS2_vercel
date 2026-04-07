import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical, Trash2, ChevronUp, ChevronDown, Plus, X, Eye, EyeOff,
  Star, CheckSquare, List, AlignLeft, Settings, Save, RotateCcw, Sparkles,
  AlertCircle, CheckCircle2, Info,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldConfig {
  id: string;
  label: string;
  description?: string;
  type: "star_5" | "yes_no" | "mcq" | "text_short";
  options?: string[];
  required: boolean;
  enabled: boolean;
  order: number;
  isStandard: boolean;
  standardKey?: "courseContent" | "teachingQuality" | "labFacilities" | "studyMaterial" | "overall";
}

export interface FormTemplate {
  id: number | null;
  departmentId: number;
  title: string;
  description: string | null;
  isActive: boolean;
  fields: FieldConfig[];
  commentLabel: string;
  commentRequired: boolean;
  isDefault: boolean;
}

const FIELD_TYPE_ICONS: Record<FieldConfig["type"], React.ReactNode> = {
  star_5:     <Star className="w-3.5 h-3.5" />,
  yes_no:     <CheckSquare className="w-3.5 h-3.5" />,
  mcq:        <List className="w-3.5 h-3.5" />,
  text_short: <AlignLeft className="w-3.5 h-3.5" />,
};

const FIELD_TYPE_LABELS: Record<FieldConfig["type"], string> = {
  star_5:     "Star Rating (1–5)",
  yes_no:     "Yes / No",
  mcq:        "Multiple Choice",
  text_short: "Short Text Answer",
};

const FIELD_TYPE_COLORS: Record<FieldConfig["type"], string> = {
  star_5:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  yes_no:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  mcq:        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  text_short: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow";

// ─── Star Preview ─────────────────────────────────────────────────────────────

function StarPreview() {
  return (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= 3 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1 self-center">3 / 5</span>
    </div>
  );
}

// ─── Add Field Modal ──────────────────────────────────────────────────────────

interface AddFieldModalProps {
  onAdd: (field: FieldConfig) => void;
  onClose: () => void;
  existingCount: number;
}

function AddFieldModal({ onAdd, onClose, existingCount }: AddFieldModalProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<FieldConfig["type"]>("star_5");
  const [required, setRequired] = useState(false);
  const [mcqOptions, setMcqOptions] = useState(["Excellent", "Good", "Average", "Below Average"]);
  const [newOption, setNewOption] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!label.trim()) { setError("Question label is required."); return; }
    if (type === "mcq" && mcqOptions.length < 2) { setError("Multiple choice needs at least 2 options."); return; }

    const field: FieldConfig = {
      id: `custom_${Date.now()}`,
      label: label.trim(),
      description: description.trim() || undefined,
      type,
      options: type === "mcq" ? mcqOptions : undefined,
      required,
      enabled: true,
      order: existingCount + 1,
      isStandard: false,
    };
    onAdd(field);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-lg">Add Custom Question</h3>
            <p className="text-sm text-muted-foreground">Create a new question for your form</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {error && <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Question Label <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="e.g. Faculty Mentoring Support" value={label} onChange={e => setLabel(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description <span className="text-muted-foreground text-xs">(optional)</span></label>
            <input className={inputCls} placeholder="e.g. Is the faculty available for guidance outside class hours?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Question Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {(["star_5", "yes_no", "mcq", "text_short"] as FieldConfig["type"][]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    type === t ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${type === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {FIELD_TYPE_ICONS[t]}
                  </span>
                  <span className="text-xs font-medium">{FIELD_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {type === "mcq" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer Options</label>
              <div className="space-y-1.5">
                {mcqOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted text-xs flex items-center justify-center text-muted-foreground font-bold">{i + 1}</span>
                    <input
                      className={`${inputCls} flex-1`}
                      value={opt}
                      onChange={e => setMcqOptions(opts => opts.map((o, j) => j === i ? e.target.value : o))}
                    />
                    <button onClick={() => setMcqOptions(opts => opts.filter((_, j) => j !== i))} className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="New option..."
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newOption.trim()) { setMcqOptions(o => [...o, newOption.trim()]); setNewOption(""); } }}
                />
                <Button size="sm" variant="outline" onClick={() => { if (newOption.trim()) { setMcqOptions(o => [...o, newOption.trim()]); setNewOption(""); } }}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-medium">Required question</p>
              <p className="text-xs text-muted-foreground">Student must answer this before submitting</p>
            </div>
          </label>
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Field Card ───────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: FieldConfig;
  index: number;
  total: number;
  onChange: (id: string, updates: Partial<FieldConfig>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}

function FieldCard({ field, index, total, onChange, onDelete, onMove }: FieldCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`group border rounded-xl overflow-hidden transition-all duration-200 ${
      field.enabled ? "bg-card" : "bg-muted/30 opacity-70"
    }`}>
      {/* Top bar */}
      <div className="flex items-center gap-2 p-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            disabled={index === 0}
            onClick={() => onMove(field.id, "up")}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-20"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => onMove(field.id, "down")}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-20"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

        {/* Field info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${FIELD_TYPE_COLORS[field.type]}`}>
              {FIELD_TYPE_ICONS[field.type]} {FIELD_TYPE_LABELS[field.type]}
            </span>
            {field.isStandard && <Badge variant="outline" className="text-xs py-0 h-5 text-indigo-600 border-indigo-300">Standard</Badge>}
            {field.required && <Badge variant="outline" className="text-xs py-0 h-5 text-red-500 border-red-200">Required</Badge>}
          </div>
          <p className={`text-sm font-semibold mt-0.5 truncate ${!field.enabled ? "text-muted-foreground line-through" : ""}`}>{field.label}</p>
          {field.description && <p className="text-xs text-muted-foreground truncate">{field.description}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Enable/Disable toggle */}
          <button
            onClick={() => onChange(field.id, { enabled: !field.enabled })}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              field.enabled ? "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 text-amber-500" : "hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground"
            }`}
            title={field.enabled ? "Disable this field" : "Enable this field"}
          >
            {field.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Edit */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Edit question"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Delete (custom only) */}
          {!field.isStandard && (
            <button
              onClick={() => onDelete(field.id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 flex items-center justify-center text-muted-foreground transition-colors"
              title="Delete this question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t bg-muted/10 px-4 pb-4 pt-3 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question Label</label>
            <input
              className={inputCls}
              value={field.label}
              onChange={e => onChange(field.id, { label: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Helper Text <span className="normal-case font-normal">(optional)</span></label>
            <input
              className={inputCls}
              placeholder="Describe what this question is asking..."
              value={field.description ?? ""}
              onChange={e => onChange(field.id, { description: e.target.value || undefined })}
            />
          </div>

          {field.type === "mcq" && field.options && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Answer Options</label>
              {field.options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={`${inputCls} flex-1`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...(field.options ?? [])];
                      newOpts[i] = e.target.value;
                      onChange(field.id, { options: newOpts });
                    }}
                  />
                  <button
                    onClick={() => onChange(field.id, { options: field.options?.filter((_, j) => j !== i) })}
                    className="w-6 h-6 rounded hover:bg-red-50 hover:text-red-500 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => onChange(field.id, { options: [...(field.options ?? []), ""] })}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={e => onChange(field.id, { required: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.enabled}
                onChange={e => onChange(field.id, { enabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Visible to students</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ template, onClose }: { template: Partial<FormTemplate> & { fields: FieldConfig[] }; onClose: () => void }) {
  const enabledFields = template.fields.filter(f => f.enabled);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-card border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student Preview</p>
            <h3 className="font-bold text-lg">{template.title || "Student Feedback Form"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {template.description && <p className="text-sm text-muted-foreground mb-5">{template.description}</p>}

        <div className="space-y-5">
          {enabledFields.map(f => (
            <div key={f.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{f.label}</label>
                {f.required && <span className="text-red-500 text-xs">*</span>}
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${FIELD_TYPE_COLORS[f.type]}`}>
                  {FIELD_TYPE_ICONS[f.type]}
                </span>
              </div>
              {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}

              {f.type === "star_5" && <StarPreview />}

              {f.type === "yes_no" && (
                <div className="flex gap-3">
                  <button className="flex-1 border rounded-lg py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">Yes</button>
                  <button className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted transition-colors">No</button>
                </div>
              )}

              {f.type === "mcq" && f.options && (
                <div className="space-y-2">
                  {f.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 border">
                      <input type="radio" name={f.id} className="w-4 h-4" readOnly />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {f.type === "text_short" && (
                <input className={inputCls} placeholder="Student's answer..." disabled />
              )}
            </div>
          ))}

          <div className="border-t pt-4 space-y-1.5">
            <label className="text-sm font-medium">{template.commentLabel || "Additional Comments"}</label>
            {template.commentRequired && <span className="text-xs text-red-500 ml-1">*</span>}
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Student's comments..." disabled />
          </div>
        </div>

        <div className="mt-6 p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground text-center">
          This is a preview. Students will see this form when submitting feedback for your department.
        </div>
      </div>
    </div>
  );
}

// ─── Main Form Builder Component ──────────────────────────────────────────────

interface FormBuilderProps {
  departmentId: number;
  departmentName: string;
}

export default function FormBuilder({ departmentId, departmentName }: FormBuilderProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAddField, setShowAddField] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load template
  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/departments/${departmentId}/form-template`);
      const data = await res.json();
      setTemplate(data);
    } catch {
      setError("Failed to load form template.");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  // Auto-load on mount
  useEffect(() => { void loadTemplate(); }, [loadTemplate]);

  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    setTemplate(t => t ? { ...t, fields: t.fields.map(f => f.id === id ? { ...f, ...updates } : f) } : t);
    setSaved(false);
  };

  const deleteField = (id: string) => {
    setTemplate(t => t ? { ...t, fields: t.fields.filter(f => f.id !== id) } : t);
    setSaved(false);
  };

  const moveField = (id: string, dir: "up" | "down") => {
    setTemplate(t => {
      if (!t) return t;
      const fields = [...t.fields];
      const idx = fields.findIndex(f => f.id === id);
      if (dir === "up" && idx > 0) { [fields[idx - 1], fields[idx]] = [fields[idx], fields[idx - 1]]; }
      if (dir === "down" && idx < fields.length - 1) { [fields[idx], fields[idx + 1]] = [fields[idx + 1], fields[idx]]; }
      return { ...t, fields: fields.map((f, i) => ({ ...f, order: i + 1 })) };
    });
    setSaved(false);
  };

  const addField = (field: FieldConfig) => {
    setTemplate(t => t ? { ...t, fields: [...t.fields, { ...field, order: t.fields.length + 1 }] } : t);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch(`${getApiUrl()}/api/departments/${departmentId}/form-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          fields: template.fields,
          commentLabel: template.commentLabel,
          commentRequired: template.commentRequired,
          isActive: template.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setTemplate({ ...data, isDefault: false });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to system default? This will delete your custom form configuration.")) return;
    setResetting(true);
    try {
      await fetch(`${getApiUrl()}/api/departments/${departmentId}/form-template`, { method: "DELETE" });
      await loadTemplate();
    } catch {
      setError("Failed to reset template.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-medium">{error || "Failed to load form template"}</p>
        <Button onClick={loadTemplate} variant="outline" className="mt-3">Try Again</Button>
      </div>
    );
  }

  const enabledCount = template.fields.filter(f => f.enabled).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Form Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customize what questions students see when submitting feedback for <strong>{departmentName}</strong>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreview(true)}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
          {!template.isDefault && (
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleReset} disabled={resetting}>
              <RotateCcw className="w-3.5 h-3.5" /> {resetting ? "Resetting…" : "Reset to Default"}
            </Button>
          )}
          <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700" onClick={handleSave} disabled={saving}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : <><Save className="w-4 h-4" /> Save Form</>}
          </Button>
        </div>
      </div>

      {/* Info / Status banner */}
      {template.isDefault ? (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0" />
          Using the <strong>system default form</strong>. Customize and save to create your own department-specific form.
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Custom form is <strong>active</strong> for {departmentName}. Students see your customized version.
        </div>
      )}

      {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</div>}

      {/* Form Settings */}
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-muted-foreground" /> Form Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Form Title (shown to students)</label>
              <input
                className={inputCls}
                placeholder="Student Feedback Form"
                value={template.title}
                onChange={e => { setTemplate(t => t ? { ...t, title: e.target.value } : t); setSaved(false); }}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Form Description (optional)</label>
              <input
                className={inputCls}
                placeholder="Your feedback helps improve academic quality at CUPGS..."
                value={template.description ?? ""}
                onChange={e => { setTemplate(t => t ? { ...t, description: e.target.value || null } : t); setSaved(false); }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comment Box Label</label>
              <input
                className={inputCls}
                placeholder="Additional Comments / Suggestions"
                value={template.commentLabel}
                onChange={e => { setTemplate(t => t ? { ...t, commentLabel: e.target.value } : t); setSaved(false); }}
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.commentRequired}
                  onChange={e => { setTemplate(t => t ? { ...t, commentRequired: e.target.checked } : t); setSaved(false); }}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <p className="text-sm font-medium">Comment required</p>
                  <p className="text-xs text-muted-foreground">Students must write a comment</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Questions
              <Badge variant="secondary" className="text-xs">{enabledCount} active</Badge>
              <Badge variant="outline" className="text-xs">{template.fields.length} total</Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Reorder, enable/disable, or edit labels. Standard fields (5-star) map to your department's analytics.</p>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1.5" onClick={() => setShowAddField(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Question
          </Button>
        </div>

        {template.fields.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
            <List className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No questions yet</p>
            <p className="text-sm">Add at least one standard star-rating question</p>
          </div>
        ) : (
          <div className="space-y-2">
            {template.fields.map((field, idx) => (
              <FieldCard
                key={field.id}
                field={field}
                index={idx}
                total={template.fields.length}
                onChange={updateField}
                onDelete={deleteField}
                onMove={moveField}
              />
            ))}
          </div>
        )}

        {enabledCount === 0 && template.fields.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            All questions are disabled. Enable at least one question before saving.
          </div>
        )}
      </div>

      {/* Save CTA */}
      <div className="flex gap-2 pt-2 border-t">
        <Button className="flex-1 bg-amber-600 hover:bg-amber-700 gap-2 py-5 text-base" onClick={handleSave} disabled={saving || enabledCount === 0}>
          {saved ? <><CheckCircle2 className="w-5 h-5" /> Saved Successfully!</> : saving ? "Saving Form…" : <><Save className="w-5 h-5" /> Save & Publish Form</>}
        </Button>
      </div>

      {/* Modals */}
      {showAddField && (
        <AddFieldModal
          onAdd={addField}
          onClose={() => setShowAddField(false)}
          existingCount={template.fields.length}
        />
      )}
      {showPreview && (
        <PreviewModal
          template={template}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
