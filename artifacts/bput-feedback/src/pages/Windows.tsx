import { useState } from "react";
import { useListWindows, useCreateWindow, useUpdateWindow, getListWindowsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const feedbackTypeLabels: Record<string, string> = {
  semester_end: "Semester End",
  mid_semester: "Mid-Semester",
  event_based: "Event Based",
  placement: "Placement",
};

export default function Windows() {
  const { data: windows, isLoading } = useListWindows();
  const createWindow = useCreateWindow();
  const updateWindow = useUpdateWindow();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", feedbackType: "semester_end", academicYear: "2024-25", semester: "5", startDate: "", endDate: "" });
  const [error, setError] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) { setError("Please fill all required fields."); return; }
    setError("");
    createWindow.mutate({
      data: {
        title: form.title,
        feedbackType: form.feedbackType as "semester_end" | "mid_semester" | "event_based" | "placement",
        academicYear: form.academicYear,
        semester: parseInt(form.semester),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWindowsQueryKey() });
        setShowForm(false);
        setForm({ title: "", feedbackType: "semester_end", academicYear: "2024-25", semester: "5", startDate: "", endDate: "" });
      },
      onError: () => setError("Failed to create window.")
    });
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updateWindow.mutate({ id, data: { isActive: !isActive } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListWindowsQueryKey() })
    });
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Windows</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage feedback collection periods</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          {showForm ? "Cancel" : "New Window"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="font-semibold">Create Feedback Window</h2>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
            <input type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Semester 5 End Feedback 2024-25" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={form.feedbackType} onChange={e => setForm(f => ({...f, feedbackType: e.target.value}))}>
                <option value="semester_end">Semester End</option>
                <option value="mid_semester">Mid-Semester</option>
                <option value="event_based">Event Based</option>
                <option value="placement">Placement</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Semester</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={form.semester} onChange={e => setForm(f => ({...f, semester: e.target.value}))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date <span className="text-destructive">*</span></label>
              <input type="datetime-local" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date <span className="text-destructive">*</span></label>
              <input type="datetime-local" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Academic Year</label>
            <input type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 2024-25" value={form.academicYear} onChange={e => setForm(f => ({...f, academicYear: e.target.value}))} />
          </div>
          <button type="submit" disabled={createWindow.isPending} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {createWindow.isPending ? "Creating..." : "Create Window"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="space-y-3">
          {windows?.map(w => {
            const now = new Date();
            const start = new Date(w.startDate);
            const end = new Date(w.endDate);
            const isRunning = w.isActive && now >= start && now <= end;
            const isExpired = now > end;
            return (
              <div key={w.id} className="bg-card border rounded-lg px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{w.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isRunning ? "bg-green-100 text-green-700" : isExpired ? "bg-muted text-muted-foreground" : w.isActive ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                        {isRunning ? "Active" : isExpired ? "Expired" : w.isActive ? "Scheduled" : "Inactive"}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{feedbackTypeLabels[w.feedbackType]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{w.academicYear} · Semester {w.semester}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {start.toLocaleDateString()} — {end.toLocaleDateString()}
                    </p>
                  </div>
                  {!isExpired && (
                    <button
                      onClick={() => handleToggle(w.id, w.isActive)}
                      className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${w.isActive ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-primary/30 text-primary hover:bg-primary/10"}`}
                    >
                      {w.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(windows?.length ?? 0) === 0 && <div className="text-center py-12 text-muted-foreground">No feedback windows configured.</div>}
        </div>
      )}
    </div>
  );
}