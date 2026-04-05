import { useGetDepartmentAnalytics } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full" style={{ width: `${(value/5)*100}%` }} />
      </div>
      <span className="text-sm font-semibold w-8">{value.toFixed(2)}</span>
    </div>
  );
}

export default function DepartmentDetails() {
  const params = useParams<{ id: string }>();
  const deptId = parseInt(params.id ?? "0");
  const { data, isLoading } = useGetDepartmentAnalytics(deptId, { query: { enabled: !!deptId } });

  if (isLoading) {
    return <div className="p-6 animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-48" /><div className="h-40 bg-muted rounded-lg" /></div>;
  }

  if (!data) return <div className="p-6 text-muted-foreground">Department not found.</div>;

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/departments"><span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">Departments</span></Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{data.departmentName}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{data.departmentName}</h1>
        <p className="text-muted-foreground text-sm mt-1">{data.totalFeedback} feedback responses collected</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Parameter Ratings</h2>
          <div className="space-y-3">
            <RatingBar label="Course Content" value={data.avgCourseContent} />
            <RatingBar label="Teaching Quality" value={data.avgTeachingQuality} />
            <RatingBar label="Lab Facilities" value={data.avgLabFacilities} />
            <RatingBar label="Study Material" value={data.avgStudyMaterial} />
            <div className="border-t pt-3">
              <RatingBar label="Overall" value={data.avgRating} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Faculty Performance</h2>
          <div className="space-y-3">
            {data.facultyPerformance.map(f => (
              <Link key={f.id} href={`/faculty/${f.id}`}>
                <div className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 -mx-2 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.designation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {f.avgRating ? <span className="text-sm font-bold text-primary">{f.avgRating.toFixed(2)}</span> : <span className="text-xs text-muted-foreground">No data</span>}
                    <p className="text-xs text-muted-foreground">{f.totalFeedbackCount} reviews</p>
                  </div>
                </div>
              </Link>
            ))}
            {data.facultyPerformance.length === 0 && <p className="text-muted-foreground text-sm">No faculty data.</p>}
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-5">
        <h2 className="font-semibold mb-4">Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.topCourses.map(c => (
            <div key={c.id} className="flex items-center justify-between border rounded-md px-4 py-3">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.code} · Sem {c.semester} · {c.facultyName}</p>
              </div>
              <div className="text-right ml-3">
                {c.avgRating ? <span className="text-sm font-bold text-primary">{c.avgRating.toFixed(2)}</span> : <span className="text-xs text-muted-foreground">No data</span>}
                <p className="text-xs text-muted-foreground">{c.feedbackCount} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}