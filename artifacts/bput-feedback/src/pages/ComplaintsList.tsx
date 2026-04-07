import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye, MessageSquare, Filter, Trash2, FileText } from "lucide-react";

interface Complaint {
  id: number;
  referenceId: string;
  studentName: string;
  rollNumber: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  adminRemarks: string | null;
  hodRemarks: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-500/20 text-yellow-400" },
  { value: "in_review", label: "In Review", icon: Eye, color: "bg-blue-500/20 text-blue-400" },
  { value: "resolved", label: "Resolved", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "bg-red-500/20 text-red-400" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse",
};

export default function ComplaintsList() {
  const { role, hod, adminPassword } = useRole();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const isHod = role === "hod";
  const isAdmin = role === "admin";

  const departmentId = isHod && hod ? hod.id : undefined;

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ["complaints", departmentId, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set("departmentId", String(departmentId));
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const r = await fetch(`${getApiUrl()}/api/complaints?${params}`);
      if (!r.ok) throw new Error("Failed to fetch complaints");
      return r.json();
    },
    enabled: isHod || isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isAdmin && adminPassword) headers["x-admin-password"] = adminPassword;
      const r = await fetch(`${getApiUrl()}/api/complaints/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setSelectedComplaint(null);
      setRemarks("");
      setNewStatus("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers: Record<string, string> = {};
      if (isAdmin && adminPassword) headers["x-admin-password"] = adminPassword;
      const r = await fetch(`${getApiUrl()}/api/complaints/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!r.ok) throw new Error("Failed to delete");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setSelectedComplaint(null);
    },
  });

  const handleUpdate = () => {
    if (!selectedComplaint) return;
    const body: any = {};
    if (newStatus) body.status = newStatus;
    if (remarks.trim()) {
      if (isHod) body.hodRemarks = remarks.trim();
      else body.adminRemarks = remarks.trim();
    }
    if (Object.keys(body).length === 0) return;
    updateMutation.mutate({ id: selectedComplaint.id, body });
  };

  if (!isHod && !isAdmin) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm mt-1">Only HODs and Admins can view complaints.</p>
      </div>
    );
  }

  const pendingCount = complaints?.filter(c => c.status === "pending").length || 0;
  const urgentCount = complaints?.filter(c => c.priority === "urgent" && c.status !== "resolved").length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Complaint Box
          </h1>
          <p className="text-sm text-muted-foreground">
            {isHod ? `${hod?.name} Department — ` : "All Departments — "}
            {complaints?.length || 0} complaints
          </p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              {pendingCount} Pending
            </span>
          )}
          {urgentCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium animate-pulse">
              {urgentCount} Urgent
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          className="border rounded-lg px-3 py-1.5 text-sm bg-background"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm bg-background"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />)}
        </div>
      ) : !complaints?.length ? (
        <div className="text-center py-16 bg-card border rounded-xl">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-semibold">No complaints found</p>
          <p className="text-sm text-muted-foreground">All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => {
            const statusOpt = STATUS_OPTIONS.find(s => s.value === c.status);
            const StatusIcon = statusOpt?.icon || Clock;
            return (
              <div
                key={c.id}
                onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setRemarks(""); }}
                className={`bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all ${
                  c.priority === "urgent" && c.status === "pending" ? "border-red-500/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{c.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_COLORS[c.priority] || ""}`}>
                        {c.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      <span>{c.category}</span>
                      {isAdmin && <span className="font-medium">{c.departmentCode}</span>}
                      <span>{c.isAnonymous ? "Anonymous" : `${c.studentName} (${c.rollNumber})`}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${statusOpt?.color || "bg-muted"}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusOpt?.label || c.status}
                  </span>
                </div>
                {(c.hodRemarks || c.adminRemarks) && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex gap-3 text-[11px]">
                    {c.hodRemarks && <span className="text-violet-400"><strong>HOD:</strong> {c.hodRemarks}</span>}
                    {c.adminRemarks && <span className="text-blue-400"><strong>Admin:</strong> {c.adminRemarks}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedComplaint(null)}>
          <div className="bg-card border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedComplaint.subject}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedComplaint.referenceId}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_COLORS[selectedComplaint.priority] || ""}`}>
                  {selectedComplaint.priority.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{selectedComplaint.category}</span>
                {isAdmin && <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{selectedComplaint.departmentCode}</span>}
              </div>
              <p className="text-muted-foreground">{selectedComplaint.description}</p>
              {!selectedComplaint.isAnonymous && (
                <p className="text-xs text-muted-foreground">
                  By: {selectedComplaint.studentName} ({selectedComplaint.rollNumber})
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Filed: {new Date(selectedComplaint.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            {selectedComplaint.hodRemarks && (
              <div className="bg-violet-500/10 rounded-lg p-3 text-sm">
                <p className="font-semibold text-violet-400 text-xs mb-1">HOD Remarks</p>
                <p>{selectedComplaint.hodRemarks}</p>
              </div>
            )}
            {selectedComplaint.adminRemarks && (
              <div className="bg-blue-500/10 rounded-lg p-3 text-sm">
                <p className="font-semibold text-blue-400 text-xs mb-1">Admin Remarks</p>
                <p>{selectedComplaint.adminRemarks}</p>
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold">Update Complaint</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setNewStatus(s.value)}
                    className={`border rounded-lg px-2 py-1.5 text-xs font-medium transition-all flex items-center gap-1 justify-center ${
                      newStatus === s.value ? s.color + " border-current" : "border-border text-muted-foreground"
                    }`}
                  >
                    <s.icon className="w-3 h-3" /> {s.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                placeholder={`Add ${isHod ? "HOD" : "Admin"} remarks...`}
                maxLength={1000}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this complaint permanently?")) {
                        deleteMutation.mutate(selectedComplaint.id);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
