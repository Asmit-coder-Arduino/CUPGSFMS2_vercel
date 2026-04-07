import { useGetDashboardSummary, useGetTopRated, useListDepartments } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { ScrollReveal } from "@/components/ScrollReveal";

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border rounded-lg p-5">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? "text-amber-400" : "text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function HodManagementSection() {
  const { data: departments, isLoading } = useListDepartments();
  const queryClient = useQueryClient();
  const { adminPassword } = useRole();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ hodName: "", hodEmployeeId: "", hodPin: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const startEdit = (dept: { id: number; hodName?: string | null; hodEmployeeId?: string | null }) => {
    setEditingId(dept.id);
    setEditForm({
      hodName: dept.hodName || "",
      hodEmployeeId: dept.hodEmployeeId || "",
      hodPin: "",
    });
    setMsg("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setMsg("");
    try {
      const body: Record<string, string> = {};
      if (editForm.hodName.trim()) body.hodName = editForm.hodName.trim();
      if (editForm.hodEmployeeId.trim()) body.hodEmployeeId = editForm.hodEmployeeId.trim();
      if (editForm.hodPin.trim()) body.hodPin = editForm.hodPin.trim();

      const res = await fetch(`${getApiUrl()}/api/departments/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      setMsg("Updated successfully!");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["listDepartments"] });
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="bg-card border rounded-lg p-5"><div className="h-6 bg-muted rounded w-48 animate-pulse" /></div>;
  if (!departments || departments.length === 0) return null;

  return (
    <div className="bg-card border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold">HOD Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage department heads and their login credentials</p>
        </div>
      </div>
      <div className="space-y-3">
        {departments.map((dept: { id: number; name: string; code: string; hodName?: string | null; hodEmployeeId?: string | null }) => (
          <div key={dept.id} className="border rounded-lg p-4">
            {editingId === dept.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{dept.code}</span>
                  <span className="text-sm font-semibold">{dept.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">HOD Name</label>
                    <input
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={editForm.hodName}
                      onChange={e => setEditForm(f => ({ ...f, hodName: e.target.value }))}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Employee ID</label>
                    <input
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background font-mono"
                      value={editForm.hodEmployeeId}
                      onChange={e => setEditForm(f => ({ ...f, hodEmployeeId: e.target.value }))}
                      placeholder="HOD/CSE/001"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">New PIN (leave blank to keep)</label>
                    <input
                      type="password"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={editForm.hodPin}
                      onChange={e => setEditForm(f => ({ ...f, hodPin: e.target.value }))}
                      placeholder="••••••"
                    />
                  </div>
                </div>
                {msg && <p className={`text-xs ${msg.includes("success") ? "text-green-600" : "text-destructive"}`}>{msg}</p>}
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditingId(null); setMsg(""); }}
                    className="px-4 py-1.5 text-xs font-semibold border rounded-md hover:bg-muted">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{dept.code}</span>
                  <div>
                    <p className="text-sm font-medium">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.hodName ? (
                        <>HOD: <span className="font-semibold text-foreground">{dept.hodName}</span> · <span className="font-mono">{dept.hodEmployeeId}</span></>
                      ) : (
                        <span className="text-amber-500">No HOD assigned</span>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={() => startEdit(dept)}
                  className="text-xs font-semibold text-primary hover:underline">
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: topRated } = useGetTopRated();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}</div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <ScrollReveal direction="fade">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Institution-wide feedback overview</p>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          <StatCard label="Total Feedback" value={summary.totalFeedback.toLocaleString()} />,
          <StatCard label="Avg Overall Rating" value={summary.avgOverallRating.toFixed(2)} sub="out of 5.0" />,
          <StatCard label="Active Windows" value={summary.activeWindows} />,
          <StatCard label="Departments" value={summary.totalDepartments} sub={`${summary.totalFaculty} faculty`} />,
        ].map((card, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 60}>{card}</ScrollReveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal direction="left">
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Rating Breakdown</h2>
          <div className="space-y-3">
            <RatingBar label="Course Content" value={summary.ratingBreakdown.courseContent} />
            <RatingBar label="Teaching Quality" value={summary.ratingBreakdown.teachingQuality} />
            <RatingBar label="Lab Facilities" value={summary.ratingBreakdown.labFacilities} />
            <RatingBar label="Study Material" value={summary.ratingBreakdown.studyMaterial} />
            <RatingBar label="Overall" value={summary.ratingBreakdown.overall} />
          </div>
        </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {summary.recentFeedback.length === 0 && <p className="text-muted-foreground text-sm">No feedback yet.</p>}
            {summary.recentFeedback.map((fb) => (
              <div key={fb.id} className="flex items-start justify-between gap-3 border-b last:border-0 pb-3 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fb.courseName ?? fb.courseCode}</p>
                  <p className="text-xs text-muted-foreground">{fb.departmentName} · Sem {fb.semester}</p>
                  {fb.comments && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{fb.comments}"</p>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <StarRating value={fb.ratingOverall} />
                  <span className="text-xs text-muted-foreground">{fb.isAnonymous ? "Anonymous" : "Named"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="up">
        <HodManagementSection />
      </ScrollReveal>

      {topRated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScrollReveal direction="left" delay={0}>
          <div className="bg-card border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Top Rated Faculty</h2>
            <div className="space-y-2">
              {topRated.topFaculty.map((f, idx) => (
                <Link key={f.id} href={`/faculty/${f.id}`}>
                  <div className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 -mx-2 cursor-pointer transition-colors">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{idx+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.designation} · {f.departmentName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">{f.avgRating?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{f.totalFeedbackCount} reviews</p>
                    </div>
                  </div>
                </Link>
              ))}
              {topRated.topFaculty.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
            </div>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={80}>
          <div className="bg-card border rounded-lg p-5">
            <h2 className="font-semibold mb-4">Top Rated Courses</h2>
            <div className="space-y-2">
              {topRated.topCourses.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{idx+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.code} · {c.departmentName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{c.avgRating?.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{c.feedbackCount} reviews</p>
                  </div>
                </div>
              ))}
              {topRated.topCourses.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
            </div>
          </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
}