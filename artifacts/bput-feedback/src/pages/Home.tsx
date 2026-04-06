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
  ChevronLeft, Wifi, RefreshCw, Star,
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
   Hero Slideshow — fully redesigned
───────────────────────────────── */
function HeroSection({ role, faculty, hod, student, logout }: {
  role: string;
  faculty: { name: string } | null;
  hod: { hodName: string } | null;
  student: { rollNumber: string } | null;
  logout: () => void;
}) {
  const [curr, setCurr] = useState(0);
  const [fading, setFading] = useState(false);
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = SLIDES.length;

  const advance = useCallback((dir: number) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setCurr(c => (c + dir + n) % n);
      setFading(false);
    }, 450);
  }, [fading, n]);

  const goTo = useCallback((i: number) => {
    if (fading || i === curr) return;
    setFading(true);
    setTimeout(() => { setCurr(i); setFading(false); }, 450);
  }, [fading, curr]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 5500);
  }, [advance]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const showImg = !imgFailed[curr];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden"
      style={{ height: "420px", minHeight: "320px" }}
    >
      {/* ── Base: always-beautiful gradient background ── */}
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(109,40,217,0.7) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.5) 0%, transparent 50%), radial-gradient(ellipse at 60% 50%, rgba(139,92,246,0.4) 0%, transparent 60%), linear-gradient(135deg, #06030f 0%, #0d0520 40%, #080c1a 100%)",
        }}
      />

      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[12%] w-48 h-48 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
        <div className="absolute bottom-[10%] right-[10%] w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,1) 0%, transparent 70%)", animation: "float 11s ease-in-out infinite reverse" }} />
        <div className="absolute top-[40%] right-[30%] w-32 h-32 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(196,181,253,1) 0%, transparent 70%)", animation: "float 6s ease-in-out infinite 2s" }} />
      </div>

      {/* Subtle mesh grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      {/* ── BPUT Slideshow image layer ── */}
      {SLIDES.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === curr && showImg && !fading ? 1 : 0, zIndex: 1 }}>
          <img
            src={slide.url}
            alt={slide.caption}
            className="w-full h-full object-cover"
            style={{ animation: i === curr ? "slideKenBurns 12s ease-in-out infinite" : "none" }}
            onError={() => setImgFailed(prev => ({ ...prev, [i]: true }))}
          />
          {/* Photo overlay — keep gradient visible */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(6,3,15,0.55) 0%, rgba(6,3,15,0.2) 35%, rgba(6,3,15,0.55) 70%, rgba(6,3,15,0.88) 100%)",
            }} />
        </div>
      ))}

      {/* Decorative large ring */}
      <div className="absolute pointer-events-none"
        style={{
          width: "600px", height: "600px",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: "50%",
          zIndex: 2,
        }} />
      <div className="absolute pointer-events-none"
        style={{
          width: "420px", height: "420px",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(139,92,246,0.08)",
          borderRadius: "50%",
          zIndex: 2,
        }} />

      {/* ── MAIN CONTENT ── */}
      <div className="absolute inset-0 z-10 flex">
        {/* Left: CUPGS Logo + text */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 gap-5">

          {/* Live badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.8)" }}>
              <span className="relative flex items-center justify-center w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-70"
                  style={{ animation: "liveRing 2s ease-out infinite" }} />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              Academic Year 2024–25 · Even Semester
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-1">
            <div className="text-white/60 text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--app-font-heading)" }}>
              Biju Patnaik University of Technology
            </div>
            <h1 className="leading-tight tracking-tight drop-shadow-lg"
              style={{
                fontFamily: "var(--app-font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 900,
                color: "white",
              }}>
              CUPGS Academic
            </h1>
            <h1 className="leading-tight tracking-tight drop-shadow-lg"
              style={{
                fontFamily: "var(--app-font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 900,
                background: "linear-gradient(90deg, #c4b5fd 0%, #818cf8 40%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Feedback System
            </h1>
            <p className="text-sm text-white/50 pt-1" style={{ fontFamily: "var(--app-font-sans)" }}>
              Secure · Anonymous · Real-time · BPUT Rourkela
            </p>
          </div>

          {/* Logged-in pill */}
          {role !== "guest" && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl self-start"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(8px)" }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-200 text-sm font-semibold">
                {role === "faculty" && faculty && `Faculty: ${faculty.name}`}
                {role === "hod" && hod && `HOD: ${hod.hodName}`}
                {role === "student" && student && `Student: ${student.rollNumber}`}
                {role === "admin" && "Administrator"}
              </span>
              <button onClick={logout}
                className="text-[11px] text-emerald-400/60 hover:text-emerald-200 transition-colors underline leading-none ml-1">
                Sign out
              </button>
            </div>
          )}

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { val: "2002", label: "Est." },
              { val: "200+", label: "Colleges" },
              { val: "2L+", label: "Students" },
              { val: "5", label: "Depts." },
            ].map(({ val, label }) => (
              <div key={label} className="px-3 py-1 rounded-lg text-xs font-semibold text-white/70"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(6px)" }}>
                <span className="text-white font-bold">{val}</span> {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: CUPGS Logo (desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-center px-10 gap-4">
          <div className="relative">
            {/* Glow behind logo */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-60"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)", transform: "scale(1.4)" }} />
            <CupgsLogo size={150} className="relative drop-shadow-2xl" style={{ animation: "float 6s ease-in-out infinite" } as React.CSSProperties} />
          </div>
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">CUPGS</div>
            <div className="text-[10px] text-white/30 tracking-wider">Centre for UG &amp; PG Studies</div>
          </div>
        </div>
      </div>

      {/* ── Slide controls bottom ── */}
      <div className="absolute bottom-4 left-8 md:left-12 z-20 flex items-center gap-3">
        {/* Prev */}
        <button onClick={() => { advance(-1); resetTimer(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
          <ChevronLeft className="w-3.5 h-3.5 text-white/80" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => { goTo(i); resetTimer(); }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === curr ? "20px" : "6px",
                height: "6px",
                background: i === curr
                  ? "linear-gradient(90deg, #8b5cf6, #6366f1)"
                  : "rgba(255,255,255,0.25)",
              }} />
          ))}
        </div>

        {/* Next */}
        <button onClick={() => { advance(1); resetTimer(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}>
          <ChevronRight className="w-3.5 h-3.5 text-white/80" />
        </button>

        {/* Caption */}
        <span className="hidden sm:block text-[11px] text-white/40 ml-1" key={curr}>
          {SLIDES[curr].caption}
        </span>
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-20 text-[11px] font-mono"
        style={{ color: "rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", padding: "2px 8px", borderRadius: "99px" }}>
        {curr + 1}/{n}
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
}

const RANK_CFG = [
  {
    rank: 1, label: "Top Rated", icon: Trophy,
    barGrad: "linear-gradient(90deg, #f59e0b, #d97706)",
    numGrad: "linear-gradient(135deg, #fde68a, #f59e0b)",
    border: "rgba(245,158,11,0.45)", glow: "rgba(245,158,11,0.18)",
    badge: "text-amber-300 bg-amber-500/10 border-amber-400/30",
    pulse: true,
  },
  {
    rank: 2, label: "2nd Place", icon: Medal,
    barGrad: "linear-gradient(90deg, #94a3b8, #64748b)",
    numGrad: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
    border: "rgba(148,163,184,0.38)", glow: "rgba(148,163,184,0.10)",
    badge: "text-slate-300 bg-slate-400/10 border-slate-400/30",
    pulse: false,
  },
  {
    rank: 3, label: "3rd Place", icon: Award,
    barGrad: "linear-gradient(90deg, #cd7c3a, #b45309)",
    numGrad: "linear-gradient(135deg, #fed7aa, #f97316)",
    border: "rgba(205,124,58,0.38)", glow: "rgba(205,124,58,0.10)",
    badge: "text-orange-300 bg-orange-700/10 border-orange-600/30",
    pulse: false,
  },
];

/* ─────────────────────────────────
   Real-time Teacher Rankings
───────────────────────────────── */
function TopTeachersSection() {
  const qc = useQueryClient();
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);

  const { data, isLoading, error } = useQuery<{ faculty: TopFaculty[] }>({
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

  const top3: TopFaculty[] = (data?.faculty ?? []).slice(0, 3);

  const refresh = async () => {
    setSpinning(true);
    await qc.invalidateQueries({ queryKey: ["top-rated"] });
    setTimeout(() => setSpinning(false), 1200);
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
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.06))", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight"
              style={{ fontFamily: "var(--app-font-heading)" }}>Top Teachers This Semester</h2>
            <p className="text-xs text-muted-foreground">Live ranking based on anonymous student ratings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
            <span className="relative w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-amber-400"
                style={{ animation: "liveRing 1.8s ease-out infinite" }} />
              <span className="absolute inset-[3px] rounded-full bg-amber-400" />
            </span>
            <span className="text-[11px] font-bold text-amber-400">LIVE · auto 15s</span>
          </div>
          <button onClick={refresh} title="Refresh now"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }}>
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 transition-transform ${spinning ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Last updated */}
      {timeAgo && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Wifi className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          Updated {timeAgo} · Rankings update automatically when new feedback is submitted
        </p>
      )}

      {/* Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[0,1,2].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
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
            return (
              <div key={f.id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  borderColor: cfg.border,
                  boxShadow: `0 4px 24px ${cfg.glow}, 0 0 0 1px ${cfg.border}`,
                  animation: cfg.pulse ? "rankingGlow 3s ease-in-out infinite" : "none",
                }}>
                {/* Top bar */}
                <div style={{ height: "4px", background: cfg.barGrad }} />

                {/* Rank watermark */}
                <div className="absolute top-2 right-3 font-black opacity-[0.04] leading-none select-none pointer-events-none"
                  style={{ fontSize: "72px", fontFamily: "var(--app-font-display)" }}>
                  {cfg.rank}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3.5">
                  {/* Rank + badge */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-base"
                      style={{ background: cfg.barGrad, boxShadow: `0 4px 12px ${cfg.glow}`, fontFamily: "var(--app-font-display)" }}>
                      #{cfg.rank}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      <RIcon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                  </div>

                  {/* Name + designation */}
                  <div>
                    <div className="font-extrabold text-base text-foreground leading-tight line-clamp-1"
                      style={{ fontFamily: "var(--app-font-heading)" }}>{f.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{f.designation}</div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                    style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.14)" }}>
                    <Building className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-300 flex-1 truncate">{f.departmentName}</span>
                    <span className="text-[10px] font-mono text-violet-500 flex-shrink-0">{f.departmentCode}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-end justify-between mt-auto">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black leading-none"
                          style={{ fontFamily: "var(--app-font-display)", background: cfg.numGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {f.avgRating?.toFixed(1) ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </div>
                      <StarDisplay rating={f.avgRating ?? 0} />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-violet-400"
                        style={{ fontFamily: "var(--app-font-display)" }}>{f.totalFeedbackCount}</div>
                      <div className="text-[10px] text-muted-foreground">reviews</div>
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
          style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
          <Building2 className="w-5 h-5 text-blue-400" />
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
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
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
      setAdmin();
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
