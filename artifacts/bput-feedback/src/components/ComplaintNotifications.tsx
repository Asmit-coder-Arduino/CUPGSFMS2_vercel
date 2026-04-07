import { useEffect, useRef, useState, useCallback } from "react";
import { useRole } from "@/contexts/RoleContext";
import { getApiUrl } from "@/lib/api";
import { Bell, X, AlertTriangle, Clock } from "lucide-react";
import { useLocation } from "wouter";

interface ComplaintNotification {
  id: string;
  type: string;
  complaint: {
    id: number;
    referenceId: string;
    subject: string;
    category: string;
    priority: string;
    departmentId: number;
    departmentName: string;
    studentName: string;
    createdAt: string;
  };
  receivedAt: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "border-blue-500/40 bg-blue-500/10",
  medium: "border-yellow-500/40 bg-yellow-500/10",
  high: "border-orange-500/40 bg-orange-500/10",
  urgent: "border-red-500/40 bg-red-500/10",
};

const PRIORITY_TEXT: Record<string, string> = {
  low: "text-blue-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

export function ComplaintNotifications() {
  const { role, hod } = useRole();
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isHod = role === "hod";
  const isAdmin = role === "admin";

  useEffect(() => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczIjqYzd68eDIjOY3I3b9/MSM5jcjdwH8xJDiNyN2/fzEkOI3I3b+AMiM5jcjdwH8xIzmNyN3AfzEjOY3I3b9/MSM5jcjdv38xIzmNyN2/fzEjOY3I3cB/MSM5jcjdwH8xIzmNyN3AfzEjOY3I3cB/MCM5jcjdwH8xIzmNyN3AfzEjOY3I3cB/MSM5jcjdv38xIzmNyN2/fzIjOY3I3b+AMSM4jcjdv38wJDiNyN2/gDEjOI3I3cB/MSM5jcjdv38xIzmNyN3AfzEjOY3I3cB/MSQ4jcjdv4AxIziNyN2/fzAkOI3I3b+AMSM4jcjdv38wJDiNyd2/gDEjOI3J3b9/MCQ4jcndv4AxIziNyd2/fzAkOI3J3b+AMSM4jcjdv38wJDiNyN2/gDAjOI3I3cB/MSM5jcjdwH8xIzmOyN3AfzEjOY3I3cB/MSM5jcjdv38xIzmNyN3AfzEjOY3I3cB/MSM5jcjdwH8xIzmNyN3AfzEjOY3I3cB/MSM5jcjdwH8xIzmNyN3AfzEjOY3I3cB/MCQ5jcjdwH8xIzmNyN2/fzEjOY3I3cB/MSM5jcjdwH8=");
    audioRef.current = audio;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isHod && !isAdmin) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const params = new URLSearchParams();
    params.set("role", role);
    if (isHod && hod) params.set("departmentId", String(hod.id));

    const url = `${getApiUrl()}/api/complaints/events/stream?${params}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_complaint") {
          const notif: ComplaintNotification = {
            id: `${data.complaint.id}-${Date.now()}`,
            type: data.type,
            complaint: data.complaint,
            receivedAt: Date.now(),
          };
          setNotifications(prev => [notif, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setTimeout(() => {
        if ((isHod || isAdmin) && eventSourceRef.current === es) {
          eventSourceRef.current = null;
        }
      }, 5000);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [role, hod, isHod, isAdmin, playNotificationSound]);

  const handleNotifClick = (notif: ComplaintNotification) => {
    setShowPanel(false);
    navigate("/complaints");
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!isHod && !isAdmin) return null;

  return (
    <>
      {/* Bell icon */}
      <button
        onClick={() => { setShowPanel(!showPanel); if (showPanel) setUnreadCount(0); }}
        className="relative p-2 rounded-xl glass text-foreground/60 hover:text-foreground transition-all"
        title="Complaint Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-bounce text-primary" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50" onClick={() => { setShowPanel(false); setUnreadCount(0); }}>
          <div
            className="absolute right-4 top-14 md:right-8 md:top-4 w-[340px] max-h-[70vh] bg-card border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Complaint Notifications
              </h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    Clear all
                  </button>
                )}
                <button onClick={() => { setShowPanel(false); setUnreadCount(0); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-56px)]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">New complaints will appear here in real-time</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const timeAgo = getTimeAgo(notif.receivedAt);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${PRIORITY_COLORS[notif.complaint.priority] || ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${
                          notif.complaint.priority === "urgent" ? "bg-red-500/20" :
                          notif.complaint.priority === "high" ? "bg-orange-500/20" :
                          "bg-primary/20"
                        }`}>
                          {notif.complaint.priority === "urgent" || notif.complaint.priority === "high" ?
                            <AlertTriangle className={`w-3.5 h-3.5 ${PRIORITY_TEXT[notif.complaint.priority]}`} /> :
                            <Clock className="w-3.5 h-3.5 text-primary" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.complaint.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold ${PRIORITY_TEXT[notif.complaint.priority] || "text-muted-foreground"}`}>
                              {notif.complaint.priority.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{notif.complaint.category}</span>
                            {notif.complaint.departmentName && (
                              <>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-muted-foreground">{notif.complaint.departmentName}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification for new urgent/high priority complaints */}
      {notifications.length > 0 && notifications[0].receivedAt > Date.now() - 5000 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 animate-fade-in">
          <div
            className={`max-w-sm border rounded-xl p-4 shadow-2xl cursor-pointer ${PRIORITY_COLORS[notifications[0].complaint.priority] || "bg-card border-border"}`}
            onClick={() => { setShowPanel(true); }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <AlertTriangle className={`w-4 h-4 ${PRIORITY_TEXT[notifications[0].complaint.priority] || "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground">New Complaint</p>
                <p className="text-sm font-medium truncate mt-0.5">{notifications[0].complaint.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold ${PRIORITY_TEXT[notifications[0].complaint.priority]}`}>
                    {notifications[0].complaint.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{notifications[0].complaint.category}</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setNotifications(prev => prev.slice(1)); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
