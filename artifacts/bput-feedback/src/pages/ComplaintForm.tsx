import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";
import { AlertTriangle, CheckCircle, Send, Search, Copy, FileText } from "lucide-react";

const CATEGORIES = [
  "Academic",
  "Infrastructure",
  "Faculty",
  "Examination",
  "Hostel",
  "Library",
  "Lab & Equipment",
  "Administration",
  "Other",
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", desc: "General suggestion or minor issue" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", desc: "Needs attention within a week" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", desc: "Urgent, needs attention within 2-3 days" },
  { value: "urgent", label: "Urgent", color: "bg-red-500/20 text-red-400 border-red-500/30", desc: "Critical issue requiring immediate action" },
];

interface Department {
  id: number;
  code: string;
  name: string;
}

function useListDepartments() {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const r = await fetch(`${getApiUrl()}/api/departments`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export default function ComplaintForm() {
  const { role, student, logout } = useRole();
  const { data: departments } = useListDepartments();

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState(student?.rollNumber || "");
  const [departmentId, setDepartmentId] = useState(student?.departmentId ? String(student.departmentId) : "");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<{ referenceId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    if (student?.rollNumber) setRollNumber(student.rollNumber);
    if (student?.departmentId) setDepartmentId(String(student.departmentId));
  }, [student]);

  const submitMutation = useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch(`${getApiUrl()}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Failed to submit complaint");
      }
      return r.json();
    },
    onSuccess: (data) => {
      setSubmitted({ referenceId: data.referenceId });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim() && !isAnonymous) { setError("Please enter your name"); return; }
    if (!rollNumber.trim() && !isAnonymous) { setError("Please enter your roll number"); return; }
    if (!departmentId) { setError("Please select a department"); return; }
    if (!category) { setError("Please select a category"); return; }
    if (!subject.trim()) { setError("Please enter a subject"); return; }
    if (subject.trim().length < 5) { setError("Subject must be at least 5 characters"); return; }
    if (!description.trim()) { setError("Please describe your complaint"); return; }
    if (description.trim().length < 10) { setError("Description must be at least 10 characters"); return; }

    submitMutation.mutate({
      studentName: isAnonymous ? "Anonymous" : studentName.trim(),
      rollNumber: isAnonymous ? "Anonymous" : rollNumber.trim(),
      departmentId: parseInt(departmentId),
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
      isAnonymous,
    });
  };

  const handleTrack = async () => {
    if (!trackId.trim()) { setTrackError("Enter a complaint reference ID"); return; }
    setTrackError(""); setTrackResult(null); setTrackLoading(true);
    try {
      const r = await fetch(`${getApiUrl()}/api/complaints/track/${encodeURIComponent(trackId.trim())}`);
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Complaint not found");
      }
      setTrackResult(await r.json());
    } catch (err: any) {
      setTrackError(err.message);
    } finally {
      setTrackLoading(false);
    }
  };

  const copyRef = useCallback((ref: string) => {
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    in_review: "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  const priorityColors: Record<string, string> = {
    low: "text-blue-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    urgent: "text-red-400",
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="bg-card border rounded-xl p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold">Complaint Submitted Successfully!</h2>
          <p className="text-sm text-muted-foreground">Your complaint has been registered and will be reviewed by the relevant HOD and administration.</p>
          <div className="bg-muted/30 border border-dashed border-primary rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">REFERENCE NUMBER</p>
            <p className="text-lg font-mono font-bold text-primary tracking-wider">{submitted.referenceId}</p>
          </div>
          <button
            onClick={() => copyRef(submitted.referenceId)}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Reference ID"}
          </button>
          <p className="text-xs text-muted-foreground">Save this reference number to track your complaint status.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                logout();
                setSubmitted(null); setSubject(""); setDescription(""); setCategory(""); setPriority("medium"); setStudentName(""); setRollNumber(""); setDepartmentId("");
              }}
              className="flex-1 border border-primary text-primary font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Complaint Box
        </h1>
        <p className="text-sm text-muted-foreground">CUPGS, BPUT Rourkela — Submit your grievances & complaints</p>
      </div>

      {/* Track Complaint */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Search className="w-4 h-4" /> Track Complaint
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter Reference ID (e.g., CUPGS-CMP-XXXXXXXX)"
            value={trackId}
            onChange={e => setTrackId(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleTrack}
            disabled={trackLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {trackLoading ? "..." : "Track"}
          </button>
        </div>
        {trackError && <p className="text-sm text-red-500">{trackError}</p>}
        {trackResult && (
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{trackResult.subject}</p>
                <p className="text-xs text-muted-foreground">{trackResult.category} · {trackResult.departmentName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trackResult.status] || "bg-muted"}`}>
                {trackResult.status?.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Priority: <span className={priorityColors[trackResult.priority] || ""}>{trackResult.priority?.toUpperCase()}</span></span>
              <span>Filed: {new Date(trackResult.createdAt).toLocaleDateString("en-IN")}</span>
              {trackResult.resolvedAt && <span>Resolved: {new Date(trackResult.resolvedAt).toLocaleDateString("en-IN")}</span>}
            </div>
            {trackResult.hodRemarks && (
              <div className="bg-amber-500/10 rounded-lg p-2 text-xs">
                <span className="font-semibold text-amber-400">HOD Remarks:</span> {trackResult.hodRemarks}
              </div>
            )}
            {trackResult.adminRemarks && (
              <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                <span className="font-semibold text-blue-400">Admin Remarks:</span> {trackResult.adminRemarks}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complaint Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Step 1 — Student Info */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 1 — Your Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Your Name {!isAnonymous && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="Enter your full name"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                disabled={isAnonymous}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Roll Number {!isAnonymous && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                disabled={isAnonymous}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
            >
              <option value="">Select department</option>
              {departments?.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 rounded text-primary" />
            <div>
              <p className="text-sm font-medium">Submit anonymously</p>
              <p className="text-xs text-muted-foreground">Your identity will not be revealed</p>
            </div>
          </label>
        </div>

        {/* Step 2 — Complaint Details */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Step 2 — Complaint Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Category <span className="text-red-500">*</span></label>
              <select
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`border rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      priority === p.value ? p.color + " border-current" : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
              <span className="text-xs text-muted-foreground">{subject.length}/200</span>
            </div>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief subject of your complaint"
              maxLength={200}
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
              <span className={`text-xs ${description.length > 1800 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                {description.length}/2000
              </span>
            </div>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={5}
              maxLength={2000}
              placeholder="Describe your complaint in detail. Include specific dates, times, and incidents if applicable..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitMutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Complaint</>
          )}
        </button>
      </form>
    </div>
  );
}
