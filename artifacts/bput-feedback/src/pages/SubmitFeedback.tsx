import { useState } from "react";
import { useListCourses, useListFaculty, useSubmitFeedback, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg className={`w-7 h-7 ${i <= (hover || value) ? "text-amber-400" : "text-muted-foreground/30"} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SubmitFeedback() {
  const { data: courses, isLoading: coursesLoading } = useListCourses();
  const { data: faculty } = useListFaculty();
  const submitFeedback = useSubmitFeedback();
  const queryClient = useQueryClient();
  const { role, student } = useRole();

  const [courseId, setCourseId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [feedbackType, setFeedbackType] = useState("semester_end");
  const [studentYear, setStudentYear] = useState("");
  const [section, setSection] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [comments, setComments] = useState("");
  const [ratings, setRatings] = useState({ courseContent: 0, teachingQuality: 0, labFacilities: 0, studyMaterial: 0, overall: 0 });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectedCourse = courses?.find(c => c.id === parseInt(courseId));
  const relevantFaculty = selectedCourse?.facultyId
    ? faculty?.filter(f => f.id === selectedCourse.facultyId)
    : faculty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { setError("Please select a course."); return; }
    if (Object.values(ratings).some(v => v === 0)) { setError("Please rate all parameters."); return; }
    setError("");

    submitFeedback.mutate({
      data: {
        courseId: parseInt(courseId),
        facultyId: facultyId ? parseInt(facultyId) : undefined,
        feedbackType: feedbackType as "semester_end" | "mid_semester" | "event_based" | "placement",
        studentYear: studentYear ? parseInt(studentYear) : undefined,
        section: section || undefined,
        isAnonymous,
        comments: comments || undefined,
        ratingCourseContent: ratings.courseContent,
        ratingTeachingQuality: ratings.teachingQuality,
        ratingLabFacilities: ratings.labFacilities,
        ratingStudyMaterial: ratings.studyMaterial,
        ratingOverall: ratings.overall,
      }
    }, {
      onSuccess: (data) => {
        setSubmitted(data.referenceId);
        queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey() });
      },
      onError: () => setError("Failed to submit feedback. Please try again.")
    });
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-card border rounded-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Feedback Submitted</h2>
          <p className="text-muted-foreground">Thank you for your feedback. It will help improve academic quality.</p>
          <div className="bg-muted rounded-md px-4 py-3 inline-block">
            <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
            <p className="font-mono font-bold text-primary">{submitted}</p>
          </div>
          <div>
            <button
              onClick={() => { setSubmitted(null); setCourseId(""); setFacultyId(""); setComments(""); setRatings({ courseContent: 0, teachingQuality: 0, labFacilities: 0, studyMaterial: 0, overall: 0 }); }}
              className="text-sm text-primary underline underline-offset-2"
            >
              Submit another feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Submit Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">Your feedback helps improve academic quality at BPUT</p>
        {role === "student" && student && (
          <div className="mt-2 inline-flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Roll No: {student.rollNumber}</Badge>
            <span className="text-xs text-muted-foreground">Your identity remains anonymous to faculty.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">{error}</div>}

        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Course Information</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Course <span className="text-destructive">*</span></label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setFacultyId(""); }}
            >
              <option value="">Select a course...</option>
              {courses?.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name} (Sem {c.semester})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Faculty (optional)</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            >
              <option value="">Not specified</option>
              {relevantFaculty?.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Feedback Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={feedbackType} onChange={e => setFeedbackType(e.target.value)}>
                <option value="semester_end">Semester End</option>
                <option value="mid_semester">Mid-Semester</option>
                <option value="event_based">Event Based</option>
                <option value="placement">Placement</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Your Year</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={studentYear} onChange={e => setStudentYear(e.target.value)}>
                <option value="">Not specified</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>{y}{["st","nd","rd","th"][y-1]} Year</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Section</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. A, B, C"
              value={section}
              onChange={e => setSection(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Ratings <span className="text-destructive">*</span></h2>
          <StarInput label="Course Content" value={ratings.courseContent} onChange={v => setRatings(r => ({...r, courseContent: v}))} />
          <StarInput label="Teaching Quality" value={ratings.teachingQuality} onChange={v => setRatings(r => ({...r, teachingQuality: v}))} />
          <StarInput label="Lab Facilities" value={ratings.labFacilities} onChange={v => setRatings(r => ({...r, labFacilities: v}))} />
          <StarInput label="Study Material" value={ratings.studyMaterial} onChange={v => setRatings(r => ({...r, studyMaterial: v}))} />
          <div className="border-t pt-4">
            <StarInput label="Overall Satisfaction" value={ratings.overall} onChange={v => setRatings(r => ({...r, overall: v}))} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Comments & Privacy</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Comments / Suggestions</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              placeholder="Share any specific feedback, suggestions, or concerns..."
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 rounded text-primary" />
            <div>
              <p className="text-sm font-medium">Submit anonymously</p>
              <p className="text-xs text-muted-foreground">Your identity will not be revealed to faculty or administration</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitFeedback.isPending}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}