import { useState, useEffect, useRef, useCallback } from "react";
import { useListCourses, useListFaculty, useListDepartments, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api";
import type { FieldConfig, FormTemplate } from "@/components/FormBuilder";
import { CheckSquare, List, AlignLeft, Info } from "lucide-react";

// ─── Half-Star SVG ────────────────────────────────────────────────────────────
// Uses clipPath to reliably render empty / half / full stars without gradient ID conflicts.

function HalfStarSvg({ fill, size = 40, idx = 0 }: { fill: "empty" | "half" | "full"; size?: number; idx?: number }) {
  const clipId = `hs-clip-${idx}`;
  // Standard 5-point star path centred on 10,10 in a 20×20 viewBox
  const STAR = "M10 1.5 L12.245 7.386 L18.511 7.386 L13.633 11.114 L15.878 17 L10 13.272 L4.122 17 L6.367 11.114 L1.489 7.386 L7.755 7.386 Z";
  const AMBER = "#f59e0b";
  const EMPTY_STROKE = "rgba(245,158,11,0.28)";

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      <defs>
        {fill === "half" && (
          <clipPath id={clipId}>
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        )}
      </defs>

      {/* Outline / base (always shown) */}
      <path d={STAR} fill="none" stroke={EMPTY_STROKE} strokeWidth="1" />

      {/* Full fill */}
      {fill === "full" && <path d={STAR} fill={AMBER} />}

      {/* Half fill — clipped to left 50% */}
      {fill === "half" && <path d={STAR} fill={AMBER} clipPath={`url(#${clipId})`} />}
    </svg>
  );
}

// ─── Half-Star Rating Input ───────────────────────────────────────────────────
// Supports 0.5-step values (0.5 → 5.0) via hover, click, and drag.

const LABELS: Record<number, string> = {
  0.5: "Terrible", 1: "Bad", 1.5: "Very Poor", 2: "Poor",
  2.5: "Below Avg", 3: "Average", 3.5: "Good", 4: "Very Good",
  4.5: "Excellent", 5: "Outstanding!",
};
const LABEL_COLORS: Record<number, string> = {
  0.5: "text-red-600", 1: "text-red-500", 1.5: "text-orange-600", 2: "text-orange-400",
  2.5: "text-yellow-600", 3: "text-yellow-500", 3.5: "text-lime-500", 4: "text-green-500",
  4.5: "text-emerald-500", 5: "text-emerald-600",
};

function StarInput({ label, description, value, onChange, required }: {
  label: string; description?: string; value: number; onChange: (v: number) => void; required?: boolean;
}) {
  const [hoverVal, setHoverVal] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const STAR_COUNT = 5;

  // Given an x offset inside the container, compute the half-star value (0.5 increments).
  const valueFromX = useCallback((clientX: number): number => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const starW = rect.width / STAR_COUNT;
    const starIndex = Math.floor(x / starW); // 0-based
    const withinStar = (x - starIndex * starW) / starW; // 0..1
    const clamped = Math.max(0, Math.min(STAR_COUNT - 1, starIndex));
    return Math.min(STAR_COUNT, (clamped + (withinStar < 0.5 ? 0.5 : 1)));
  }, []);

  // Mouse events
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const v = valueFromX(e.clientX);
    setHoverVal(v);
    if (dragging) onChange(v);
  }, [dragging, onChange, valueFromX]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    onChange(valueFromX(e.clientX));
  }, [onChange, valueFromX]);

  const onMouseUp = useCallback(() => setDragging(false), []);
  const onMouseLeave = useCallback(() => { setHoverVal(0); setDragging(false); }, []);
  const onClick = useCallback((e: React.MouseEvent) => { onChange(valueFromX(e.clientX)); }, [onChange, valueFromX]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setDragging(true);
    onChange(valueFromX(e.touches[0].clientX));
  }, [onChange, valueFromX]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const v = valueFromX(e.touches[0].clientX);
    setHoverVal(v);
    onChange(v);
  }, [onChange, valueFromX]);

  const onTouchEnd = useCallback(() => { setDragging(false); setHoverVal(0); }, []);

  const displayVal = hoverVal || value;

  // Determine fill for each star position 1..5
  const starFills = Array.from({ length: STAR_COUNT }, (_, i) => {
    const pos = i + 1; // 1..5
    if (displayVal >= pos) return "full" as const;
    if (displayVal >= pos - 0.5) return "half" as const;
    return "empty" as const;
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="flex items-center gap-3 mt-1 select-none">
        {/* Star container — single drag surface */}
        <div
          ref={containerRef}
          className={`flex gap-1 cursor-pointer touch-none ${dragging ? "scale-105" : ""} transition-transform`}
          style={{ width: STAR_COUNT * 44 }}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="slider"
          aria-label={label}
          aria-valuemin={0.5}
          aria-valuemax={5}
          aria-valuenow={value}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") onChange(Math.min(5, (value || 0) + 0.5));
            if (e.key === "ArrowLeft") onChange(Math.max(0.5, (value || 0.5) - 0.5));
          }}
        >
          {starFills.map((fill, i) => (
            <HalfStarSvg key={i} fill={fill} size={40} idx={i} />
          ))}
        </div>

        {/* Score + label */}
        <div className="min-w-[72px]">
          {displayVal > 0 ? (
            <div className="flex flex-col leading-tight">
              <span className={`text-xl font-black tabular-nums leading-none ${LABEL_COLORS[displayVal] ?? "text-amber-500"}`}>
                {displayVal % 1 === 0 ? displayVal.toFixed(1) : displayVal}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${LABEL_COLORS[displayVal] ?? "text-amber-500"}`}>
                {LABELS[displayVal]}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Tap or drag</span>
          )}
        </div>
      </div>

      {/* Thin progress bar */}
      <div className="h-1 rounded-full bg-muted/50 overflow-hidden w-48 ml-0.5">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${(displayVal / 5) * 100}%`,
            background: displayVal >= 4 ? "#10b981" : displayVal >= 3 ? "#f59e0b" : displayVal >= 2 ? "#f97316" : "#ef4444",
          }}
        />
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
  const { role, student, logout } = useRole();

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
  const [submitted, setSubmitted] = useState<{
    referenceId: string;
    serialNumber: string;
    ipAddress: string;
    createdAt: string;
    courseName: string;
    courseCode: string;
    facultyName: string;
    departmentName: string;
    ratingCourseContent: number;
    ratingTeachingQuality: number;
    ratingLabFacilities: number;
    ratingStudyMaterial: number;
    ratingOverall: number;
    comments?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic form template
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Standard ratings (mapped to fixed DB columns)
  const [ratings, setRatings] = useState<RatingsState>(INITIAL_RATINGS);
  // Custom question answers (stored in custom_answers JSONB)
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const autoDownloadTriggered = useRef(false);

  const triggerReceiptDownload = useCallback(async (d: NonNullable<typeof submitted>) => {
    const receiptUrl = `${getApiUrl()}/api/feedback/receipt/${encodeURIComponent(d.referenceId)}`;
    try {
      const resp = await fetch(receiptUrl);
      const htmlText = await resp.text();
      const blob = new Blob([htmlText], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `CUPGS-Receipt-${d.referenceId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      window.open(receiptUrl, "_blank");
    }
  }, []);

  useEffect(() => {
    if (submitted && !autoDownloadTriggered.current) {
      autoDownloadTriggered.current = true;
      const timer = setTimeout(() => {
        triggerReceiptDownload(submitted);
      }, 800);
      return () => clearTimeout(timer);
    }
    if (!submitted) {
      autoDownloadTriggered.current = false;
    }
  }, [submitted, triggerReceiptDownload]);

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

  // ── Faculty integrity logic ──────────────────────────────────────────────
  // If the course has a pre-assigned faculty → lock to that faculty (auto-select, no dropdown).
  // If the course has no assigned faculty → let student pick from dept faculty list.
  const courseHasAssignedFaculty = !!selectedCourse?.facultyId;
  const assignedFaculty = courseHasAssignedFaculty
    ? faculty?.find(f => f.id === selectedCourse!.facultyId)
    : null;
  const deptFacultyList = selectedDeptId
    ? faculty?.filter(f => String((f as any).departmentId ?? "") === selectedDeptId)
    : faculty ?? [];

  const handleDeptChange = (val: string) => {
    setSelectedDeptId(val);
    setCourseId(""); setFacultyId("");
    setRatings(INITIAL_RATINGS); setCustomAnswers({});
  };

  // When course changes → auto-assign faculty if the course has one
  const handleCourseChange = (val: string) => {
    setCourseId(val);
    const course = courses?.find(c => c.id === parseInt(val));
    // Auto-lock to the course's assigned faculty; clear if none
    setFacultyId(course?.facultyId ? String(course.facultyId) : "");
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

      setSubmitted({
        referenceId: data.referenceId,
        serialNumber: data.serialNumber,
        ipAddress: data.ipAddress,
        createdAt: data.createdAt,
        courseName: data.courseName,
        courseCode: data.courseCode,
        facultyName: data.facultyName,
        departmentName: data.departmentName,
        ratingCourseContent: data.ratingCourseContent,
        ratingTeachingQuality: data.ratingTeachingQuality,
        ratingLabFacilities: data.ratingLabFacilities,
        ratingStudyMaterial: data.ratingStudyMaterial,
        ratingOverall: data.ratingOverall,
        comments: data.comments,
      });
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
    const date = new Date(submitted.createdAt);
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-card border rounded-xl p-8 space-y-5">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-700">Thank You! Feedback Submitted</h2>
            <p className="text-muted-foreground text-sm">Your feedback has been recorded and will help improve academic quality at CUPGS, BPUT.</p>
            <p className="text-xs text-green-600 font-medium animate-pulse">Your receipt is being downloaded automatically...</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">REFERENCE NUMBER</p>
            <p className="font-mono font-black text-xl text-indigo-600 tracking-wider">{submitted.referenceId}</p>
            <p className="text-xs text-muted-foreground mt-2">Save this to track your feedback status</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Serial No.</p>
              <p className="font-semibold font-mono">{submitted.serialNumber}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="font-semibold">{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Course</p>
              <p className="font-semibold">[{submitted.courseCode}] {submitted.courseName}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Faculty</p>
              <p className="font-semibold">{submitted.facultyName || "—"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Overall Rating</p>
              <p className="font-semibold text-amber-600">{"★".repeat(Math.round(submitted.ratingOverall))}{"☆".repeat(5 - Math.round(submitted.ratingOverall))} {submitted.ratingOverall}/5</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Submission</p>
              <p className="font-semibold text-xs text-green-600">Verified ✓</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => triggerReceiptDownload(submitted)}
              className="flex-1 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download Receipt Again
            </button>
            <button
              onClick={() => {
                logout();
                setSubmitted(null); setCourseId(""); setFacultyId(""); setComments("");
                setRatings(INITIAL_RATINGS); setCustomAnswers({});
              }}
              className="flex-1 border border-primary text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Submit Another Feedback
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
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-amber-500 mt-0.5 flex-shrink-0">&#9733;</span>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Your feedback plays a vital role in improving our college. Please complete the form with honesty and responsibility.
          </p>
        </div>
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
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 mt-1">
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
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={!selectedDeptId}
            >
              <option value="">Select a course...</option>
              {filteredCourses?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} (Sem {c.semester}){(c as any).facultyId ? "" : " · Faculty TBA"}
                </option>
              ))}
            </select>
            {selectedDeptId && filteredCourses?.length === 0 && (
              <p className="text-xs text-muted-foreground">No courses found for this department.</p>
            )}
          </div>

          {/* Faculty — auto-locked when course has assigned faculty, dropdown otherwise */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Faculty</label>
              {courseHasAssignedFaculty && (
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Auto-assigned
                </span>
              )}
            </div>

            {courseHasAssignedFaculty && assignedFaculty ? (
              /* Locked read-only faculty card */
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {assignedFaculty.name.split(" ").filter((w: string) => w.match(/^[A-Z]/)).slice(0, 2).map((w: string) => w[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 truncate">{assignedFaculty.name}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{(assignedFaculty as any).designation} · {(assignedFaculty as any).employeeId}</p>
                </div>
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              /* Optional faculty dropdown from dept list */
              <div className="space-y-1">
                <select
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  disabled={!courseId}
                >
                  <option value="">— Not specified (optional) —</option>
                  {deptFacultyList?.map(f => (
                    <option key={f.id} value={f.id}>{f.name} · {(f as any).designation}</option>
                  ))}
                </select>
                {courseId && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    No faculty assigned to this course yet. You may optionally select one.
                  </p>
                )}
              </div>
            )}
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
