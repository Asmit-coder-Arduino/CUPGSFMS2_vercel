import { useState } from "react";
import { useListCourses, useListDepartments } from "@workspace/api-client-react";

export default function Courses() {
  const { data: departments } = useListDepartments();
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");

  const { data: courses, isLoading } = useListCourses({
    departmentId: deptFilter ? parseInt(deptFilter) : undefined,
    semester: semFilter ? parseInt(semFilter) : undefined,
  });

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">{courses?.length ?? 0} courses found</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments?.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
        </select>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          value={semFilter}
          onChange={e => setSemFilter(e.target.value)}
        >
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses?.map(c => (
            <div key={c.id} className="bg-card border rounded-lg px-5 py-4 hover:shadow-sm hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{c.code}</span>
                    <span className="text-xs text-muted-foreground">Sem {c.semester} · {c.credits} credits</span>
                  </div>
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.departmentName} · {c.facultyName ?? "No faculty assigned"}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  {c.avgRating ? (
                    <>
                      <span className="font-bold text-primary">{c.avgRating.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">{c.feedbackCount} reviews</p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No reviews</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(courses?.length ?? 0) === 0 && <div className="col-span-2 text-center py-12 text-muted-foreground">No courses found.</div>}
        </div>
      )}
    </div>
  );
}