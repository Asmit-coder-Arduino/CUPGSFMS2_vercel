import { useState } from "react";
import { useListCourses, useListFaculty, useSubmitFeedback, useListDepartments, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
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
  const { data: departments } = useListDepartments();
  const { data: courses } = useListCourses();
  const { data: faculty } = useListFaculty();
  const submitFeedback = useSubmitFeedback();
  const queryClient = useQueryClient();
  const { role, student } = useRole();

  const [selectedDeptId, setSelectedDeptId] = useState(
    student?.departmentId ? String(student.departmentId) : ""
  );
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

  const filteredCourses = selectedDeptId
    ? courses?.filter(c => String((c as any).departmentId ?? "") === selectedDeptId)
    : courses;

  const selectedCourse = courses?.find(c => c.id === parseInt(courseId));
  const relevantFaculty = selectedCourse?.facultyId
    ? faculty?.filter(f => f.id === selectedCourse.facultyId)
    : (selectedDeptId ? faculty?.filter(f => String((f as any).departmentId ?? "") === selectedDeptId) : faculty);

  const handleDeptChange = (val: string) => {
    setSelectedDeptId(val);
    setCourseId("");
    setFacultyId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) { setError("Please select your branch/department first."); return; }
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

  if (role !== "student" || !student) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-card border rounded-xl p-10 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Student Login Required</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Feedback can only be submitted by registered CUPGS students. Please login with your Roll Number to continue.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-left space-y-1">
            <p className="font-semibold">How to login as Student:</p>
            <p>1. Go to <strong>Home</strong> page</p>
            <p>2. Click <strong>"Student Login"</strong></p>
            <p>3. Enter your Roll Number (e.g., <code className="bg-amber-100 px-1 rounded">22CS0001</code>) and select your department</p>
            <p>4. Come back here to submit feedback</p>
          </div>
          <a
            href="/"
            className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Home — Login as Student
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    const deptName = departments?.find(d => String(d.id) === selectedDeptId)?.name;
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-card border rounded-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Feedback Submitted Successfully</h2>
          <p className="text-muted-foreground">Thank you! Your feedback has been recorded and will help improve academic quality at CUPGS.</p>
          {deptName && <p className="text-sm text-muted-foreground">Department: <strong>{deptName}</strong></p>}
          <div className="bg-muted rounded-md px-4 py-3 inline-block">
            <p className="text-xs text-muted-foreground mb-1">Reference ID (save this)</p>
            <p className="font-mono font-bold text-primary">{submitted}</p>
          </div>
          <div>
            <button
              onClick={() => {
                setSubmitted(null); setCourseId(""); setFacultyId(""); setComments("");
                setRatings({ courseContent: 0, teachingQuality: 0, labFacilities: 0, studyMaterial: 0, overall: 0 });
              }}
              className="text-sm text-primary underline underline-offset-2"
            >
              Submit feedback for another course
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
        <p className="text-muted-foreground text-sm mt-1">Your feedback helps improve academic quality at CUPGS</p>
        {role === "student" && student && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">Roll No: {student.rollNumber}</Badge>
            <span className="text-xs text-muted-foreground">Your identity remains anonymous to faculty.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">{error}</div>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-2">
          <h2 className="font-semibold text-sm text-blue-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Step 1 — Select Your Branch / Department
          </h2>
          <p className="text-xs text-blue-600 mb-2">This filters courses to show only your department's courses.</p>
          <select
            className="w-full border border-blue-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
            value={selectedDeptId}
            onChange={e => handleDeptChange(e.target.value)}
          >
            <option value="">— Select your branch —</option>
            {departments?.map(d => (
              <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
            ))}
          </select>
        </div>

        <div className={`bg-card border rounded-lg p-5 space-y-4 transition-opacity ${!selectedDeptId ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 2 — Course & Details</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Course <span className="text-destructive">*</span></label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setFacultyId(""); }}
              disabled={!selectedDeptId}
            >
              <option value="">Select a course...</option>
              {filteredCourses?.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name} (Sem {c.semester})</option>
              ))}
            </select>
            {selectedDeptId && filteredCourses?.length === 0 && (
              <p className="text-xs text-muted-foreground">No courses found for this department.</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Faculty</label>
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
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{["st", "nd", "rd", "th"][y - 1]} Year</option>)}
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

        <div className={`bg-card border rounded-lg p-5 space-y-4 transition-opacity ${!courseId ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 3 — Ratings <span className="text-destructive">*</span></h2>
          <StarInput label="Course Content" value={ratings.courseContent} onChange={v => setRatings(r => ({ ...r, courseContent: v }))} />
          <StarInput label="Teaching Quality" value={ratings.teachingQuality} onChange={v => setRatings(r => ({ ...r, teachingQuality: v }))} />
          <StarInput label="Lab Facilities" value={ratings.labFacilities} onChange={v => setRatings(r => ({ ...r, labFacilities: v }))} />
          <StarInput label="Study Material" value={ratings.studyMaterial} onChange={v => setRatings(r => ({ ...r, studyMaterial: v }))} />
          <div className="border-t pt-4">
            <StarInput label="Overall Satisfaction" value={ratings.overall} onChange={v => setRatings(r => ({ ...r, overall: v }))} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 4 — Comments & Privacy</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Comments / Suggestions (optional)</label>
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
          disabled={submitFeedback.isPending || !selectedDeptId || !courseId}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
