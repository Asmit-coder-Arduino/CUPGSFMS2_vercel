import { useGetDashboardSummary, useGetTopRated } from "@workspace/api-client-react";
import { Link } from "wouter";

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
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Institution-wide feedback overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Feedback" value={summary.totalFeedback.toLocaleString()} />
        <StatCard label="Avg Overall Rating" value={summary.avgOverallRating.toFixed(2)} sub="out of 5.0" />
        <StatCard label="Active Windows" value={summary.activeWindows} />
        <StatCard label="Departments" value={summary.totalDepartments} sub={`${summary.totalFaculty} faculty`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {topRated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      )}
    </div>
  );
}