import { useState } from "react";
import { useListFeedback, useListDepartments } from "@workspace/api-client-react";

const feedbackTypeLabels: Record<string, string> = {
  semester_end: "Semester End",
  mid_semester: "Mid-Semester",
  event_based: "Event Based",
  placement: "Placement",
};

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= value ? "text-amber-400" : "text-muted-foreground/20"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function FeedbackList() {
  const { data: departments } = useListDepartments();
  const [deptFilter, setDeptFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");

  const { data: feedback, isLoading } = useListFeedback({
    departmentId: deptFilter ? parseInt(deptFilter) : undefined,
    feedbackType: typeFilter as "semester_end" | "mid_semester" | "event_based" | "placement" | undefined || undefined,
    semester: semFilter ? parseInt(semFilter) : undefined,
  });

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedback Records</h1>
        <p className="text-muted-foreground text-sm mt-1">{feedback?.length ?? 0} records</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments?.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="semester_end">Semester End</option>
          <option value="mid_semester">Mid-Semester</option>
          <option value="event_based">Event Based</option>
          <option value="placement">Placement</option>
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={semFilter} onChange={e => setSemFilter(e.target.value)}>
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="space-y-3">
          {feedback?.map(fb => (
            <div key={fb.id} className="bg-card border rounded-lg px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{fb.courseName ?? fb.courseCode}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{feedbackTypeLabels[fb.feedbackType] ?? fb.feedbackType}</span>
                    {fb.isAnonymous && <span className="text-xs text-muted-foreground">Anonymous</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{fb.departmentName} · Sem {fb.semester} · {fb.academicYear}</p>
                  {fb.facultyName && <p className="text-xs text-muted-foreground">Faculty: {fb.facultyName}</p>}
                  {fb.comments && <p className="text-sm text-muted-foreground mt-2 italic line-clamp-2">"{fb.comments}"</p>}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <StarRow value={fb.ratingOverall} />
                  <p className="text-xs text-muted-foreground font-mono">{fb.referenceId}</p>
                  <p className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {[
                  ["Content", fb.ratingCourseContent],
                  ["Teaching", fb.ratingTeachingQuality],
                  ["Lab", fb.ratingLabFacilities],
                  ["Material", fb.ratingStudyMaterial],
                ].map(([label, val]) => (
                  <div key={String(label)} className="text-center bg-muted/50 rounded py-1">
                    <div className="font-semibold text-primary">{val}</div>
                    <div className="text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(feedback?.length ?? 0) === 0 && <div className="text-center py-12 text-muted-foreground">No feedback records found.</div>}
        </div>
      )}
    </div>
  );
}