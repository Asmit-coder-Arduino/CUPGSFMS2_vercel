import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, MessageSquare, Users, TrendingUp, Download, FileText, Award, ChevronDown, ChevronUp } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Summary {
  totalFeedback: number;
  totalCourses: number;
  totalFaculty: number;
  avgOverall: number | null;
  avgCourseContent: number | null;
  avgTeachingQuality: number | null;
  avgLabFacilities: number | null;
  avgStudyMaterial: number | null;
}

interface FacultyStat {
  id: number;
  name: string;
  designation: string;
  employeeId: string;
  courseCount: number;
  courseNames: string;
  feedbackCount: number;
  avgOverall: number | null;
  avgCourseContent: number | null;
  avgTeachingQuality: number | null;
  avgLabFacilities: number | null;
  avgStudyMaterial: number | null;
}

interface CourseStat {
  id: number;
  code: string;
  name: string;
  semester: number;
  academicYear: string;
  credits: number;
  facultyName: string;
  feedbackCount: number;
  avgOverall: number | null;
  avgCourseContent: number | null;
  avgTeachingQuality: number | null;
  avgLabFacilities: number | null;
  avgStudyMaterial: number | null;
  recentComments: string[];
}

interface HodReportData {
  department: { id: number; name: string; code: string; hodName: string };
  summary: Summary;
  facultyStats: FacultyStat[];
  courseStats: CourseStat[];
  recentComments: Array<{ comment: string; courseCode: string; section: string; createdAt: string }>;
  generatedAt: string;
}

function fmt(v: number | null) {
  return v != null ? v.toFixed(2) : "—";
}

function RatingChip({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = value >= 4 ? "bg-emerald-100 text-emerald-700" : value >= 3 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
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
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function generatePDF(data: HodReportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { department, summary, facultyStats, courseStats, recentComments, generatedAt } = data;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;

  const addHeader = (title: string) => {
    doc.setFillColor(13, 71, 115);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CUPGS Academic Feedback Report", margin, 12);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${department.name} (${department.code})`, margin, 20);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(generatedAt).toLocaleString("en-IN")}`, pageW - margin, 20, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const sectionTitle = (text: string, y: number) => {
    doc.setFillColor(230, 240, 255);
    doc.rect(margin - 2, y - 5, pageW - (margin - 2) * 2, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 71, 115);
    doc.text(text, margin, y);
    doc.setTextColor(0, 0, 0);
    return y + 6;
  };

  addHeader("cover");
  let y = 36;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("HOD:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(department.hodName ?? "—", margin + 14, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Academic Year:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text("2024-25 | Even Semester", margin + 30, y);
  y += 10;

  y = sectionTitle("Department Summary", y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
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

  if (y > 240) { doc.addPage(); addHeader(""); y = 36; }
  y = sectionTitle("Faculty Performance Summary", y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Faculty Name", "Designation", "Employee ID", "Courses", "Responses", "Overall", "Content", "Teaching", "Lab", "Material"]],
    body: facultyStats.map(f => [
      f.name,
      f.designation,
      f.employeeId ?? "—",
      f.courseCount.toString(),
      f.feedbackCount.toString(),
      fmt(f.avgOverall),
      fmt(f.avgCourseContent),
      fmt(f.avgTeachingQuality),
      fmt(f.avgLabFacilities),
      fmt(f.avgStudyMaterial),
    ]),
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    theme: "grid",
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
  if (y > 240) { doc.addPage(); addHeader(""); y = 36; }
  y = sectionTitle("Course-wise Feedback Report", y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Code", "Course Name", "Sem", "Faculty", "Responses", "Overall", "Content", "Teaching", "Lab", "Material"]],
    body: courseStats.map(c => [
      c.code,
      c.name,
      `Sem ${c.semester}`,
      c.facultyName,
      c.feedbackCount.toString(),
      fmt(c.avgOverall),
      fmt(c.avgCourseContent),
      fmt(c.avgTeachingQuality),
      fmt(c.avgLabFacilities),
      fmt(c.avgStudyMaterial),
    ]),
    headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    theme: "grid",
  });

  if (recentComments.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 12;
    if (y > 240) { doc.addPage(); addHeader(""); y = 36; }
    y = sectionTitle("Recent Student Comments", y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Course", "Comment", "Section", "Date"]],
      body: recentComments.map(c => [
        c.courseCode,
        c.comment ?? "—",
        c.section ?? "—",
        new Date(c.createdAt).toLocaleDateString("en-IN"),
      ]),
      headStyles: { fillColor: [13, 71, 115], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 1: { cellWidth: 90 } },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      theme: "grid",
    });
  }

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — CUPGS Feedback Management System — Confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
  }

  doc.save(`CUPGS_${department.code}_Feedback_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function HodDashboard() {
  const { role, hod } = useRole();
  const [, navigate] = useLocation();
  const [data, setData] = useState<HodReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (role !== "hod" || !hod) { navigate("/"); return; }
    fetch(`${getApiUrl()}/api/departments/${hod.id}/hod-report`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError("Failed to load department data."))
      .finally(() => setLoading(false));
  }, [hod, role]);

  if (role !== "hod" || !hod) return null;

  const handleDownloadPDF = () => {
    if (!data) return;
    setPdfLoading(true);
    setTimeout(() => {
      try { generatePDF(data); }
      catch (e) { console.error(e); }
      finally { setPdfLoading(false); }
    }, 100);
  };

  const s = data?.summary;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              {hod.code}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{hod.name}</h1>
              <p className="text-muted-foreground text-sm">HOD: {hod.hodName} &bull; {hod.hodEmployeeId}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Academic Year 2024-25 | Even Semester End Feedback</p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={!data || pdfLoading || loading}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {pdfLoading ? "Generating PDF…" : "Download PDF Report"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">{error}</div>
      ) : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Responses", value: s!.totalFeedback, icon: MessageSquare },
              { label: "Courses", value: s!.totalCourses, icon: BookOpen },
              { label: "Faculty", value: s!.totalFaculty, icon: Users },
              { label: "Avg Rating", value: s!.avgOverall ? s!.avgOverall.toFixed(2) : "—", icon: TrendingUp, color: s!.avgOverall ? (s!.avgOverall >= 4 ? "text-emerald-600" : s!.avgOverall >= 3 ? "text-amber-600" : "text-red-500") : "" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="shadow-sm">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Icon className="w-4 h-4" />{label}
                  </div>
                  <div className={`text-3xl font-bold ${color ?? ""}`}>{value}</div>
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
            <h2 className="text-lg font-semibold mb-4">Faculty Performance</h2>
            <div className="space-y-3">
              {data.facultyStats.length === 0 ? (
                <p className="text-muted-foreground text-sm">No faculty data available.</p>
              ) : data.facultyStats.map(f => (
                <Card key={f.id} className="shadow-sm">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedFaculty(expandedFaculty === f.id ? null : f.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                        {f.name.split(" ").slice(-1)[0].charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.designation} &bull; {f.employeeId ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{f.courseNames || "No courses"}</div>
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
                    <CardContent className="pt-0 border-t space-y-2.5">
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

          <div>
            <h2 className="text-lg font-semibold mb-4">Course-wise Feedback</h2>
            <div className="overflow-x-auto rounded-lg border shadow-sm">
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
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold">{c.code}</td>
                      <td className="px-3 py-2.5 max-w-[160px] truncate">{c.name}</td>
                      <td className="px-3 py-2.5 text-center">{c.semester}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[120px] truncate">{c.facultyName}</td>
                      <td className="px-3 py-2.5 text-center">{c.feedbackCount}</td>
                      <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgCourseContent} /></td>
                      <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgTeachingQuality} /></td>
                      <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgLabFacilities} /></td>
                      <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgStudyMaterial} /></td>
                      <td className="px-3 py-2.5 text-center"><RatingChip value={c.avgOverall} /></td>
                    </tr>
                  ))}
                  {data.courseStats.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-6 text-muted-foreground">No course data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {data.recentComments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Recent Student Comments
              </h2>
              <div className="space-y-2">
                {data.recentComments.map((c, i) => (
                  <div key={i} className="p-3 bg-muted/40 border-l-4 border-primary/40 rounded-r-lg">
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
        </>
      )}
    </div>
  );
}
