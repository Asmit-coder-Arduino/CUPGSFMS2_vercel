import { useState } from "react";
import { useGetTrends, useListDepartments, useGetDashboardSummary } from "@workspace/api-client-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function Analytics() {
  const [deptFilter, setDeptFilter] = useState("");
  const [metric, setMetric] = useState<"overall" | "course_content" | "teaching_quality" | "lab_facilities" | "study_material">("overall");

  const { data: departments } = useListDepartments();
  const { data: trends, isLoading: trendsLoading } = useGetTrends({
    departmentId: deptFilter ? parseInt(deptFilter) : undefined,
    metric,
  });
  const { data: summary } = useGetDashboardSummary();

  const radarData = summary ? [
    { subject: "Course Content", value: summary.ratingBreakdown.courseContent, fullMark: 5 },
    { subject: "Teaching Quality", value: summary.ratingBreakdown.teachingQuality, fullMark: 5 },
    { subject: "Lab Facilities", value: summary.ratingBreakdown.labFacilities, fullMark: 5 },
    { subject: "Study Material", value: summary.ratingBreakdown.studyMaterial, fullMark: 5 },
    { subject: "Overall", value: summary.ratingBreakdown.overall, fullMark: 5 },
  ] : [];

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Semester-wise trends and institutional performance metrics</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Feedback", value: summary.totalFeedback.toLocaleString() },
            { label: "Overall Rating", value: summary.avgOverallRating.toFixed(2) },
            { label: "Active Windows", value: summary.activeWindows },
            { label: "Top Department", value: summary.topDepartment || "N/A" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary truncate">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="font-semibold">Rating Trends</h2>
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="">All Depts</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
              </select>
              <select
                className="border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                value={metric}
                onChange={e => setMetric(e.target.value as typeof metric)}
              >
                <option value="overall">Overall</option>
                <option value="course_content">Course Content</option>
                <option value="teaching_quality">Teaching Quality</option>
                <option value="lab_facilities">Lab Facilities</option>
                <option value="study_material">Study Material</option>
              </select>
            </div>
          </div>
          {trendsLoading ? (
            <div className="h-48 bg-muted/50 rounded animate-pulse" />
          ) : (trends?.length ?? 0) === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No trend data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgRating" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Institution Rating Profile</h2>
          {radarData.length === 0 ? (
            <div className="h-48 bg-muted/50 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                <Radar name="Rating" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Department comparison */}
      <div className="bg-card border rounded-lg p-5">
        <h2 className="font-semibold mb-4">Department Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b">
                <th className="text-left py-2 font-medium">Department</th>
                <th className="text-right py-2 font-medium">Faculty</th>
                <th className="text-right py-2 font-medium">Courses</th>
                <th className="text-right py-2 font-medium">Avg Rating</th>
                <th className="py-2 pl-4 w-32 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {departments?.map(dept => (
                <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-medium">
                    <span className="text-xs text-primary font-bold mr-2">{dept.code}</span>
                    {dept.name}
                  </td>
                  <td className="text-right py-2.5 text-muted-foreground">{dept.totalFaculty}</td>
                  <td className="text-right py-2.5 text-muted-foreground">{dept.totalCourses}</td>
                  <td className="text-right py-2.5 font-semibold text-primary">
                    {dept.avgRating ? dept.avgRating.toFixed(2) : "—"}
                  </td>
                  <td className="py-2.5 pl-4">
                    {dept.avgRating ? (
                      <div className="bg-muted rounded-full h-1.5 w-full">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(dept.avgRating/5)*100}%` }} />
                      </div>
                    ) : <div className="bg-muted rounded-full h-1.5 w-full" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}