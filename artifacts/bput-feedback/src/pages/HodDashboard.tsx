import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, BookOpen, MessageSquare, Users, TrendingUp, Download, FileText,
  Award, ChevronDown, ChevronUp, Plus, X, Calendar, Clock, CheckCircle2,
  XCircle, AlertCircle, BarChart3, BookMarked, CalendarRange,
  GraduationCap, Layers, ToggleLeft, ToggleRight, RefreshCw,
  Pencil, Trash2, UserPlus, Mail, Phone, Building2, Lock,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { getCupgsLogoDataUrl } from "@/lib/pdfLogo";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
  totalFeedback: number; totalCourses: number; totalFaculty: number;
  avgOverall: number | null; avgCourseContent: number | null;
  avgTeachingQuality: number | null; avgLabFacilities: number | null; avgStudyMaterial: number | null;
}
interface FacultyStat {
  id: number; name: string; designation: string; employeeId: string;
  courseCount: number; courseNames: string; feedbackCount: number;
  avgOverall: number | null; avgCourseContent: number | null;
  avgTeachingQuality: number | null; avgLabFacilities: number | null; avgStudyMaterial: number | null;
}
interface CourseStat {
  id: number; code: string; name: string; semester: number; academicYear: string;
  credits: number; facultyName: string; feedbackCount: number;
  avgOverall: number | null; avgCourseContent: number | null; avgTeachingQuality: number | null;
  avgLabFacilities: number | null; avgStudyMaterial: number | null; recentComments: string[];
}
interface HodReportData {
  department: { id: number; name: string; code: string; hodName: string };
  summary: Summary; facultyStats: FacultyStat[]; courseStats: CourseStat[];
  recentComments: Array<{ comment: string; courseCode: string; section: string; createdAt: string }>;
  generatedAt: string;
}
interface AssignedCourse {
  id: number; code: string; name: string; semester: number; academicYear: string; credits: number;
}
interface FacultyItem {
  id: number; name: string; email: string | null; designation: string;
  departmentId: number; departmentName: string | null;
  employeeId: string | null; qualification: string | null; specialization: string | null;
  avgRating: number | null; totalFeedbackCount: number;
  assignedCourses: AssignedCourse[];
}
interface CourseItem {
  id: number; code: string; name: string; departmentId: number;
  departmentName: string | null; facultyId: number | null; facultyName: string | null;
  semester: number; academicYear: string; credits: number;
  avgRating: number | null; feedbackCount: number;
}
interface WindowItem {
  id: number; title: string; feedbackType: string; academicYear: string;
  semester: number; startDate: string; endDate: string; isActive: boolean;
  departmentIds: number[];
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────

function fmt(v: number | null) { return v != null ? v.toFixed(2) : "—"; }

function RatingChip({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = value >= 4
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : value >= 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{value.toFixed(2)}</span>;
}

function RatingBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  const color = !value ? "bg-muted" : value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value ? value.toFixed(2) : "—"} / 5</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow";
const selectCls = `${inputCls} cursor-pointer`;

function InputField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children, size = "md" }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        className={`relative w-full ${size === "lg" ? "max-w-2xl" : "max-w-lg"} bg-card border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5 gap-2">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm Delete Dialog ───────────────────────────────────────────────────

function ConfirmDialog({ title, message, onConfirm, onCancel, loading }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        className="relative w-full max-w-sm bg-card border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-center font-bold text-lg mb-2">{title}</h3>
        <p className="text-center text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Faculty Form Modal ───────────────────────────────────────────────────────

const DESIGNATIONS = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Instructor", "HOD"];
const ACADEMIC_YEARS = ["2023-24", "2024-25", "2025-26"];

interface FacultyFormData {
  name: string; designation: string; email: string;
  employeeId: string; loginPin: string; qualification: string; specialization: string;
}

function FacultyModal({ deptId, initial, onClose, onSaved }: {
  deptId: number; initial?: FacultyItem; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<FacultyFormData>({
    name: initial?.name ?? "",
    designation: initial?.designation ?? "Assistant Professor",
    email: initial?.email ?? "",
    employeeId: initial?.employeeId ?? "",
    loginPin: "",
    qualification: initial?.qualification ?? "",
    specialization: initial?.specialization ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FacultyFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.designation) { setError("Name and designation are required."); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        designation: form.designation,
        departmentId: deptId,
        email: form.email.trim() || null,
        employeeId: form.employeeId.trim().toUpperCase() || null,
        qualification: form.qualification.trim() || null,
        specialization: form.specialization.trim() || null,
      };
      if (form.loginPin.trim()) body.loginPin = form.loginPin.trim();

      const url = isEdit ? `${getApiUrl()}/api/faculty/${initial!.id}` : `${getApiUrl()}/api/faculty`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onSaved(); onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={isEdit ? "Edit Faculty Member" : "Add New Faculty Member"}
      subtitle={isEdit ? `Editing: ${initial?.name}` : "Add a new teacher to your department"}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" required>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} placeholder="Dr. Rajesh Kumar" value={form.name} onChange={set("name")} />
            </div>
          </InputField>
          <InputField label="Designation" required>
            <select className={selectCls} value={form.designation} onChange={set("designation")}>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </InputField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Employee ID" hint="e.g. CUPGS/CSE/001">
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} placeholder="CUPGS/CSE/001" value={form.employeeId} onChange={set("employeeId")} />
            </div>
          </InputField>
          <InputField label="Login PIN" hint={isEdit ? "Leave blank to keep current PIN" : "4–20 characters"}>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input type="password" className={`${inputCls} pl-9`} placeholder={isEdit ? "••••  (unchanged)" : "Set login PIN"} value={form.loginPin} onChange={set("loginPin")} />
            </div>
          </InputField>
        </div>

        <InputField label="Email Address">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input type="email" className={`${inputCls} pl-9`} placeholder="faculty@bput.ac.in" value={form.email} onChange={set("email")} />
          </div>
        </InputField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Qualification" hint="e.g. Ph.D, M.Tech">
            <input className={inputCls} placeholder="Ph.D in Computer Science" value={form.qualification} onChange={set("qualification")} />
          </InputField>
          <InputField label="Specialization" hint="e.g. Machine Learning">
            <input className={inputCls} placeholder="Machine Learning, DBMS" value={form.specialization} onChange={set("specialization")} />
          </InputField>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
          <strong>Login note:</strong> The faculty member will log in using their Employee ID and PIN from the Faculty Portal.
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={saving}>
            {saving ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save Changes" : "Add Faculty")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Course Form Modal ────────────────────────────────────────────────────────

interface CourseFormData {
  code: string; name: string; semester: string; academicYear: string; credits: string; facultyId: string;
}

function CourseModal({ deptId, faculty, initial, onClose, onSaved }: {
  deptId: number; faculty: FacultyItem[]; initial?: CourseItem;
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<CourseFormData>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    semester: String(initial?.semester ?? "1"),
    academicYear: initial?.academicYear ?? "2024-25",
    credits: String(initial?.credits ?? "4"),
    facultyId: String(initial?.facultyId ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof CourseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) { setError("Course code and name are required."); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        semester: parseInt(form.semester),
        academicYear: form.academicYear,
        credits: parseInt(form.credits),
        departmentId: deptId,
        facultyId: form.facultyId ? parseInt(form.facultyId) : null,
      };
      const url = isEdit ? `${getApiUrl()}/api/courses/${initial!.id}` : `${getApiUrl()}/api/courses`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onSaved(); onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={isEdit ? "Edit Course" : "Add New Course"}
      subtitle={isEdit ? `Editing: ${initial?.code} – ${initial?.name}` : "Add a new course to your department"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Course Code" required>
            <input className={inputCls} placeholder="BSMA1101" value={form.code} onChange={set("code")} />
          </InputField>
          <InputField label="Credits" required>
            <select className={selectCls} value={form.credits} onChange={set("credits")}>
              {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c} Credits</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Course Name" required>
          <input className={inputCls} placeholder="e.g. Mathematics – I (Calculus & Linear Algebra)" value={form.name} onChange={set("name")} />
        </InputField>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Semester" required>
            <select className={selectCls} value={form.semester} onChange={set("semester")}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </InputField>
          <InputField label="Academic Year" required>
            <select className={selectCls} value={form.academicYear} onChange={set("academicYear")}>
              {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Assigned Faculty" hint="Which teacher will teach this course?">
          <select className={selectCls} value={form.facultyId} onChange={set("facultyId")}>
            <option value="">— Not assigned yet —</option>
            {faculty.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.designation})
              </option>
            ))}
          </select>
        </InputField>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
            {saving ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save Changes" : "Add Course")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Window Status ────────────────────────────────────────────────────────────

function WindowStatus({ w }: { w: WindowItem }) {
  const now = new Date(), start = new Date(w.startDate), end = new Date(w.endDate);
  if (!w.isActive) return <Badge variant="secondary" className="text-xs gap-1"><XCircle className="w-3 h-3" /> Inactive</Badge>;
  if (now < start) return <Badge className="text-xs gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0"><Clock className="w-3 h-3" /> Upcoming</Badge>;
  if (now > end) return <Badge className="text-xs gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0"><AlertCircle className="w-3 h-3" /> Expired</Badge>;
  return <Badge className="text-xs gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"><CheckCircle2 className="w-3 h-3" /> Active</Badge>;
}

// ─── Window Form Modal ────────────────────────────────────────────────────────

function CreateWindowModal({ deptId, onClose, onSaved }: {
  deptId: number; onClose: () => void; onSaved: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "", feedbackType: "semester_end", academicYear: "2024-25",
    semester: "1", startDate: today, endDate: "", forAll: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) { setError("Title, start date, and end date are required."); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { setError("End date must be after start date."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/windows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(), feedbackType: form.feedbackType,
          academicYear: form.academicYear, semester: parseInt(form.semester),
          startDate: form.startDate, endDate: form.endDate,
          departmentIds: form.forAll ? [] : [deptId],
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onSaved(); onClose();
    } catch (err: unknown) { setError((err as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Create Feedback Window" subtitle="Define when students can submit feedback" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <InputField label="Window Title" required>
          <input className={inputCls} placeholder="Even Semester End Feedback 2024-25" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </InputField>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Feedback Type" required>
            <select className={selectCls} value={form.feedbackType} onChange={e => setForm(f => ({ ...f, feedbackType: e.target.value }))}>
              <option value="semester_end">Semester End</option>
              <option value="mid_semester">Mid-Semester</option>
              <option value="event_based">Event Based</option>
              <option value="placement">Placement</option>
            </select>
          </InputField>
          <InputField label="Semester" required>
            <select className={selectCls} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Academic Year" required>
          <select className={selectCls} value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}>
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </InputField>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Date" required>
            <input type="date" className={inputCls} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </InputField>
          <InputField label="End Date" required>
            <input type="date" className={inputCls} value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </InputField>
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors">
          <input type="checkbox" checked={form.forAll} onChange={e => setForm(f => ({ ...f, forAll: e.target.checked }))} className="w-4 h-4 rounded" />
          <div>
            <p className="text-sm font-medium">Apply to all departments</p>
            <p className="text-xs text-muted-foreground">Uncheck to limit to your department only</p>
          </div>
        </label>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={saving}>
            {saving ? "Creating…" : "Create Window"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

async function generatePDF(data: HodReportData) {
  const logoUrl = await getCupgsLogoDataUrl();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { department, summary, facultyStats, courseStats, recentComments, generatedAt } = data;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  const addHeader = () => {
    doc.setFillColor(13, 71, 115);
    doc.rect(0, 0, pageW, 28, "F");
    if (logoUrl) { try { doc.addImage(logoUrl, "PNG", 4, 4, 20, 20); } catch {} }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("CUPGS Academic Feedback Report", logoUrl ? margin + 14 : margin, 12);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`${department.name} (${department.code})`, logoUrl ? margin + 14 : margin, 20);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(generatedAt).toLocaleString("en-IN")}`, pageW - margin, 20, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const sectionTitle = (text: string, y: number) => {
    doc.setFillColor(230, 240, 255);
    doc.rect(margin - 2, y - 5, pageW - (margin - 2) * 2, 8, "F");
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(13, 71, 115);
    doc.text(text, margin, y); doc.setTextColor(0, 0, 0);
    return y + 6;
  };

  addHeader(); let y = 36;
  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("HOD:", margin, y); doc.setFont("helvetica", "normal");
  doc.text(department.hodName ?? "—", margin + 14, y); y += 6;
  doc.setFont("helvetica", "bold"); doc.text("Academic Year:", margin, y);
  doc.setFont("helvetica", "normal"); doc.text("2024-25 | Even Semester", margin + 30, y); y += 10;

  y = sectionTitle("Department Summary", y); y += 2;
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Parameter", "Value"]],
    body: [
      ["Total Feedback Responses", summary.totalFeedback.toString()],
      ["Total Courses", summary.totalCourses.toString()],
      ["Total Faculty", summary.totalFaculty.toString()],
      ["Overall Rating (Avg)", fmt(summary.avgOverall) + " / 5.00"],
      ["Course Content (Avg)", fmt(summary.avgCourseContent) + " / 5.00"],
      ["Teaching Quality (Avg)", fmt(summary.avgTeachingQuality) + " / 5.00"],
      ["Lab Facilities (Avg)", fmt(summary.avgLabFacilities) + " / 5.00"],
      ["Study Material (Avg)", fmt(summary.avgStudyMaterial) + " / 5.00"],
    ],
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "center" } },
    theme: "grid",
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 240) { doc.addPage(); addHeader(); y = 36; }
  y = sectionTitle("Faculty Performance Summary", y); y += 2;
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Faculty", "Designation", "Emp. ID", "Courses", "Responses", "Overall", "Content", "Teaching", "Lab", "Material"]],
    body: facultyStats.map(f => [f.name, f.designation, f.employeeId ?? "—", f.courseCount.toString(), f.feedbackCount.toString(), fmt(f.avgOverall), fmt(f.avgCourseContent), fmt(f.avgTeachingQuality), fmt(f.avgLabFacilities), fmt(f.avgStudyMaterial)]),
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [245, 248, 255] }, theme: "grid",
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 240) { doc.addPage(); addHeader(); y = 36; }
  y = sectionTitle("Course-wise Feedback Report", y); y += 2;
  autoTable(doc, {
    startY: y, margin: { left: margin, right: margin },
    head: [["Code", "Course Name", "Sem", "Faculty", "Responses", "Overall", "Content", "Teaching", "Lab", "Material"]],
    body: courseStats.map(c => [c.code, c.name, `Sem ${c.semester}`, c.facultyName, c.feedbackCount.toString(), fmt(c.avgOverall), fmt(c.avgCourseContent), fmt(c.avgTeachingQuality), fmt(c.avgLabFacilities), fmt(c.avgStudyMaterial)]),
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [245, 248, 255] }, theme: "grid",
  });

  if (recentComments.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 12;
    if (y > 240) { doc.addPage(); addHeader(); y = 36; }
    y = sectionTitle("Recent Student Comments", y); y += 2;
    autoTable(doc, {
      startY: y, margin: { left: margin, right: margin },
      head: [["Course", "Comment", "Section", "Date"]],
      body: recentComments.map(c => [c.courseCode, c.comment ?? "—", c.section ?? "—", new Date(c.createdAt).toLocaleDateString("en-IN")]),
      headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 }, columnStyles: { 1: { cellWidth: 90 } },
      alternateRowStyles: { fillColor: [245, 248, 255] }, theme: "grid",
    });
  }

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — CUPGS Feedback Management System — Confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
  }
  doc.save(`CUPGS_${department.code}_Feedback_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = "analytics" | "faculty" | "courses" | "windows";

export default function HodDashboard() {
  const { role, hod } = useRole();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<Tab>("analytics");

  // Analytics
  const [data, setData] = useState<HodReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Faculty tab
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState<FacultyItem | undefined>();
  const [deleteFaculty, setDeleteFaculty] = useState<FacultyItem | undefined>();
  const [deletingFaculty, setDeletingFaculty] = useState(false);
  const [expandedFacultyId, setExpandedFacultyId] = useState<number | null>(null);

  // Courses tab
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseItem | undefined>();
  const [deleteCourse, setDeleteCourse] = useState<CourseItem | undefined>();
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Windows tab
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [windowsLoading, setWindowsLoading] = useState(false);
  const [showCreateWindow, setShowCreateWindow] = useState(false);
  const [togglingWindow, setTogglingWindow] = useState<number | null>(null);

  useEffect(() => {
    if (role !== "hod" || !hod) { navigate("/"); return; }
    fetch(`${getApiUrl()}/api/departments/${hod.id}/hod-report`)
      .then(r => r.json()).then(setData)
      .catch(() => setError("Failed to load department data."))
      .finally(() => setLoading(false));
  }, [hod, role]);

  const loadFaculty = useCallback(async () => {
    if (!hod) return;
    setFacultyLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/faculty?departmentId=${hod.id}`);
      setFacultyList(await res.json());
    } catch { }
    finally { setFacultyLoading(false); }
  }, [hod]);

  const loadCourses = useCallback(async () => {
    if (!hod) return;
    setCoursesLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/courses?departmentId=${hod.id}`);
      setCourses(await res.json());
    } catch { }
    finally { setCoursesLoading(false); }
  }, [hod]);

  const loadWindows = useCallback(async () => {
    setWindowsLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/windows`);
      setWindows(await res.json());
    } catch { }
    finally { setWindowsLoading(false); }
  }, []);

  useEffect(() => { if (tab === "faculty") loadFaculty(); }, [tab, loadFaculty]);
  useEffect(() => { if (tab === "courses") { loadCourses(); loadFaculty(); } }, [tab, loadCourses, loadFaculty]);
  useEffect(() => { if (tab === "windows") loadWindows(); }, [tab, loadWindows]);

  const handleDeleteFaculty = async () => {
    if (!deleteFaculty) return;
    setDeletingFaculty(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/faculty/${deleteFaculty.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setDeleteFaculty(undefined);
      loadFaculty();
    } catch (err: unknown) {
      alert((err as Error).message);
      setDeleteFaculty(undefined);
    } finally { setDeletingFaculty(false); }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;
    setDeletingCourse(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/courses/${deleteCourse.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setDeleteCourse(undefined);
      loadCourses();
    } catch (err: unknown) {
      alert((err as Error).message);
      setDeleteCourse(undefined);
    } finally { setDeletingCourse(false); }
  };

  const toggleWindow = async (w: WindowItem) => {
    setTogglingWindow(w.id);
    try {
      await fetch(`${getApiUrl()}/api/windows/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !w.isActive }),
      });
      setWindows(ws => ws.map(x => x.id === w.id ? { ...x, isActive: !w.isActive } : x));
    } catch { }
    finally { setTogglingWindow(null); }
  };

  if (role !== "hod" || !hod) return null;

  const s = data?.summary;

  const TABS = [
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "faculty" as Tab, label: "Faculty", icon: Users },
    { id: "courses" as Tab, label: "Courses", icon: BookMarked },
    { id: "windows" as Tab, label: "Feedback Windows", icon: CalendarRange },
  ];

  // Group courses by semester
  const coursesBySem = courses.reduce<Record<number, CourseItem[]>>((acc, c) => {
    (acc[c.semester] = acc[c.semester] ?? []).push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-base font-bold shadow-md">
              {hod.code}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{hod.name}</h1>
              <p className="text-muted-foreground text-sm">HOD: <span className="font-medium text-foreground">{hod.hodName}</span> &bull; {hod.hodEmployeeId}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pl-1">Academic Year 2024-25 &bull; Department Management Portal</p>
        </div>
        <Button onClick={() => { if (!data) return; setPdfLoading(true); setTimeout(() => { try { void generatePDF(data).catch(console.error); } catch(e){console.error(e);} finally{setPdfLoading(false);} }, 100); }}
          disabled={!data || pdfLoading || loading} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shrink-0">
          <Download className="w-4 h-4" />
          {pdfLoading ? "Generating…" : "PDF Report"}
        </Button>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 min-w-0 ${
              tab === t.id
                ? "bg-background shadow-sm text-foreground border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <t.icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          ANALYTICS TAB
      ═══════════════════════════════════════════════ */}
      {tab === "analytics" && (
        loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive bg-destructive/10 rounded-xl border">{error}</div>
        ) : data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Responses", value: s!.totalFeedback, icon: MessageSquare, color: "from-blue-500 to-blue-700" },
                { label: "Courses", value: s!.totalCourses, icon: BookOpen, color: "from-indigo-500 to-indigo-700" },
                { label: "Faculty", value: s!.totalFaculty, icon: Users, color: "from-violet-500 to-violet-700" },
                { label: "Avg Rating", value: s!.avgOverall ? s!.avgOverall.toFixed(2) : "—", icon: Star, color: "from-amber-500 to-amber-700" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="shadow-sm border overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Department Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RatingBar label="Course Content" value={s!.avgCourseContent} />
                <RatingBar label="Teaching Quality" value={s!.avgTeachingQuality} />
                <RatingBar label="Lab Facilities" value={s!.avgLabFacilities} />
                <RatingBar label="Study Material" value={s!.avgStudyMaterial} />
                <RatingBar label="Overall Satisfaction" value={s!.avgOverall} />
              </CardContent>
            </Card>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Faculty Performance</h2>
              <div className="space-y-2">
                {data.facultyStats.map(f => (
                  <Card key={f.id} className="shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedFaculty(expandedFaculty === f.id ? null : f.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                          {f.name.split(" ").pop()?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.designation} &bull; {f.employeeId ?? "—"}</div>
                          <div className="text-xs text-muted-foreground/60 truncate max-w-[200px]">{f.courseNames || "No courses assigned"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{f.feedbackCount} responses</div>
                          <RatingChip value={f.avgOverall} />
                        </div>
                        {expandedFaculty === f.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    {expandedFaculty === f.id && (
                      <CardContent className="pt-0 border-t space-y-2.5 bg-muted/10">
                        <RatingBar label="Course Content" value={f.avgCourseContent} />
                        <RatingBar label="Teaching Quality" value={f.avgTeachingQuality} />
                        <RatingBar label="Lab Facilities" value={f.avgLabFacilities} />
                        <RatingBar label="Study Material" value={f.avgStudyMaterial} />
                      </CardContent>
                    )}
                  </Card>
                ))}
                {data.facultyStats.length === 0 && <p className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-lg">No faculty data yet.</p>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Course-wise Feedback</h2>
              <div className="overflow-x-auto rounded-xl border shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 border-b">
                    <tr>{["Code", "Course", "Sem", "Faculty", "Resp.", "Content", "Teaching", "Lab", "Material", "Overall"].map(h => <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.courseStats.map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                        <td className="px-3 py-2.5 max-w-[150px] truncate font-medium">{c.name}</td>
                        <td className="px-3 py-2.5 text-center text-muted-foreground">{c.semester}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[110px] truncate">{c.facultyName}</td>
                        <td className="px-3 py-2.5 text-center font-semibold">{c.feedbackCount}</td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgCourseContent} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgTeachingQuality} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgLabFacilities} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgStudyMaterial} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgOverall} /></td>
                      </tr>
                    ))}
                    {data.courseStats.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No courses yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {data.recentComments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Recent Student Comments</h2>
                <div className="space-y-2">
                  {data.recentComments.map((c, i) => (
                    <div key={i} className="p-3 bg-muted/30 border-l-4 border-primary/40 rounded-r-xl hover:bg-muted/50 transition-colors">
                      <p className="text-sm italic text-muted-foreground">"{c.comment}"</p>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground/70">
                        <span>Course: <strong>{c.courseCode}</strong></span>
                        {c.section && <span>Section: <strong>{c.section}</strong></span>}
                        <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════════
          FACULTY MANAGEMENT TAB
      ═══════════════════════════════════════════════ */}
      {tab === "faculty" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-violet-500" /> Faculty Management</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{hod.name} — {facultyList.length} teacher{facultyList.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadFaculty} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1.5" onClick={() => { setEditFaculty(undefined); setShowFacultyModal(true); }}>
                <UserPlus className="w-4 h-4" /> Add Teacher
              </Button>
            </div>
          </div>

          {facultyLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : facultyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">No faculty members yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Add your first teacher to get started</p>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1.5" onClick={() => { setEditFaculty(undefined); setShowFacultyModal(true); }}>
                <UserPlus className="w-4 h-4" /> Add Teacher
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {facultyList.map(f => (
                <Card key={f.id} className="shadow-sm overflow-hidden group">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => setExpandedFacultyId(expandedFacultyId === f.id ? null : f.id)}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {f.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{f.name}</span>
                        <Badge variant="secondary" className="text-xs">{f.designation}</Badge>
                        {f.employeeId && <span className="text-xs font-mono text-muted-foreground">{f.employeeId}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {f.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{f.email}</span>}
                        {f.qualification && <span className="text-xs text-muted-foreground">{f.qualification}</span>}
                        <span className="text-xs text-muted-foreground">{f.assignedCourses.length} course{f.assignedCourses.length !== 1 ? "s" : ""}</span>
                        {f.totalFeedbackCount > 0 && <span className="text-xs text-muted-foreground">{f.totalFeedbackCount} responses</span>}
                      </div>
                    </div>

                    {/* Rating + Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <RatingChip value={f.avgRating} />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          className="w-7 h-7 rounded-lg bg-muted hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center transition-colors"
                          onClick={() => { setEditFaculty(f); setShowFacultyModal(true); }}
                          title="Edit faculty"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg bg-muted hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                          onClick={() => setDeleteFaculty(f)}
                          title="Delete faculty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {expandedFacultyId === f.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedFacultyId === f.id && (
                    <div className="border-t bg-muted/10 px-4 py-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Employee ID", value: f.employeeId ?? "—", icon: Building2 },
                          { label: "Qualification", value: f.qualification ?? "—", icon: GraduationCap },
                          { label: "Specialization", value: f.specialization ?? "—", icon: Star },
                          { label: "Avg Rating", value: f.avgRating ? f.avgRating.toFixed(2) + "/5" : "No data", icon: TrendingUp },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="bg-background rounded-lg p-3 border">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1"><Icon className="w-3.5 h-3.5" />{label}</div>
                            <p className="text-sm font-medium truncate">{value}</p>
                          </div>
                        ))}
                      </div>

                      {f.assignedCourses.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assigned Courses</p>
                          <div className="flex flex-wrap gap-2">
                            {f.assignedCourses.map(c => (
                              <div key={c.id} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                  <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">{c.code}</span>
                                  <span className="text-xs text-muted-foreground ml-1.5">{c.name} • Sem {c.semester}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {f.assignedCourses.length === 0 && (
                        <div className="text-sm text-muted-foreground p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          No courses assigned. Go to <button className="underline text-amber-700 dark:text-amber-300 ml-1" onClick={() => setTab("courses")}>Courses tab</button> to assign.
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditFaculty(f); setShowFacultyModal(true); }}>
                          <Pencil className="w-3.5 h-3.5" /> Edit Details
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200" onClick={() => setDeleteFaculty(f)}>
                          <Trash2 className="w-3.5 h-3.5" /> Remove Faculty
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Faculty summary */}
          {facultyList.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Faculty", value: facultyList.length, icon: Users, color: "text-violet-600" },
                { label: "With Courses", value: facultyList.filter(f => f.assignedCourses.length > 0).length, icon: BookOpen, color: "text-indigo-600" },
                { label: "With Feedback", value: facultyList.filter(f => f.totalFeedbackCount > 0).length, icon: MessageSquare, color: "text-emerald-600" },
                { label: "Dept Avg Rating", value: (() => { const r = facultyList.filter(f => f.avgRating); return r.length ? (r.reduce((s, f) => s + f.avgRating!, 0) / r.length).toFixed(2) : "—"; })(), icon: Star, color: "text-amber-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className={`w-7 h-7 ${color} shrink-0`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          COURSE MANAGEMENT TAB
      ═══════════════════════════════════════════════ */}
      {tab === "courses" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><BookMarked className="w-5 h-5 text-indigo-500" /> Course Management</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""} across {Object.keys(coursesBySem).length} semester{Object.keys(coursesBySem).length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadCourses} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => { setEditCourse(undefined); setShowCourseModal(true); }}>
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </div>
          </div>

          {coursesLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">No courses yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Add courses and assign faculty members</p>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => { setEditCourse(undefined); setShowCourseModal(true); }}>
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(coursesBySem).sort((a, b) => Number(a) - Number(b)).map(sem => (
                <div key={sem}>
                  {/* Semester header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px bg-border flex-1" />
                    <div className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Layers className="w-3 h-3" /> Semester {sem}
                    </div>
                    <div className="h-px bg-border flex-1" />
                  </div>

                  <div className="space-y-2">
                    {coursesBySem[Number(sem)].map(c => (
                      <Card key={c.id} className="shadow-sm group overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Code badge */}
                            <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold shrink-0 text-center min-w-[70px]">
                              {c.code}
                            </div>

                            {/* Course info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{c.name}</p>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">{c.credits} credits</span>
                                <span className="text-xs text-muted-foreground">{c.academicYear}</span>
                                {c.facultyName ? (
                                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                    <Users className="w-3 h-3" />{c.facultyName}
                                  </span>
                                ) : (
                                  <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> No faculty assigned
                                  </span>
                                )}
                                {c.feedbackCount > 0 && <span className="text-xs text-muted-foreground">{c.feedbackCount} feedback</span>}
                              </div>
                            </div>

                            {/* Rating + Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <RatingChip value={c.avgRating} />
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="w-7 h-7 rounded-lg bg-muted hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 flex items-center justify-center transition-colors"
                                  onClick={() => { setEditCourse(c); setShowCourseModal(true); }}
                                  title="Edit course"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-lg bg-muted hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 flex items-center justify-center transition-colors"
                                  onClick={() => setDeleteCourse(c)}
                                  title="Delete course"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Course summary cards */}
          {courses.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-indigo-600" },
                { label: "Faculty Assigned", value: courses.filter(c => c.facultyId).length, icon: Users, color: "text-violet-600" },
                { label: "With Feedback", value: courses.filter(c => c.feedbackCount > 0).length, icon: MessageSquare, color: "text-emerald-600" },
                { label: "Avg Rating", value: (() => { const r = courses.filter(c => c.avgRating); return r.length ? (r.reduce((s, c) => s + c.avgRating!, 0) / r.length).toFixed(2) : "—"; })(), icon: TrendingUp, color: "text-amber-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className={`w-7 h-7 ${color} shrink-0`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          FEEDBACK WINDOWS TAB
      ═══════════════════════════════════════════════ */}
      {tab === "windows" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><CalendarRange className="w-5 h-5 text-teal-500" /> Feedback Windows</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Control when students can submit feedback</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadWindows} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1.5" onClick={() => setShowCreateWindow(true)}>
                <Plus className="w-4 h-4" /> Create Window
              </Button>
            </div>
          </div>

          {windowsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : windows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">No feedback windows</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Create a window to allow student submissions</p>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1.5" onClick={() => setShowCreateWindow(true)}>
                <Plus className="w-4 h-4" /> Create Window
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {windows.map(w => {
                const now = new Date(), start = new Date(w.startDate), end = new Date(w.endDate);
                const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
                const elapsed = Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)));
                const isRunning = w.isActive && now >= start && now <= end;
                const typeLabel: Record<string, string> = { semester_end: "Semester End", mid_semester: "Mid-Semester", event_based: "Event Based", placement: "Placement" };

                return (
                  <Card key={w.id} className={`shadow-sm overflow-hidden transition-all ${isRunning ? "border-emerald-300 dark:border-emerald-800" : ""}`}>
                    {isRunning && <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sm">{w.title}</h3>
                            <WindowStatus w={w} />
                            <Badge variant="outline" className="text-xs">{typeLabel[w.feedbackType] ?? w.feedbackType}</Badge>
                            <Badge variant="outline" className="text-xs">Sem {w.semester}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(w.startDate).toLocaleDateString("en-IN")} — {new Date(w.endDate).toLocaleDateString("en-IN")}</span>
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{w.academicYear}</span>
                            {w.departmentIds.length === 0 && <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><GraduationCap className="w-3 h-3" />All Departments</span>}
                          </div>
                          {isRunning && (
                            <div className="mt-2.5">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{daysLeft <= 0 ? "Closes today!" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}</span>
                                <span className="text-muted-foreground">{elapsed}% elapsed</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${elapsed}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleWindow(w)}
                          disabled={togglingWindow === w.id}
                          title={w.isActive ? "Deactivate" : "Activate"}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            w.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-muted text-muted-foreground border-border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          }`}
                        >
                          {togglingWindow === w.id
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : w.isActive ? <><ToggleRight className="w-4 h-4" />Active</> : <><ToggleLeft className="w-4 h-4" />Inactive</>}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {windows.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Windows", value: windows.length, icon: CalendarRange, color: "text-teal-600" },
                { label: "Active", value: windows.filter(w => w.isActive).length, icon: CheckCircle2, color: "text-emerald-600" },
                { label: "Currently Open", value: windows.filter(w => { const n=new Date(); return w.isActive && n>=new Date(w.startDate) && n<=new Date(w.endDate); }).length, icon: Clock, color: "text-blue-600" },
                { label: "Expired", value: windows.filter(w => new Date() > new Date(w.endDate)).length, icon: XCircle, color: "text-red-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className={`w-7 h-7 ${color} shrink-0`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showFacultyModal && hod && (
        <FacultyModal
          deptId={hod.id}
          initial={editFaculty}
          onClose={() => { setShowFacultyModal(false); setEditFaculty(undefined); }}
          onSaved={loadFaculty}
        />
      )}
      {showCourseModal && hod && (
        <CourseModal
          deptId={hod.id}
          faculty={facultyList}
          initial={editCourse}
          onClose={() => { setShowCourseModal(false); setEditCourse(undefined); }}
          onSaved={() => { loadCourses(); loadFaculty(); }}
        />
      )}
      {showCreateWindow && hod && (
        <CreateWindowModal
          deptId={hod.id}
          onClose={() => setShowCreateWindow(false)}
          onSaved={loadWindows}
        />
      )}

      {/* ── Delete Confirms ── */}
      {deleteFaculty && (
        <ConfirmDialog
          title="Remove Faculty Member?"
          message={`Are you sure you want to remove "${deleteFaculty.name}" from the department? This cannot be undone. Faculty with existing feedback cannot be deleted.`}
          onConfirm={handleDeleteFaculty}
          onCancel={() => setDeleteFaculty(undefined)}
          loading={deletingFaculty}
        />
      )}
      {deleteCourse && (
        <ConfirmDialog
          title="Delete Course?"
          message={`Are you sure you want to delete "${deleteCourse.code} — ${deleteCourse.name}"? Courses with existing student feedback cannot be deleted.`}
          onConfirm={handleDeleteCourse}
          onCancel={() => setDeleteCourse(undefined)}
          loading={deletingCourse}
        />
      )}
    </div>
  );
}
