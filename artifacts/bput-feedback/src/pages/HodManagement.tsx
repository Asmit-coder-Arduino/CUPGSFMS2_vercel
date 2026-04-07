import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";
import { Shield, Edit2, Save, X, Eye, EyeOff, UserCog, Building } from "lucide-react";

type HodEntry = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  hodName: string | null;
  hodEmployeeId: string | null;
  hodPin: string | null;
  facultyList: { id: number; name: string; designation: string; employeeId: string }[];
};

export default function HodManagement() {
  const { role, adminPassword } = useRole();
  const { toast } = useToast();
  const [hods, setHods] = useState<HodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ hodName: "", hodEmployeeId: "", hodPin: "" });
  const [saving, setSaving] = useState(false);
  const [showPin, setShowPin] = useState<Record<number, boolean>>({});

  const fetchHods = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/hods`, {
        headers: { "x-admin-password": adminPassword || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch HODs");
      const data = await res.json();
      setHods(data);
    } catch {
      toast({ title: "Error", description: "Failed to load HOD data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchHods();
  }, [role]);

  const startEdit = (hod: HodEntry) => {
    setEditingId(hod.departmentId);
    setEditForm({
      hodName: hod.hodName || "",
      hodEmployeeId: hod.hodEmployeeId || "",
      hodPin: hod.hodPin || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ hodName: "", hodEmployeeId: "", hodPin: "" });
  };

  const saveEdit = async (deptId: number) => {
    if (!editForm.hodName || !editForm.hodEmployeeId || !editForm.hodPin) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/hods/${deptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      toast({ title: "Success", description: "HOD details updated successfully" });
      setEditingId(null);
      fetchHods();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePin = (deptId: number) => {
    setShowPin((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 mx-auto text-red-400/60" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-white/50 text-sm">Admin authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <UserCog className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">HOD Management</h1>
          <p className="text-sm text-white/50">Manage Head of Department credentials and assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {hods.map((hod) => {
            const isEditing = editingId === hod.departmentId;
            return (
              <div
                key={hod.departmentId}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: isEditing ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isEditing ? "0 0 30px rgba(245,158,11,0.15)" : "none",
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/20 flex items-center justify-center border border-white/10">
                        <Building className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{hod.departmentName}</h3>
                        <span className="text-xs font-mono text-white/40">{hod.departmentCode}</span>
                      </div>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(hod)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "rgba(252,211,77,0.9)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(hod.departmentId)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(34,197,94,0.15)",
                            color: "rgba(134,239,172,0.9)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(239,68,68,0.15)",
                            color: "rgba(252,165,165,0.9)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">HOD Name</label>
                        <input
                          type="text"
                          value={editForm.hodName}
                          onChange={(e) => setEditForm((p) => ({ ...p, hodName: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Employee ID</label>
                        <input
                          type="text"
                          value={editForm.hodEmployeeId}
                          onChange={(e) => setEditForm((p) => ({ ...p, hodEmployeeId: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Login PIN</label>
                        <input
                          type="text"
                          value={editForm.hodPin}
                          onChange={(e) => setEditForm((p) => ({ ...p, hodPin: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">HOD Name</div>
                        <div className="text-sm font-medium text-white">{hod.hodName || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">Employee ID</div>
                        <div className="text-sm font-mono text-amber-300">{hod.hodEmployeeId || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">Login PIN</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-emerald-300">
                            {showPin[hod.departmentId] ? hod.hodPin || "—" : "••••••"}
                          </span>
                          <button
                            onClick={() => togglePin(hod.departmentId)}
                            className="p-1 rounded transition-all hover:bg-white/10"
                          >
                            {showPin[hod.departmentId] ? (
                              <EyeOff className="w-3.5 h-3.5 text-white/40" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-white/40" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {hod.facultyList.length > 0 && (
                    <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-2">Department Faculty ({hod.facultyList.length})</div>
                      <div className="flex flex-wrap gap-2">
                        {hod.facultyList.map((f) => (
                          <span
                            key={f.id}
                            className="px-2.5 py-1 rounded-lg text-xs text-white/60"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
