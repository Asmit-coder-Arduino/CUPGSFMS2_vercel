import { useState } from "react";
import { useListFaculty, useListDepartments } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function FacultyList() {
  const { data: faculty, isLoading } = useListFaculty();
  const { data: departments } = useListDepartments();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const filtered = faculty?.filter(f =>
    (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.designation.toLowerCase().includes(search.toLowerCase())) &&
    (!deptFilter || f.departmentId === parseInt(deptFilter))
  ) ?? [];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Faculty</h1>
        <p className="text-muted-foreground text-sm mt-1">{faculty?.length ?? 0} faculty members across all departments</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="search"
          placeholder="Search faculty..."
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments?.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <Link key={f.id} href={`/faculty/${f.id}`}>
              <div className="bg-card border rounded-lg px-5 py-4 flex items-center gap-4 hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{f.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:text-primary transition-colors">{f.name}</p>
                  <p className="text-sm text-muted-foreground">{f.designation} · {f.departmentName}</p>
                </div>
                <div className="text-right shrink-0">
                  {f.avgRating ? (
                    <>
                      <span className="font-bold text-primary">{f.avgRating.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">{f.totalFeedbackCount} reviews</p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No reviews</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No faculty found.</div>}
        </div>
      )}
    </div>
  );
}