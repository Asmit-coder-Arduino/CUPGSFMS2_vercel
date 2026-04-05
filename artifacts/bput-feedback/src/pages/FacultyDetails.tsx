import { useGetFacultyAnalytics } from "@workspace/api-client-react";
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

export default function FacultyDetails() {
  const params = useParams<{ id: string }>();
  const facultyId = parseInt(params.id ?? "0");
  const { data, isLoading } = useGetFacultyAnalytics(facultyId, { query: { enabled: !!facultyId } });

  if (isLoading) {
    return <div className="p-6 animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-48" /><div className="h-40 bg-muted rounded-lg" /></div>;
  }

  if (!data) return <div className="p-6 text-muted-foreground">Faculty not found.</div>;

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/faculty"><span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">Faculty</span></Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{data.facultyName}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-xl">{data.facultyName.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{data.facultyName}</h1>
          <p className="text-muted-foreground">{data.designation} · {data.departmentName}</p>
          <p className="text-sm text-muted-foreground mt-1">{data.totalFeedback} feedback responses</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-4xl font-bold text-primary">{data.avgOverall.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Overall Rating</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Performance Breakdown</h2>
          <div className="space-y-3">
            <RatingBar label="Course Content" value={data.avgCourseContent} />
            <RatingBar label="Teaching Quality" value={data.avgTeachingQuality} />
            <RatingBar label="Lab Facilities" value={data.avgLabFacilities} />
            <RatingBar label="Study Material" value={data.avgStudyMaterial} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Courses Taught</h2>
          <div className="space-y-3">
            {data.courses.map(c => (
              <div key={c.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.code} · Sem {c.semester} · {c.academicYear}</p>
                </div>
                {c.avgRating && (
                  <span className="text-sm font-bold text-primary ml-3 shrink-0">{c.avgRating.toFixed(2)}</span>
                )}
              </div>
            ))}
            {data.courses.length === 0 && <p className="text-muted-foreground text-sm">No courses assigned.</p>}
          </div>
        </div>
      </div>

      {data.recentComments.length > 0 && (
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Recent Student Comments</h2>
          <div className="space-y-3">
            {data.recentComments.map((comment, idx) => (
              <div key={idx} className="border-l-2 border-primary/30 pl-4 py-1">
                <p className="text-sm italic text-muted-foreground">"{comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}