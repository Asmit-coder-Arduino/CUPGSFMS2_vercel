import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useListWindows } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { getApiUrl } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  GraduationCap, Users, ShieldCheck, Clock,
  CheckCircle2, Building2, ArrowRight, Sparkles,
  Lock, BarChart3, FileText, Trophy, Medal,
  Award, ChevronRight, TrendingUp, Building, Zap,
  ChevronLeft, Wifi, RefreshCw, Star, Heart,
  MessageCircle, Brain, X, Search, Loader2,
} from "lucide-react";
import { CupgsLogo } from "@/components/CupgsLogo";

/* ─────────────────────────────────
   BPUT Campus slide data
───────────────────────────────── */
const SLIDES = [
  { url: "/campus1.jpg", caption: "BPUT Campus — Rourkela, Odisha" },
  { url: "/campus2.jpg", caption: "Centre for UG & PG Studies" },
  { url: "/campus3.jpg", caption: "Excellence in Technical Education" },
  { url: "/campus4.jpg", caption: "Shaping Future Engineers" },
];

/* ─────────────────────────────────
   Hero — Full-width photo only
───────────────────────────────── */
function HeroSection({ role, faculty, hod, student, logout }: {
  role: string;
  faculty: { name: string } | null;
  hod: { hodName: string } | null;
  student: { rollNumber: string } | null;
  logout: () => void;
}) {
  const [curr, setCurr] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = SLIDES.length;

  const advance = useCallback((dir: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurr(c => (c + dir + n) % n);
      setTransitioning(false);
    }, 600);
  }, [transitioning, n]);

  const goTo = useCallback((i: number) => {
    if (transitioning || i === curr) return;
    setTransitioning(true);
    setTimeout(() => { setCurr(i); setTransitioning(false); }, 600);
  }, [transitioning, curr]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 5500);
  }, [advance]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden" style={{ height: "500px" }}>

      {/* ── Gradient fallback (shows when images load) ── */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #06030f 0%, #0d0520 50%, #080c1a 100%)" }} />

      {/* ── Photo slides ── */}
      {SLIDES.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === curr && !transitioning ? 1 : 0 }}>
          <img
            src={slide.url} alt={slide.caption}
            className="w-full h-full object-cover"
            style={{ animation: i === curr ? "slideKenBurns 14s ease-in-out infinite" : "none" }}
          />
        </div>
      ))}

      {/* ── Bottom gradient for controls ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)" }} />

      {/* ── Top vignette ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%)" }} />

      {/* ── Session pill (top-left, shown only when logged in) ── */}
      {role !== "guest" && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
          <CheckCircle2 className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
          <span className="text-white/80 text-xs font-medium">
            {role === "faculty" && faculty && faculty.name}
            {role === "hod" && hod && hod.hodName}
            {role === "student" && student && student.rollNumber}
            {role === "admin" && "Administrator"}
          </span>
          <button onClick={logout}
            className="text-[10px] text-white/40 hover:text-white/80 transition-colors ml-1">
            ✕
          </button>
        </div>
      )}

      {/* ── Slide counter (top-right) ── */}
      <div className="absolute top-4 right-4 z-20 text-[11px] font-mono"
        style={{ color: "rgba(255,255,255,0.5)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: "99px" }}>
        {curr + 1} / {n}
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-4 px-6">
        {/* Prev */}
        <button onClick={() => { advance(-1); resetTimer(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => { goTo(i); resetTimer(); }}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === curr ? "28px" : "7px",
                height: "7px",
                background: i === curr ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              }} />
          ))}
        </div>

        {/* Next */}
        <button onClick={() => { advance(1); resetTimer(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Caption (bottom-center above controls) ── */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center">
        <span className="text-xs text-white/55 font-medium tracking-wide px-3 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
          {SLIDES[curr].caption}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   Star Rating Display
───────────────────────────────── */
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.floor(rating);
        const half   = !filled && i === Math.ceil(rating) && (rating % 1) >= 0.5;
        return (
          <Star key={i}
            className="w-3.5 h-3.5"
            fill={filled ? "#fbbf24" : half ? "#fbbf2480" : "transparent"}
            stroke="#f59e0b"
            strokeWidth={1.5}
            opacity={filled || half ? 1 : 0.3}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────
   Types
───────────────────────────────── */
interface TopFaculty {
  id: number;
  name: string;
  designation: string;
  departmentName: string;
  departmentCode: string;
  avgRating: number;
  totalFeedbackCount: number;
  photoUrl: string | null;
  likeCount: number;
}

interface TopFacultyDetail {
  faculty: { id: number; name: string; designation: string; departmentName: string; departmentCode: string; photoUrl: string | null };
  ratings: { avgOverall: number | null; avgContent: number | null; avgTeaching: number | null; avgLab: number | null; avgMaterial: number | null; totalFeedback: number };
  comments: { comment: string; courseCode: string; courseName: string; createdAt: string; ratingOverall: number }[];
  likeCount: number;
  likedByMe: boolean;
  aiAnalysis: string;
}

const RANK_CFG = [
  {
    rank: 1, label: "Top Rated", icon: Trophy,
    barGrad: "rgba(255,255,255,0.18)",
    badge: "text-white/70 bg-white/5 border-white/15",
  },
  {
    rank: 2, label: "2nd Place", icon: Medal,
    barGrad: "rgba(255,255,255,0.12)",
    badge: "text-white/60 bg-white/5 border-white/10",
  },
  {
    rank: 3, label: "3rd Place", icon: Award,
    barGrad: "rgba(255,255,255,0.10)",
    badge: "text-white/55 bg-white/5 border-white/10",
  },
];

function getSessionId() {
  let sid = sessionStorage.getItem("bput_like_session");
  if (!sid) { sid = "sess_" + Math.random().toString(36).slice(2) + Date.now(); sessionStorage.setItem("bput_like_session", sid); }
  return sid;
}

/* ─────────────────────────────────
   Faculty Detail Modal
───────────────────────────────── */
function FacultyDetailModal({ facultyId, open, onClose }: { facultyId: number | null; open: boolean; onClose: () => void }) {
  const [detail, setDetail] = useState<TopFacultyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeAnimating, setLikeAnimating] = useState(false);

  useEffect(() => {
    if (!open || !facultyId) return;
    setLoading(true);
    setDetail(null);
    fetch(`${getApiUrl()}/api/faculty/${facultyId}/top-detail?sessionId=${getSessionId()}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLiked(d.likedByMe); setLikeCount(d.likeCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, facultyId]);

  const toggleLike = async () => {
    if (!facultyId) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 600);
    try {
      const res = await fetch(`${getApiUrl()}/api/faculty/${facultyId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId() }),
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const fmt = (v: number | null) => v != null ? v.toFixed(2) : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0"
        style={{ background: "rgba(15,20,35,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "28px" }}>
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground mt-3">Loading analysis...</p>
          </div>
        ) : detail ? (
          <div>
            <div className="relative p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                  {detail.faculty.photoUrl ? (
                    <img src={detail.faculty.photoUrl} alt={detail.faculty.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/60">{detail.faculty.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-white leading-tight" style={{ fontFamily: "var(--app-font-heading)" }}>{detail.faculty.name}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{detail.faculty.designation}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Building className="w-3 h-3 text-white/30" />
                    <span className="text-[11px] text-white/50">{detail.faculty.departmentName}</span>
                    <span className="text-[10px] font-mono text-white/30 ml-1">{detail.faculty.departmentCode}</span>
                  </div>
                </div>
                <button onClick={toggleLike} className="flex flex-col items-center gap-0.5 group">
                  <Heart className={`w-7 h-7 transition-all duration-300 ${liked ? "fill-red-500 text-red-500" : "text-white/30 hover:text-red-400"} ${likeAnimating ? "scale-125" : "scale-100"}`} />
                  <span className="text-[10px] font-bold text-white/40">{likeCount}</span>
                </button>
              </div>
            </div>

            <div className="px-6 pb-4">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "Overall", val: detail.ratings.avgOverall },
                  { label: "Content", val: detail.ratings.avgContent },
                  { label: "Teaching", val: detail.ratings.avgTeaching },
                  { label: "Lab", val: detail.ratings.avgLab },
                  { label: "Material", val: detail.ratings.avgMaterial },
                ].map(r => (
                  <div key={r.label} className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-lg font-black text-white/80" style={{ fontFamily: "var(--app-font-display)" }}>{fmt(r.val)}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">{r.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-white/30 mt-1.5">{detail.ratings.totalFeedback} total reviews</p>
            </div>

            {detail.aiAnalysis && (
              <div className="mx-6 mb-4 p-4 rounded-2xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300">AI Analysis</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{detail.aiAnalysis}</p>
              </div>
            )}

            {detail.comments.length > 0 && (
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-bold text-white/60">Student Comments ({detail.comments.length})</span>
                </div>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {detail.comments.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-white/30">{c.courseCode}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white/50">{c.ratingOverall?.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────
   Real-time Teacher Rankings
───────────────────────────────── */
function TopTeachersSection() {
  const qc = useQueryClient();
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [localLikes, setLocalLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

  const { data, isLoading, error } = useQuery<{ topFaculty: TopFaculty[]; topCourses: unknown[] }>({
    queryKey: ["top-rated"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/analytics/top-rated`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setUpdatedAt(new Date());
      return json;
    },
    staleTime: 0,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const top3: TopFaculty[] = (data?.topFaculty ?? []).slice(0, 3);

  const refresh = async () => {
    setSpinning(true);
    await qc.invalidateQueries({ queryKey: ["top-rated"] });
    setTimeout(() => setSpinning(false), 1200);
  };

  const handleLike = async (e: React.MouseEvent, facultyId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${getApiUrl()}/api/faculty/${facultyId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId() }),
      });
      const d = await res.json();
      setLocalLikes(prev => ({ ...prev, [facultyId]: { liked: d.liked, count: d.likeCount } }));
    } catch {}
  };

  const timeAgo = updatedAt
    ? (() => {
        const s = Math.floor((Date.now() - updatedAt.getTime()) / 1000);
        if (s < 5) return "just now";
        if (s < 60) return `${s}s ago`;
        return `${Math.floor(s / 60)}m ago`;
      })()
    : null;

  return (
    <section className="space-y-5">
      <FacultyDetailModal facultyId={selectedFacultyId} open={selectedFacultyId !== null} onClose={() => setSelectedFacultyId(null)} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)" }}>
            <Trophy className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight"
              style={{ fontFamily: "var(--app-font-heading)" }}>Top Teachers This Semester</h2>
            <p className="text-xs text-muted-foreground">Live ranking based on anonymous student ratings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(6px)" }}>
            <span className="relative w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-white/40"
                style={{ animation: "liveRing 1.8s ease-out infinite" }} />
              <span className="absolute inset-[3px] rounded-full bg-white/60" />
            </span>
            <span className="text-[11px] font-bold text-white/50">LIVE · auto 15s</span>
          </div>
          <button onClick={refresh} title="Refresh now"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(6px)" }}>
            <RefreshCw className={`w-3.5 h-3.5 text-white/50 transition-transform ${spinning ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {timeAgo && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Wifi className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          Updated {timeAgo} · Rankings update automatically when new feedback is submitted
        </p>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[0,1,2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Could not load rankings</p>
          <button onClick={refresh} className="mt-3 text-xs text-violet-400 underline">Try again</button>
        </div>
      ) : top3.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No ratings yet</p>
          <p className="text-xs text-muted-foreground mt-1">Rankings appear once students submit feedback.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {top3.map((f, idx) => {
            const cfg = RANK_CFG[idx];
            const RIcon = cfg.icon;
            const ll = localLikes[f.id];
            const lCount = ll ? ll.count : f.likeCount;
            return (
              <div key={f.id} onClick={() => setSelectedFacultyId(f.id)}
                className="glass-card rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group"
                style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
                <div style={{ height: "4px", background: cfg.barGrad }} />

                <div className="absolute top-2 right-3 font-black opacity-[0.04] leading-none select-none pointer-events-none"
                  style={{ fontSize: "72px", fontFamily: "var(--app-font-display)" }}>
                  {cfg.rank}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/10 group-hover:ring-violet-500/30 transition-all">
                      {f.photoUrl ? (
                        <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center">
                          <span className="text-xl font-bold text-white/60">{f.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white/80 font-black text-xs"
                          style={{ background: "rgba(255,255,255,0.10)", fontFamily: "var(--app-font-display)" }}>
                          #{cfg.rank}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                          <RIcon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-foreground leading-tight line-clamp-1"
                        style={{ fontFamily: "var(--app-font-heading)" }}>{f.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{f.designation}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Building className="w-3 h-3 text-white/40 flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-white/60 flex-1 truncate">{f.departmentName}</span>
                    <span className="text-[9px] font-mono text-white/40">{f.departmentCode}</span>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black leading-none text-white/85"
                          style={{ fontFamily: "var(--app-font-display)" }}>
                          {f.avgRating?.toFixed(1) ?? "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/ 5.0</span>
                      </div>
                      <StarDisplay rating={f.avgRating ?? 0} />
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={(e) => handleLike(e, f.id)}
                        className="flex items-center gap-1 group/like transition-all hover:scale-110 active:scale-90">
                        <Heart className={`w-4.5 h-4.5 transition-all duration-300 ${ll?.liked ? "fill-red-500 text-red-500 scale-110" : "text-white/25 hover:text-red-400"}`} />
                        <span className="text-[10px] font-bold text-white/30">{lCount}</span>
                      </button>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-white/60"
                          style={{ fontFamily: "var(--app-font-display)" }}>{f.totalFeedbackCount}</div>
                        <div className="text-[9px] text-muted-foreground">reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────
   BPUT Info Section
───────────────────────────────── */
function BputInfoSection() {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)" }}>
          <Building2 className="w-5 h-5 text-white/60" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground leading-tight"
            style={{ fontFamily: "var(--app-font-heading)" }}>About BPUT &amp; CUPGS</h2>
          <p className="text-xs text-muted-foreground">Biju Patnaik University of Technology, Rourkela</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { v: "2002", l: "Established", s: "Govt. of Odisha", c: "text-violet-400" },
          { v: "200+", l: "Colleges",    s: "Across Odisha",  c: "text-blue-400" },
          { v: "2L+",  l: "Students",    s: "Enrolled/yr",    c: "text-emerald-400" },
          { v: "40+",  l: "Programs",    s: "UG · PG · PhD",  c: "text-amber-400" },
        ].map(({ v, l, s, c }) => (
          <div key={l} className="stat-card p-4 text-center">
            <div className={`text-2xl font-extrabold ${c}`} style={{ fontFamily: "var(--app-font-display)" }}>{v}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5" style={{ fontFamily: "var(--app-font-heading)" }}>{l}</div>
            <div className="text-[10px] text-muted-foreground">{s}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-foreground" style={{ fontFamily: "var(--app-font-heading)" }}>
                Centre for UG &amp; PG Studies
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">In-Campus College of BPUT · Rourkela</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CUPGS is the flagship in-campus college of BPUT, offering world-class technical education
              in Engineering, Management, Computer Applications &amp; Sciences.
            </p>
            <ul className="space-y-2">
              {[
                [GraduationCap, "B.Tech, MBA, MCA, M.Tech, M.Sc programs", "text-violet-400"],
                [Building2, "CSE · ECE · EE · ME · CE departments", "text-blue-400"],
                [Trophy, "NAAC &amp; NBA Accredited programs", "text-amber-400"],
                [Zap, "State-of-the-art labs &amp; infrastructure", "text-emerald-400"],
              ].map(([Icon, text, color]) => (
                <li key={text as string} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0 mt-0.5`} />
                  <span dangerouslySetInnerHTML={{ __html: text as string }} />
                </li>
              ))}
            </ul>
            <a href="https://www.bput.ac.in/page.php?purl=cupgs" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Learn more about CUPGS <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="relative overflow-hidden min-h-[200px]">
            <img src="https://www.bput.ac.in/images/banner/Untitled-1_29.jpg" alt="BPUT Campus"
              className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.25))" }} />
            <div className="absolute bottom-3 left-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                <Building2 className="w-3 h-3 text-violet-300" /> BPUT Campus, Rourkela
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Trophy, title: "NIRF Rankings", desc: "Consistently ranked among top technical universities in Odisha", cl: "icon-circle-indigo", ic: "text-violet-500" },
          { icon: Award, title: "NBA Accreditation", desc: "Multiple B.Tech programs hold National Board of Accreditation approval", cl: "icon-circle-blue", ic: "text-blue-500" },
          { icon: TrendingUp, title: "BPUT Tech Carnival", desc: "Annual tech festival with 200+ colleges & thousands of participants", cl: "icon-circle-teal", ic: "text-emerald-500" },
        ].map(({ icon: Icon, title, desc, cl, ic }) => (
          <div key={title} className="glass-card rounded-2xl p-4 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cl}`}>
              <Icon className={ic} style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--app-font-heading)" }}>{title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────
   Track Feedback Section
───────────────────────────────── */
function TrackFeedbackSection() {
  const [refId, setRefId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    referenceId: string;
    status: string;
    message: string;
    serialNumber?: string;
    submittedAt?: string;
    courseName?: string;
    courseCode?: string;
    facultyName?: string;
    departmentName?: string;
    ratingOverall?: number;
  } | null>(null);

  const handleTrack = async () => {
    const id = refId.trim();
    if (!id) return;
    setTracking(true);
    setResult(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/feedback/track/${encodeURIComponent(id)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ found: false, referenceId: id, status: "ERROR", message: "Unable to connect to server. Please try again." });
    } finally {
      setTracking(false);
    }
  };

  return (
    <section className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.15)" }}>
          <Search className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--app-font-heading)" }}>Track Your Feedback</h2>
          <p className="text-[11px] text-muted-foreground">Enter your Reference ID to check feedback status</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g. FB-A1B2C3D4"
          value={refId}
          onChange={e => { setRefId(e.target.value); setResult(null); }}
          onKeyDown={e => e.key === "Enter" && handleTrack()}
          className="input-glass rounded-xl h-11 text-sm flex-1 font-mono"
        />
        <button
          onClick={handleTrack}
          disabled={tracking || !refId.trim()}
          className="px-5 h-11 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 transition-colors flex items-center gap-2"
        >
          {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Track
        </button>
      </div>

      {result && (
        <div className={`rounded-xl p-4 border ${
          result.found && result.status === "ACTIVE"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : result.status === "ERROR"
              ? "bg-red-500/10 border-red-500/20"
              : "bg-amber-500/10 border-amber-500/20"
        }`}>
          <div className="flex items-start gap-3">
            {result.found && result.status === "ACTIVE" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{result.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Reference: <span className="font-mono font-bold">{result.referenceId}</span></p>
              </div>
              {result.found && result.status === "ACTIVE" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {result.serialNumber && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-muted-foreground">Serial: </span>
                      <span className="font-mono font-semibold">{result.serialNumber}</span>
                    </div>
                  )}
                  {result.departmentName && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-muted-foreground">Dept: </span>
                      <span className="font-semibold">{result.departmentName}</span>
                    </div>
                  )}
                  {result.courseName && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-muted-foreground">Course: </span>
                      <span className="font-semibold">{result.courseName}</span>
                    </div>
                  )}
                  {result.ratingOverall != null && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-muted-foreground">Rating: </span>
                      <span className="font-semibold text-amber-400">{"★".repeat(Math.round(result.ratingOverall))}{"☆".repeat(5 - Math.round(result.ratingOverall))} {result.ratingOverall}/5</span>
                    </div>
                  )}
                  {result.submittedAt && (
                    <div className="p-2 rounded-lg bg-white/5 col-span-2">
                      <span className="text-muted-foreground">Submitted: </span>
                      <span className="font-semibold">{new Date(result.submittedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────
   Main Page
───────────────────────────────── */
export default function Home() {
  const { data: windows, isLoading } = useListWindows();
  const activeWindows = (windows ?? []).filter((w: { isActive?: boolean }) => w.isActive);

  const { role, faculty, hod, student, setFaculty, setHod, setStudent, setAdmin, logout } = useRole();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [showStudentModal,  setShowStudentModal]  = useState(false);
  const [showFacultyModal,  setShowFacultyModal]  = useState(false);
  const [showHodModal,      setShowHodModal]      = useState(false);
  const [showAdminModal,    setShowAdminModal]    = useState(false);

  const [rollNumber, setRollNumber] = useState("");
  const [empId, setEmpId] = useState("");
  const [pin, setPin] = useState("");
  const [hodEmpId, setHodEmpId] = useState("");
  const [hodPin, setHodPin] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clear = () => {
    setError(""); setRollNumber(""); setEmpId(""); setPin("");
    setHodEmpId(""); setHodPin(""); setAdminPass("");
  };
  const openModal = (t: "student"|"faculty"|"hod"|"admin") => {
    clear();
    if (t === "student") setShowStudentModal(true);
    else if (t === "faculty") setShowFacultyModal(true);
    else if (t === "hod") setShowHodModal(true);
    else setShowAdminModal(true);
  };

  const handleStudent = () => {
    if (!rollNumber.trim()) { setError("Please enter your roll number."); return; }
    setStudent({ rollNumber: rollNumber.trim() });
    setShowStudentModal(false);
    navigate("/submit-feedback");
  };

  const handleFaculty = async () => {
    if (!empId.trim() || !pin.trim()) { setError("Enter Employee ID and PIN."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/faculty-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId.trim(), pin: pin.trim() }),
      });
      if (!res.ok) { setError((await res.json()).error || "Login failed."); return; }
      const d = await res.json();
      setFaculty(d);
      setShowFacultyModal(false);
      toast({ title: `Welcome, ${d.name}`, description: `${d.designation} — ${d.departmentName}` });
      navigate("/faculty-portal");
    } catch { setError("Server unreachable. Try again."); }
    finally { setLoading(false); }
  };

  const handleHod = async () => {
    if (!hodEmpId.trim() || !hodPin.trim()) { setError("Enter HOD Employee ID and PIN."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/hod-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: hodEmpId.trim(), pin: hodPin.trim() }),
      });
      if (!res.ok) { setError((await res.json()).error || "Login failed."); return; }
      const d = await res.json();
      setHod(d);
      setShowHodModal(false);
      toast({ title: `Welcome, ${d.hodName}`, description: `HOD — ${d.name}` });
      navigate("/hod-dashboard");
    } catch { setError("Server unreachable. Try again."); }
    finally { setLoading(false); }
  };

  const handleAdmin = async () => {
    if (!adminPass.trim()) { setError("Enter the admin password."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      if (!res.ok) { setError((await res.json()).error || "Invalid password."); return; }
      setAdmin(adminPass);
      setShowAdminModal(false);
      toast({ title: "Admin access granted" });
      navigate("/dashboard");
    } catch { setError("Server unreachable. Try again."); }
    finally { setLoading(false); }
  };

  const inp = "input-glass rounded-xl h-11 text-sm";
  const lbl = "text-foreground/80 text-sm font-medium";

  const portalCards = [
    {
      key: "student", Icon: GraduationCap, title: "Student Portal",
      desc: "Submit anonymous academic feedback for your courses.",
      accent: "accent-line-blue", iconCl: "icon-circle-blue", iconColor: "text-blue-500 dark:text-blue-400",
      btn: "btn-gradient-blue", card: "role-card-blue", delay: "delay-150",
      badge: { l: "Anonymous", c: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20" },
      loggedIn: role === "student",
      loggedInEl: role === "student" && student ? (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active session
          </div>
          <div className="text-muted-foreground text-xs">Roll: {student.rollNumber}</div>
        </div>
      ) : null,
      defaultEl: isLoading
        ? <Skeleton className="h-14 rounded-xl" />
        : activeWindows.length > 0
          ? <div className="space-y-2">
              {activeWindows.map((w: { id: number; title: string; semester: number; academicYear: string; endDate?: string | null }) => (
                <div key={w.id} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20">
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-blue-400" /><span className="text-xs font-semibold text-blue-300">{w.title}</span></div>
                  <div className="text-[11px] text-blue-400/70 ml-5 mt-0.5">Sem {w.semester} · {w.academicYear}</div>
                </div>
              ))}
            </div>
          : <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground text-center">No active feedback windows</div>,
      btnLabel: role === "student" ? "Submit Feedback" : "Submit as Student",
      disabled: activeWindows.length === 0,
      action: () => role === "student" ? navigate("/submit-feedback") : openModal("student"),
    },
    {
      key: "faculty", Icon: Users, title: "Faculty Dashboard",
      desc: "View feedback submitted for your assigned courses.",
      accent: "accent-line-teal", iconCl: "icon-circle-teal", iconColor: "text-emerald-500 dark:text-emerald-400",
      btn: "btn-gradient-teal", card: "role-card-emerald", delay: "delay-200",
      badge: { l: "Secure Login", c: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20" },
      loggedIn: role === "faculty",
      loggedInEl: role === "faculty" && faculty ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 space-y-0.5">
          <div className="font-semibold text-emerald-200 text-sm">{faculty.name}</div>
          <div className="text-xs text-muted-foreground">{faculty.designation}</div>
          <div className="text-xs text-muted-foreground">{faculty.departmentName}</div>
          <div className="text-xs text-emerald-500">{faculty.courses.length} courses · {faculty.totalFeedbackCount} feedback</div>
        </div>
      ) : null,
      defaultEl: <ul className="space-y-2 text-xs text-muted-foreground">{["Course-wise rating breakdowns","Anonymous student comments","Semester performance trends","Category-level analytics"].map(t=><li key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"/>{t}</li>)}</ul>,
      btnLabel: role === "faculty" ? "My Dashboard" : "Faculty Login",
      disabled: false,
      action: () => role === "faculty" ? navigate("/faculty-portal") : openModal("faculty"),
    },
    {
      key: "hod", Icon: Building2, title: "HOD Analytics",
      desc: "Department heads — real-time analytics, reports & form builder.",
      accent: "accent-line-indigo", iconCl: "icon-circle-indigo", iconColor: "text-violet-500 dark:text-violet-400",
      btn: "btn-gradient-indigo", card: "role-card-violet", delay: "delay-250",
      badge: { l: "Analytics", c: "bg-violet-500/10 text-violet-500 dark:text-violet-400 border border-violet-500/20" },
      loggedIn: role === "hod",
      loggedInEl: role === "hod" && hod ? (
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-400/20 space-y-0.5">
          <div className="font-semibold text-violet-200 text-sm">{hod.hodName}</div>
          <div className="text-xs text-muted-foreground">HOD — {hod.name}</div>
          <div className="text-xs font-mono text-muted-foreground">{hod.hodEmployeeId}</div>
        </div>
      ) : null,
      defaultEl: <ul className="space-y-2 text-xs text-muted-foreground">{["Full department feedback analytics","Rating breakdowns by parameter","One-click PDF report download","Custom form builder"].map(t=><li key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"/>{t}</li>)}</ul>,
      btnLabel: role === "hod" ? "HOD Dashboard" : "HOD Login",
      disabled: false,
      action: () => role === "hod" ? navigate("/hod-dashboard") : openModal("hod"),
    },
    {
      key: "admin", Icon: ShieldCheck, title: "Administration",
      desc: "Full system access — all departments, analytics & controls.",
      accent: "accent-line-slate", iconCl: "icon-circle-slate", iconColor: "text-rose-500 dark:text-rose-400",
      btn: "btn-gradient-slate", card: "role-card-rose", delay: "delay-300",
      badge: { l: "Full Access", c: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20" },
      loggedIn: role === "admin",
      loggedInEl: role === "admin" ? (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-rose-300 mb-1">Admin session active</div>
          {[["Dashboard","/dashboard"],["Analytics","/analytics"],["Feedback Windows","/windows"]].map(([lbl,href])=>(
            <Link key={href} href={href}><button className="w-full text-left px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs transition-all flex items-center gap-2"><ChevronRight className="w-3 h-3"/>{lbl}</button></Link>
          ))}
        </div>
      ) : null,
      defaultEl: <ul className="space-y-2 text-xs text-muted-foreground">{["Institution-wide analytics","Course & faculty management","Feedback window control","All department oversight"].map(t=><li key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"/>{t}</li>)}</ul>,
      btnLabel: role === "admin" ? "Go to Dashboard" : "Admin Login",
      disabled: false,
      action: () => role === "admin" ? navigate("/dashboard") : openModal("admin"),
    },
  ];

  return (
    <div className="space-y-14">

      {/* ── Hero Slideshow ── */}
      <HeroSection role={role} faculty={faculty} hod={hod} student={student} logout={logout} />

      {/* ── Feature Strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Lock, label: "100% Anonymous", sub: "No identity stored", color: "text-blue-500" },
          { icon: BarChart3, label: "Real-time Analytics", sub: "HOD dashboard live", color: "text-violet-500" },
          { icon: FileText, label: "PDF Reports", sub: "One-click download", color: "text-emerald-500" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="glass-card rounded-2xl p-3 text-center flex flex-col items-center gap-1.5">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="text-xs font-semibold text-foreground" style={{ fontFamily: "var(--app-font-heading)" }}>{label}</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Track Feedback ── */}
      <TrackFeedbackSection />

      {/* ── Portal Cards ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2.5 tracking-tight"
          style={{ fontFamily: "var(--app-font-heading)" }}>
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-blue-500 flex-shrink-0" />
          Portal Access
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {portalCards.map(({ key, Icon, title, desc, accent, iconCl, iconColor, btn, card, delay, badge, loggedIn, loggedInEl, defaultEl, btnLabel, disabled, action }) => (
            <div key={key}
              className={`glass-card ${card} rounded-2xl overflow-hidden flex flex-col animate-card-enter ${delay} cursor-pointer group`}
              onClick={action}>
              <div className={`h-[3px] w-full ${accent}`} />
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconCl} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={iconColor} style={{ width: "1.375rem", height: "1.375rem" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-tight" style={{ fontFamily: "var(--app-font-heading)" }}>{title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${badge.c}`}>{badge.l}</span>
                </div>
                <div className="flex-1">{loggedIn && loggedInEl ? loggedInEl : defaultEl}</div>
                <button onClick={e => { e.stopPropagation(); action(); }} disabled={disabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed ${btn}`}
                  style={{ fontFamily: "var(--app-font-heading)" }}>
                  {btnLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Rankings ── */}
      <TopTeachersSection />

      {/* ── BPUT Info ── */}
      <BputInfoSection />

      {/* ── Bottom Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { v: "268+", l: "Courses",   s: "5 departments" },
          { v: "4",    l: "User Roles", s: "Role-based access" },
          { v: "0.5★", l: "Rating Step",s: "Half-star precision" },
          { v: "100%", l: "Anonymous", s: "Ref ID system" },
        ].map(({ v, l, s }) => (
          <div key={l} className="stat-card p-4 text-center">
            <div className="text-2xl font-extrabold text-gradient" style={{ fontFamily: "var(--app-font-display)" }}>{v}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5" style={{ fontFamily: "var(--app-font-heading)" }}>{l}</div>
            <div className="text-[10px] text-muted-foreground">{s}</div>
          </div>
        ))}
      </div>

      {/* ═══ MODALS ═══ */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-blue flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-base" style={{ fontFamily: "var(--app-font-heading)" }}>Student Feedback</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Your identity stays completely anonymous.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="roll" className={lbl}>Roll Number</Label>
              <Input id="roll" placeholder="e.g. 2201288006" value={rollNumber} className={inp}
                onChange={e => { setRollNumber(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleStudent()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleStudent} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-blue">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFacultyModal} onOpenChange={setShowFacultyModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-teal flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <DialogTitle className="text-base" style={{ fontFamily: "var(--app-font-heading)" }}>Faculty Login</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Use your CUPGS Employee ID and 4-digit PIN.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className={lbl}>Employee ID</Label>
              <Input placeholder="e.g. CUPGS/CSE/001" value={empId} className={inp}
                onChange={e => { setEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label className={lbl}>4-Digit PIN</Label>
              <Input type="password" placeholder="••••" maxLength={4} value={pin} className={inp}
                onChange={e => { setPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleFaculty()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleFaculty} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-teal disabled:opacity-50">
              {loading ? "Verifying…" : <> Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHodModal} onOpenChange={setShowHodModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-indigo flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <DialogTitle className="text-base" style={{ fontFamily: "var(--app-font-heading)" }}>HOD Login</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Access your department analytics dashboard.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className={lbl}>HOD Employee ID</Label>
              <Input placeholder="e.g. HOD/CSE/001" value={hodEmpId} className={inp}
                onChange={e => { setHodEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label className={lbl}>Department PIN</Label>
              <Input type="password" placeholder="e.g. CSE@2025" value={hodPin} className={inp}
                onChange={e => { setHodPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleHod()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleHod} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-indigo disabled:opacity-50">
              {loading ? "Verifying…" : <>HOD Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-slate flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <DialogTitle className="text-base" style={{ fontFamily: "var(--app-font-heading)" }}>Administrator Login</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Full system access — all departments &amp; controls.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className={lbl}>Admin Password</Label>
              <Input type="password" placeholder="••••••••" value={adminPass} className={inp}
                onChange={e => { setAdminPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdmin()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleAdmin} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-slate disabled:opacity-50">
              {loading ? "Verifying…" : <>Admin Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
