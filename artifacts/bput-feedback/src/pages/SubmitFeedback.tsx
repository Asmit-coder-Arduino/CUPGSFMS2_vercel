import { useState, useEffect } from "react";
import { useListCourses, useListFaculty, useListDepartments, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api";
import type { FieldConfig, FormTemplate } from "@/components/FormBuilder";
import { Star, CheckSquare, List, AlignLeft, Info } from "lucide-react";

// ─── Star Input ───────────────────────────────────────────────────────────────

function StarInput({ label, description, value, onChange, required }: {
  label: string; description?: string; value: number; onChange: (v: number) => void; required?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex items-center gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i} type="button"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg className={`w-8 h-8 ${i <= (hover || value) ? "text-amber-400" : "text-muted-foreground/25"} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {value > 0 && (
          <span className="text-sm font-bold ml-1 text-amber-600">
            {["", "Poor", "Below Avg", "Average", "Good", "Excellent"][value]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Yes/No Input ─────────────────────────────────────────────────────────────

function YesNoInput({ label, description, value, onChange, required }: {
  label: string; description?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex gap-3 mt-1">
        {["Yes", "No"].map(opt => (
          <button
            key={opt} type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 border rounded-xl py-2.5 text-sm font-semibold transition-all ${
              value === opt
                ? opt === "Yes"
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-red-500 text-white border-red-500 shadow-sm"
                : "hover:bg-muted border-border"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MCQ Input ────────────────────────────────────────────────────────────────

function McqInput({ label, description, options, value, onChange, required }: {
  label: string; description?: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="space-y-2 mt-1">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
              value === opt ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              value === opt ? "border-primary bg-primary" : "border-muted-foreground/40"
            }`}>
              {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <input type="radio" name={label} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="sr-only" />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Text Short Input ─────────────────────────────────────────────────────────

function TextShortInput({ label, description, value, onChange, required }: {
  label: string; description?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <input
        type="text"
        className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-shadow mt-1"
        placeholder="Type your answer..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Standard Key → Ratings State Map ────────────────────────────────────────

type StandardKey = "courseContent" | "teachingQuality" | "labFacilities" | "studyMaterial" | "overall";
type RatingsState = Record<StandardKey, number>;

const INITIAL_RATINGS: RatingsState = {
  courseContent: 0, teachingQuality: 0, labFacilities: 0, studyMaterial: 0, overall: 0,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubmitFeedback() {
  const { data: departments } = useListDepartments();
  const { data: courses } = useListCourses();
  const { data: faculty } = useListFaculty();
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
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic form template
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Standard ratings (mapped to fixed DB columns)
  const [ratings, setRatings] = useState<RatingsState>(INITIAL_RATINGS);
  // Custom question answers (stored in custom_answers JSONB)
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Load template when dept changes
  useEffect(() => {
    if (!selectedDeptId) { setFormTemplate(null); return; }
    setTemplateLoading(true);
    fetch(`${getApiUrl()}/api/departments/${selectedDeptId}/form-template`)
      .then(r => r.json())
      .then(data => { setFormTemplate(data); setRatings(INITIAL_RATINGS); setCustomAnswers({}); })
      .catch(() => setFormTemplate(null))
      .finally(() => setTemplateLoading(false));
  }, [selectedDeptId]);

  const filteredCourses = selectedDeptId
    ? courses?.filter(c => String((c as any).departmentId ?? "") === selectedDeptId)
    : courses;

  const selectedCourse = courses?.find(c => c.id === parseInt(courseId));
  const relevantFaculty = selectedCourse?.facultyId
    ? faculty?.filter(f => f.id === selectedCourse.facultyId)
    : (selectedDeptId ? faculty?.filter(f => String((f as any).departmentId ?? "") === selectedDeptId) : faculty);

  const handleDeptChange = (val: string) => {
    setSelectedDeptId(val);
    setCourseId(""); setFacultyId("");
    setRatings(INITIAL_RATINGS); setCustomAnswers({});
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) { setError("Please select your branch/department first."); return; }
    if (!courseId) { setError("Please select a course."); return; }

    // Validate enabled fields
    if (formTemplate) {
      const enabledFields = formTemplate.fields.filter(f => f.enabled);
      for (const field of enabledFields) {
        if (!field.required) continue;

        if (field.isStandard && field.standardKey) {
          if (!ratings[field.standardKey] || ratings[field.standardKey] === 0) {
            setError(`Please rate "${field.label}".`);
            return;
          }
        } else {
          if (!customAnswers[field.id] || customAnswers[field.id].trim() === "") {
            setError(`"${field.label}" is required.`);
            return;
          }
        }
      }
      // Comment required?
      if (formTemplate.commentRequired && !comments.trim()) {
        setError(`"${formTemplate.commentLabel}" is required.`);
        return;
      }
    } else {
      // No template — validate all 5 standard ratings
      if (Object.values(ratings).some(v => v === 0)) {
        setError("Please rate all parameters.");
        return;
      }
    }

    setError(""); setSubmitting(true);

    try {
      // For disabled standard fields, use 3 (average) as default
      const enabledStdKeys = new Set(
        (formTemplate?.fields ?? [])
          .filter(f => f.isStandard && f.enabled && f.standardKey)
          .map(f => f.standardKey as StandardKey)
      );

      const ratingPayload = {
        ratingCourseContent:  (formTemplate && !enabledStdKeys.has("courseContent"))  ? 3 : (ratings.courseContent  || 3),
        ratingTeachingQuality:(formTemplate && !enabledStdKeys.has("teachingQuality")) ? 3 : (ratings.teachingQuality || 3),
        ratingLabFacilities:  (formTemplate && !enabledStdKeys.has("labFacilities"))  ? 3 : (ratings.labFacilities  || 3),
        ratingStudyMaterial:  (formTemplate && !enabledStdKeys.has("studyMaterial"))  ? 3 : (ratings.studyMaterial  || 3),
        ratingOverall:        (formTemplate && !enabledStdKeys.has("overall"))        ? 3 : (ratings.overall        || 3),
      };

      const body = {
        courseId: parseInt(courseId),
        facultyId: facultyId ? parseInt(facultyId) : undefined,
        feedbackType,
        studentYear: studentYear ? parseInt(studentYear) : undefined,
        section: section || undefined,
        ...ratingPayload,
        comments: comments || undefined,
        customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
        isAnonymous,
      };

      const res = await fetch(`${getApiUrl()}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setSubmitted(data.referenceId);
      queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey() });
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to submit feedback. Please try again.");
    } finally { setSubmitting(false); }
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
            <p>3. Enter your Roll Number and select your department</p>
            <p>4. Come back here to submit feedback</p>
          </div>
          <a href="/" className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
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
                setRatings(INITIAL_RATINGS); setCustomAnswers({});
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

  const enabledFields = formTemplate?.fields.filter(f => f.enabled) ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{formTemplate?.title || "Submit Feedback"}</h1>
        <p className="text-muted-foreground text-sm mt-1">{formTemplate?.description || "Your feedback helps improve academic quality at CUPGS"}</p>
        {role === "student" && student && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">Roll No: {student.rollNumber}</Badge>
            <span className="text-xs text-muted-foreground">Your identity remains anonymous to faculty.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</div>}

        {/* Step 1 — Department */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-2">
          <h2 className="font-semibold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Step 1 — Select Your Branch / Department
          </h2>
          <p className="text-xs text-blue-600 dark:text-blue-400">This loads the department-specific feedback form.</p>
          <select
            className="w-full border border-blue-300 dark:border-blue-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
            value={selectedDeptId}
            onChange={e => handleDeptChange(e.target.value)}
          >
            <option value="">— Select your branch —</option>
            {departments?.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
          </select>
          {formTemplate && !formTemplate.isDefault && (
            <div className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300 mt-1">
              <Info className="w-3.5 h-3.5" /> This department has a customized feedback form.
            </div>
          )}
        </div>

        {/* Step 2 — Course & Details */}
        <div className={`bg-card border rounded-xl p-5 space-y-4 transition-opacity ${!selectedDeptId ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 2 — Course & Details</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Course <span className="text-destructive">*</span></label>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setFacultyId(""); }}
              disabled={!selectedDeptId}
            >
              <option value="">Select a course...</option>
              {filteredCourses?.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name} (Sem {c.semester})</option>)}
            </select>
            {selectedDeptId && filteredCourses?.length === 0 && (
              <p className="text-xs text-muted-foreground">No courses found for this department.</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Faculty</label>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            >
              <option value="">Not specified</option>
              {relevantFaculty?.map(f => <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Feedback Type</label>
              <select className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={feedbackType} onChange={e => setFeedbackType(e.target.value)}>
                <option value="semester_end">Semester End</option>
                <option value="mid_semester">Mid-Semester</option>
                <option value="event_based">Event Based</option>
                <option value="placement">Placement</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Your Year</label>
              <select className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={studentYear} onChange={e => setStudentYear(e.target.value)}>
                <option value="">Not specified</option>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{["st", "nd", "rd", "th"][y - 1]} Year</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Section</label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. A, B, C"
              value={section}
              onChange={e => setSection(e.target.value)}
            />
          </div>
        </div>

        {/* Step 3 — Dynamic Questions */}
        <div className={`bg-card border rounded-xl p-5 space-y-5 transition-opacity ${!courseId ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 3 — Feedback Questions <span className="text-destructive">*</span></h2>

          {templateLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />)}</div>
          ) : enabledFields.length === 0 ? (
            /* Fallback to standard 5 fields if no template or no enabled fields */
            <>
              <StarInput label="Course Content" value={ratings.courseContent} onChange={v => setRatings(r => ({ ...r, courseContent: v }))} required />
              <StarInput label="Teaching Quality" value={ratings.teachingQuality} onChange={v => setRatings(r => ({ ...r, teachingQuality: v }))} required />
              <StarInput label="Lab Facilities" value={ratings.labFacilities} onChange={v => setRatings(r => ({ ...r, labFacilities: v }))} required />
              <StarInput label="Study Material" value={ratings.studyMaterial} onChange={v => setRatings(r => ({ ...r, studyMaterial: v }))} required />
              <div className="border-t pt-4">
                <StarInput label="Overall Satisfaction" value={ratings.overall} onChange={v => setRatings(r => ({ ...r, overall: v }))} required />
              </div>
            </>
          ) : (
            enabledFields.map((field, i) => {
              const isLast = i === enabledFields.length - 1;
              return (
                <div key={field.id} className={isLast ? "border-t pt-4" : ""}>
                  {field.type === "star_5" && field.isStandard && field.standardKey ? (
                    <StarInput
                      label={field.label}
                      description={field.description}
                      value={ratings[field.standardKey]}
                      onChange={v => setRatings(r => ({ ...r, [field.standardKey!]: v }))}
                      required={field.required}
                    />
                  ) : field.type === "star_5" ? (
                    <StarInput
                      label={field.label}
                      description={field.description}
                      value={parseInt(customAnswers[field.id] ?? "0")}
                      onChange={v => setCustomAnswers(a => ({ ...a, [field.id]: String(v) }))}
                      required={field.required}
                    />
                  ) : field.type === "yes_no" ? (
                    <YesNoInput
                      label={field.label}
                      description={field.description}
                      value={customAnswers[field.id] ?? ""}
                      onChange={v => setCustomAnswers(a => ({ ...a, [field.id]: v }))}
                      required={field.required}
                    />
                  ) : field.type === "mcq" && field.options ? (
                    <McqInput
                      label={field.label}
                      description={field.description}
                      options={field.options}
                      value={customAnswers[field.id] ?? ""}
                      onChange={v => setCustomAnswers(a => ({ ...a, [field.id]: v }))}
                      required={field.required}
                    />
                  ) : field.type === "text_short" ? (
                    <TextShortInput
                      label={field.label}
                      description={field.description}
                      value={customAnswers[field.id] ?? ""}
                      onChange={v => setCustomAnswers(a => ({ ...a, [field.id]: v }))}
                      required={field.required}
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Step 4 — Comments & Privacy */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 4 — Comments & Privacy</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {formTemplate?.commentLabel || "Comments / Suggestions"}
                {formTemplate?.commentRequired
                  ? <span className="text-red-500 ml-1">*</span>
                  : <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
              </label>
              <span className={`text-xs ${comments.length > 900 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                {comments.length}/1000
              </span>
            </div>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4} maxLength={1000}
              placeholder="Share any specific feedback, suggestions, or concerns... (Please use respectful language)"
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Feedback containing abusive or offensive language will be automatically rejected.</p>
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
          disabled={submitting || !selectedDeptId || !courseId}
          className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
