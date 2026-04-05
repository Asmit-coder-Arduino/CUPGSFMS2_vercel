import { useListDepartments } from "@workspace/api-client-react";
import { Link } from "wouter";

function RatingBadge({ value }: { value?: number | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">No data</span>;
  const color = value >= 4 ? "text-green-700 bg-green-100" : value >= 3 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>{value.toFixed(2)}</span>;
}

export default function Departments() {
  const { data: departments, isLoading } = useListDepartments();

  if (isLoading) {
    return (
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-8 bg-muted rounded w-40 mb-6" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <p className="text-muted-foreground text-sm mt-1">Performance overview across all departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments?.map(dept => (
          <Link key={dept.id} href={`/departments/${dept.id}`}>
            <div className="bg-card border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{dept.code}</span>
                  <h3 className="font-semibold mt-2 group-hover:text-primary transition-colors">{dept.name}</h3>
                </div>
                <RatingBadge value={dept.avgRating} />
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{dept.totalFaculty} faculty</span>
                <span>{dept.totalCourses} courses</span>
              </div>
              {dept.avgRating && (
                <div className="mt-3">
                  <div className="bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(dept.avgRating/5)*100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}