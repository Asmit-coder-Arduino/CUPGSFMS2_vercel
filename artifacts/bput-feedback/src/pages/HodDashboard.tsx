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
  XCircle, AlertCircle, Pencil, BarChart3, BookMarked, CalendarRange,
  GraduationCap, Layers, ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { getCupgsLogoDataUrl } from "@/lib/pdfLogo";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Summary {
  totalFeedback: number; totalCourses: number; totalFaculty: number;
  avgOverall: number | null; avgCourseContent: number | null;
  avgTeachingQuality: number | null; avgLabFacilities: number | null; avgStudyMaterial: number | null;
}
interface FacultyStat {
  id: number; name: string; designation: string; employeeId: string;
  courseCount: number; courseNames: string; feedbackCount: number;
  avgOverall: number | null; avgCourseContent: number | null; avgTeachingQuality: number | null;
  avgLabFacilities: number | null; avgStudyMaterial: number | null;
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
interface CourseItem {
  id: number; code: string; name: string; departmentId: number;
  departmentName: string | null; facultyId: number | null; facultyName: string | null;
  semester: number; academicYear: string; credits: number;
  avgRating: number | null; feedbackCount: number;
}
interface FacultyItem {
  id: number; name: string; designation: string; departmentId: number; avgRating: number | null;
}
interface WindowItem {
  id: number; title: string; feedbackType: string; academicYear: string;
  semester: number; startDate: string; endDate: string; isActive: boolean;
  departmentIds: number[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number | null) { return v != null ? v.toFixed(2) : "—"; }

function RatingChip({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = value >= 4 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
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

function WindowStatus({ w }: { w: WindowItem }) {
  const now = new Date();
  const start = new Date(w.startDate);
  const end = new Date(w.endDate);
  if (!w.isActive) return <Badge variant="secondary" className="text-xs gap-1"><XCircle className="w-3 h-3" /> Inactive</Badge>;
  if (now < start) return <Badge className="text-xs gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0"><Clock className="w-3 h-3" /> Upcoming</Badge>;
  if (now > end) return <Badge className="text-xs gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0"><AlertCircle className="w-3 h-3" /> Expired</Badge>;
  return <Badge className="text-xs gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"><CheckCircle2 className="w-3 h-3" /> Active</Badge>;
}

// ─── PDF Generator ───────────────────────────────────────────────────────────

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
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 71, 115);
    doc.text(text, margin, y);
    doc.setTextColor(0, 0, 0);
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
    head: [["Faculty Name", "Designation", "Employee ID", "Courses", "Responses", "Overall", "Content", "Teaching", "Lab", "Material"]],
    body: facultyStats.map(f => [f.name, f.designation, f.employeeId ?? "—", f.courseCount.toString(), f.feedbackCount.toString(), fmt(f.avgOverall), fmt(f.avgCourseContent), fmt(f.avgTeachingQuality), fmt(f.avgLabFacilities), fmt(f.avgStudyMaterial)]),
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [245, 248, 255] }, theme: "grid",
    didDrawCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index >= 5) {
        const val = parseFloat(hookData.cell.raw as string);
        if (!isNaN(val)) {
          const color = val >= 4 ? [0, 128, 0] : val >= 3 ? [200, 150, 0] : [200, 0, 0];
          doc.setTextColor(color[0], color[1], color[2]);
        }
      }
    },
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

// ─── Modals ──────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        className="relative w-full max-w-lg bg-card border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Add Course Modal ─────────────────────────────────────────────────────────

function AddCourseModal({ deptId, faculty, onClose, onSaved }: {
  deptId: number; faculty: FacultyItem[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({ code: "", name: "", semester: "1", academicYear: "2024-25", credits: "4", facultyId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) { setError("Course code and name are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          semester: parseInt(form.semester),
          academicYear: form.academicYear,
          credits: parseInt(form.credits),
          departmentId: deptId,
          facultyId: form.facultyId ? parseInt(form.facultyId) : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onSaved(); onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create course.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Add New Course" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Course Code" required>
            <input className={inputCls} placeholder="e.g. BSMA1101" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </InputField>
          <InputField label="Credits" required>
            <select className={selectCls} value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}>
              {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c} Credits</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Course Name" required>
          <input className={inputCls} placeholder="e.g. Mathematics – I (Calculus)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </InputField>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Semester" required>
            <select className={selectCls} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </InputField>
          <InputField label="Academic Year" required>
            <select className={selectCls} value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}>
              {["2023-24","2024-25","2025-26"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </InputField>
        </div>

        <InputField label="Assigned Faculty">
          <select className={selectCls} value={form.facultyId} onChange={e => setForm(f => ({ ...f, facultyId: e.target.value }))}>
            <option value="">— Not assigned —</option>
            {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>)}
          </select>
        </InputField>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
            {saving ? "Adding…" : "Add Course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Create Window Modal ──────────────────────────────────────────────────────

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
          title: form.title.trim(),
          feedbackType: form.feedbackType,
          academicYear: form.academicYear,
          semester: parseInt(form.semester),
          startDate: form.startDate,
          endDate: form.endDate,
          departmentIds: form.forAll ? [] : [deptId],
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      onSaved(); onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create window.");
    } finally { setSaving(false); }
  };

  const typeLabels: Record<string, string> = {
    semester_end: "Semester End", mid_semester: "Mid-Semester",
    event_based: "Event Based", placement: "Placement",
  };

  return (
    <Modal title="Create Feedback Window" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

        <InputField label="Window Title" required>
          <input className={inputCls} placeholder="e.g. Even Semester End Feedback 2024-25" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </InputField>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Feedback Type" required>
            <select className={selectCls} value={form.feedbackType} onChange={e => setForm(f => ({ ...f, feedbackType: e.target.value }))}>
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
            {["2023-24","2024-25","2025-26"].map(y => <option key={y} value={y}>{y}</option>)}
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
          <input type="checkbox" checked={form.forAll} onChange={e => setForm(f => ({ ...f, forAll: e.target.checked }))} className="w-4 h-4 rounded text-primary" />
          <div>
            <p className="text-sm font-medium">Apply to all departments</p>
            <p className="text-xs text-muted-foreground">If unchecked, window will only apply to your department</p>
          </div>
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={saving}>
            {saving ? "Creating…" : "Create Window"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = "analytics" | "courses" | "windows";

export default function HodDashboard() {
  const { role, hod } = useRole();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<Tab>("analytics");
  const [data, setData] = useState<HodReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);

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

  const loadCourses = useCallback(async () => {
    if (!hod) return;
    setCoursesLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/courses?departmentId=${hod.id}`),
        fetch(`${getApiUrl()}/api/faculty?departmentId=${hod.id}`),
      ]);
      setCourses(await cRes.json());
      setFaculty(await fRes.json());
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

  useEffect(() => { if (tab === "courses") loadCourses(); }, [tab, loadCourses]);
  useEffect(() => { if (tab === "windows") loadWindows(); }, [tab, loadWindows]);

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

  const handleDownloadPDF = () => {
    if (!data) return;
    setPdfLoading(true);
    setTimeout(() => {
      try { void generatePDF(data).catch(console.error); }
      catch (e) { console.error(e); }
      finally { setPdfLoading(false); }
    }, 100);
  };

  const s = data?.summary;

  const tabs = [
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "courses" as Tab, label: "Course Management", icon: BookMarked },
    { id: "windows" as Tab, label: "Feedback Windows", icon: CalendarRange },
  ];

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
          <p className="text-sm text-muted-foreground pl-1">Academic Year 2024-25 | HOD Dashboard</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={!data || pdfLoading || loading}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 shrink-0">
          <Download className="w-4 h-4" />
          {pdfLoading ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      {/* ── Tab Nav ── */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? "bg-background shadow-sm text-foreground border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ ANALYTICS TAB ═══════════════ */}
      {tab === "analytics" && (
        loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl border">{error}</div>
        ) : data && (
          <div className="space-y-6">
            {/* Stats */}
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

            {/* Rating bars */}
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

            {/* Faculty */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Faculty Performance</h2>
              <div className="space-y-3">
                {data.facultyStats.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-4 bg-muted/30 rounded-lg">No faculty data available.</p>
                ) : data.facultyStats.map(f => (
                  <Card key={f.id} className="shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedFaculty(expandedFaculty === f.id ? null : f.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                          {f.name.split(" ").slice(-1)[0].charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.designation} &bull; {f.employeeId ?? "—"}</div>
                          <div className="text-xs text-muted-foreground/70">{f.courseNames || "No courses"}</div>
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
              </div>
            </div>

            {/* Course table */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Course-wise Feedback</h2>
              <div className="overflow-x-auto rounded-xl border shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 border-b">
                    <tr>
                      {["Code", "Course", "Sem", "Faculty", "Responses", "Content", "Teaching", "Lab", "Material", "Overall"].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.courseStats.map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                        <td className="px-3 py-2.5 max-w-[160px] truncate font-medium">{c.name}</td>
                        <td className="px-3 py-2.5 text-center text-muted-foreground">{c.semester}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[120px] truncate">{c.facultyName}</td>
                        <td className="px-3 py-2.5 text-center font-semibold">{c.feedbackCount}</td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgCourseContent} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgTeachingQuality} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgLabFacilities} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgStudyMaterial} /></td>
                        <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgOverall} /></td>
                      </tr>
                    ))}
                    {data.courseStats.length === 0 && (
                      <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No course data yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments */}
            {data.recentComments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Recent Student Comments</h2>
                <div className="space-y-2">
                  {data.recentComments.map((c, i) => (
                    <div key={i} className="p-3 bg-muted/30 border-l-4 border-primary/40 rounded-r-xl hover:bg-muted/50 transition-colors">
                      <div className="text-sm italic text-muted-foreground">"{c.comment}"</div>
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

      {/* ═══════════════ COURSE MANAGEMENT TAB ═══════════════ */}
      {tab === "courses" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><BookMarked className="w-5 h-5 text-indigo-500" /> Course Management</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Manage courses for {hod.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadCourses} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => setShowAddCourse(true)}>
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </div>
          </div>

          {coursesLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <GraduationCap className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No courses yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Add your first course to get started</p>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => setShowAddCourse(true)}>
                <Plus className="w-4 h-4" /> Add Course
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 border-b sticky top-0">
                  <tr>
                    {["Code", "Course Name", "Sem", "Credits", "Faculty", "Responses", "Avg Rating"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{c.code}</span>
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[200px]">
                        <div className="truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.academicYear}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">Sem {c.semester}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs">{c.credits} Cr</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.facultyName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-bold shrink-0">
                              {c.facultyName.charAt(0)}
                            </div>
                            <span className="text-xs truncate max-w-[120px]">{c.facultyName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold ${c.feedbackCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                          {c.feedbackCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><RatingChip value={c.avgRating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary cards */}
          {courses.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-indigo-600" },
                { label: "With Faculty", value: courses.filter(c => c.facultyId).length, icon: Users, color: "text-violet-600" },
                { label: "With Feedback", value: courses.filter(c => c.feedbackCount > 0).length, icon: MessageSquare, color: "text-emerald-600" },
                { label: "Avg Rating", value: (() => { const r = courses.filter(c => c.avgRating); return r.length ? (r.reduce((s, c) => s + c.avgRating!, 0) / r.length).toFixed(2) : "—"; })(), icon: TrendingUp, color: "text-amber-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${color} shrink-0`} />
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

      {/* ═══════════════ FEEDBACK WINDOWS TAB ═══════════════ */}
      {tab === "windows" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><CalendarRange className="w-5 h-5 text-teal-500" /> Feedback Windows</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Manage when students can submit feedback</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadWindows} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1.5" onClick={() => setShowCreateWindow(true)}>
                <Plus className="w-4 h-4" /> Create Window
              </Button>
            </div>
          </div>

          {windowsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : windows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No feedback windows</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Create a window to allow students to submit feedback</p>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-1.5" onClick={() => setShowCreateWindow(true)}>
                <Plus className="w-4 h-4" /> Create Window
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {windows.map(w => {
                const now = new Date();
                const start = new Date(w.startDate);
                const end = new Date(w.endDate);
                const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isRunning = w.isActive && now >= start && now <= end;
                const typeLabels: Record<string, string> = {
                  semester_end: "Semester End", mid_semester: "Mid-Semester",
                  event_based: "Event Based", placement: "Placement",
                };

                return (
                  <Card key={w.id} className={`shadow-sm overflow-hidden transition-all ${isRunning ? "border-emerald-300 dark:border-emerald-800" : ""}`}>
                    {isRunning && <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sm">{w.title}</h3>
                            <WindowStatus w={w} />
                            <Badge variant="outline" className="text-xs">{typeLabels[w.feedbackType] ?? w.feedbackType}</Badge>
                            <Badge variant="outline" className="text-xs">Sem {w.semester}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(w.startDate).toLocaleDateString("en-IN")} — {new Date(w.endDate).toLocaleDateString("en-IN")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {w.academicYear}
                            </span>
                            {w.departmentIds.length === 0 && (
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <GraduationCap className="w-3 h-3" /> All Departments
                              </span>
                            )}
                          </div>
                          {isRunning && daysLeft >= 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {daysLeft === 0 ? "Closes today!" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} remaining`}
                                </span>
                                <span className="text-muted-foreground">
                                  {Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)}% elapsed
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleWindow(w)}
                          disabled={togglingWindow === w.id}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            w.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:hover:border-red-800"
                              : "bg-muted text-muted-foreground border-border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
                          }`}
                          title={w.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          {togglingWindow === w.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : w.isActive ? (
                            <><ToggleRight className="w-4 h-4" /> Active</>
                          ) : (
                            <><ToggleLeft className="w-4 h-4" /> Inactive</>
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Window summary */}
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
                    <Icon className={`w-8 h-8 ${color} shrink-0`} />
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
      {showAddCourse && hod && (
        <AddCourseModal
          deptId={hod.id}
          faculty={faculty}
          onClose={() => setShowAddCourse(false)}
          onSaved={loadCourses}
        />
      )}
      {showCreateWindow && hod && (
        <CreateWindowModal
          deptId={hod.id}
          onClose={() => setShowCreateWindow(false)}
          onSaved={loadWindows}
        />
      )}
    </div>
  );
}
