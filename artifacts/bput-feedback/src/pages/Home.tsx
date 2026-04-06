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
  GraduationCap, Users, ShieldCheck, BookOpen, Clock,
  CheckCircle2, Building2, ArrowRight, Sparkles, Star,
  Lock, BarChart3, FileText, Shield, Trophy, Medal,
  Award, ChevronRight, TrendingUp, Building, Zap,
  ChevronLeft, Wifi, RefreshCw,
} from "lucide-react";
import { CupgsLogo } from "@/components/CupgsLogo";

/* ──────────────────────────────────────────────
   BPUT Banner images for the hero slideshow
────────────────────────────────────────────── */
const BPUT_SLIDES = [
  {
    url: "https://www.bput.ac.in/images/banner/Untitled-1_29.jpg",
    caption: "BPUT Campus — Rourkela, Odisha",
  },
  {
    url: "https://www.bput.ac.in/images/banner/Untitled-1_28.jpg",
    caption: "Centre for UG & PG Studies",
  },
  {
    url: "https://www.bput.ac.in/images/banner/Untitled-1_26.jpg",
    caption: "World-Class Infrastructure",
  },
  {
    url: "https://www.bput.ac.in/images/banner/Untitled-1_27.jpg",
    caption: "Excellence in Technical Education",
  },
  {
    url: "https://www.bput.ac.in/images/banner/2_4.jpg",
    caption: "BPUT — Shaping Future Engineers",
  },
  {
    url: "https://www.bput.ac.in/images/banner/1_4.jpg",
    caption: "Research & Innovation Hub",
  },
];

/* ──────────────────────────────────────────────
   Hero Slideshow Component
────────────────────────────────────────────── */
function HeroSlideshow({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = BPUT_SLIDES.length;

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((idx + total) % total);
      setLoadedSlides(s => new Set([...s, (idx + total) % total]));
      setAnimating(false);
    }, 380);
  }, [animating, total]);

  const next = useCallback(() => go(current + 1), [go, current]);
  const prev = useCallback(() => go(current - 1), [go, current]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  return (
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden select-none">
      {/* Slide images */}
      {BPUT_SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === current ? (animating ? 0 : 1) : 0,
            pointerEvents: i === current ? "auto" : "none",
            zIndex: i === current ? 1 : 0,
          }}
        >
          <img
            src={slide.url}
            alt={slide.caption}
            className="w-full h-full object-cover"
            style={{
              animation: i === current && !animating ? "slideKenBurns 10s ease-in-out infinite" : "none",
            }}
            onError={e => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
            }}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(180deg, rgba(6,3,15,0.45) 0%, rgba(6,3,15,0.25) 30%, rgba(6,3,15,0.6) 70%, rgba(6,3,15,0.85) 100%)",
        }} />
      {/* Side vignentte */}
      <div className="absolute inset-0 z-10"
        style={{ background: "linear-gradient(90deg, rgba(6,3,15,0.5) 0%, transparent 20%, transparent 80%, rgba(6,3,15,0.5) 100%)" }} />

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 gap-4">
        {children}
      </div>

      {/* Caption */}
      <div className="absolute bottom-14 left-0 right-0 z-20 flex justify-center">
        <span
          className="px-3 py-1 text-[11px] font-medium text-white/70 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
          key={current}
        >
          {BPUT_SLIDES[current].caption}
        </span>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-2">
        {BPUT_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i); resetTimer(); }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? "24px" : "6px",
              height: "6px",
              background: i === current
                ? "linear-gradient(90deg, #8b5cf6, #6366f1)"
                : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={() => { next(); resetTimer(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-20 text-[11px] font-mono text-white/50"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", padding: "2px 8px", borderRadius: "99px" }}>
        {current + 1}/{total}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Star Rating Display
────────────────────────────────────────────── */
function StarRatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = (rating % 1) >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= fullStars ? "#fbbf24" : (i === fullStars + 1 && hasHalf ? "#fbbf24" : "transparent")}
            opacity={i <= fullStars ? 1 : (i === fullStars + 1 && hasHalf ? 0.5 : 0.2)}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
interface TopFaculty {
  id: number;
  name: string;
  designation: string;
  departmentName: string;
  departmentCode: string;
  avgRating: number;
  totalFeedbackCount: number;
}

const RANK_CONFIG = [
  {
    rank: 1, icon: Trophy, label: "Top Rated",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    gradientText: "linear-gradient(135deg, #fde68a, #f59e0b)",
    border: "rgba(245,158,11,0.5)", glow: "rgba(245,158,11,0.2)",
    badge: "bg-amber-500/15 border-amber-400/30 text-amber-300",
    size: "md:col-span-1 md:row-start-1",
  },
  {
    rank: 2, icon: Medal, label: "2nd Place",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    gradientText: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
    border: "rgba(148,163,184,0.4)", glow: "rgba(148,163,184,0.12)",
    badge: "bg-slate-400/15 border-slate-400/30 text-slate-300",
    size: "md:col-span-1",
  },
  {
    rank: 3, icon: Award, label: "3rd Place",
    gradient: "linear-gradient(135deg, #cd7c3a 0%, #b45309 100%)",
    gradientText: "linear-gradient(135deg, #fde68a, #f97316)",
    border: "rgba(205,124,58,0.4)", glow: "rgba(205,124,58,0.12)",
    badge: "bg-orange-700/15 border-orange-600/30 text-orange-300",
    size: "md:col-span-1",
  },
];

/* ──────────────────────────────────────────────
   Top Teachers — Real-time Section
────────────────────────────────────────────── */
function TopTeachersSection() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["top-rated"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/analytics/top-rated`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setLastUpdated(new Date());
      return json;
    },
    staleTime: 0,
    refetchInterval: 15000,   // Poll every 15 seconds — real-time rankings
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const topFaculty: TopFaculty[] = data?.faculty?.slice(0, 3) || [];

  const manualRefresh = async () => {
    setJustRefreshed(true);
    await queryClient.invalidateQueries({ queryKey: ["top-rated"] });
    setTimeout(() => setJustRefreshed(false), 1500);
  };

  const timeAgo = lastUpdated
    ? (() => {
        const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        if (secs < 10) return "just now";
        if (secs < 60) return `${secs}s ago`;
        return `${Math.floor(secs / 60)}m ago`;
      })()
    : null;

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))", border: "1px solid rgba(245,158,11,0.35)" }}>
            <Trophy className="w-5.5 h-5.5 text-amber-400" style={{ width: "1.375rem", height: "1.375rem" }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight tracking-tight"
              style={{ fontFamily: "var(--app-font-heading)" }}>
              Top Teachers
            </h2>
            <p className="text-xs text-muted-foreground">Live ranking from anonymous student ratings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live badge with pulsing ring */}
          <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <span className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute inline-flex w-full h-full rounded-full bg-amber-400 opacity-75"
                style={{ animation: "liveRing 1.5s ease-out infinite" }} />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-[11px] font-bold text-amber-400">LIVE · 15s refresh</span>
          </div>

          {/* Manual refresh */}
          <button
            onClick={manualRefresh}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
            title="Refresh rankings"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${justRefreshed ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Last updated bar */}
      {timeAgo && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
          <Wifi className="w-3 h-3 text-emerald-500" />
          Rankings updated {timeAgo} · Auto-updates when new feedback is submitted
        </div>
      )}

      {/* Teacher ranking cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : error || topFaculty.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No ratings yet</p>
          <p className="text-xs text-muted-foreground mt-1">Rankings will appear once students submit feedback.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {topFaculty.map((faculty, idx) => {
            const cfg = RANK_CONFIG[idx];
            const RankIcon = cfg.icon;
            const isFirst = idx === 0;
            return (
              <div
                key={faculty.id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col relative group transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: cfg.border,
                  boxShadow: `0 6px 28px ${cfg.glow}, 0 0 0 1px ${cfg.border}`,
                  animation: isFirst ? "rankingGlow 3s ease-in-out infinite" : "none",
                }}
              >
                {/* Top gradient bar (thicker for #1) */}
                <div className="w-full" style={{ height: isFirst ? "4px" : "3px", background: cfg.gradient }} />

                {/* Rank number watermark */}
                <div className="absolute top-3 right-4 text-6xl font-black opacity-5 pointer-events-none leading-none select-none"
                  style={{ fontFamily: "var(--app-font-display)" }}>
                  #{cfg.rank}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Rank badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.gradient, boxShadow: `0 4px 16px ${cfg.glow}` }}>
                        <span className="text-white font-black text-base leading-none" style={{ fontFamily: "var(--app-font-display)" }}>
                          #{cfg.rank}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                        <RankIcon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Teacher info */}
                  <div className="space-y-1">
                    <div className="text-base font-bold text-foreground leading-tight line-clamp-1"
                      style={{ fontFamily: "var(--app-font-heading)" }}>
                      {faculty.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{faculty.designation}</div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <Building className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-300 truncate flex-1">{faculty.departmentName}</span>
                    <span className="text-[10px] font-mono text-violet-500 flex-shrink-0">{faculty.departmentCode}</span>
                  </div>

                  {/* Rating + count */}
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black leading-none"
                          style={{ fontFamily: "var(--app-font-display)", background: cfg.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {faculty.avgRating?.toFixed(1) || "—"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">/ 5.0</span>
                      </div>
                      <StarRatingDisplay rating={faculty.avgRating || 0} />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-violet-400" style={{ fontFamily: "var(--app-font-display)" }}>
                        {faculty.totalFeedbackCount}
                      </div>
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

/* ──────────────────────────────────────────────
   BPUT Info Section
────────────────────────────────────────────── */
function BputInfoSection() {
  const stats = [
    { val: "2002", label: "Established", sub: "Govt. of Odisha", color: "text-violet-400" },
    { val: "200+", label: "Affiliated Colleges", sub: "Across Odisha", color: "text-blue-400" },
    { val: "2L+", label: "Students", sub: "Enrolled annually", color: "text-emerald-400" },
    { val: "40+", label: "Programs", sub: "UG, PG & Ph.D.", color: "text-amber-400" },
  ];

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground leading-tight tracking-tight"
            style={{ fontFamily: "var(--app-font-heading)" }}>
            About BPUT &amp; CUPGS
          </h2>
          <p className="text-xs text-muted-foreground">Biju Patnaik University of Technology, Rourkela</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ val, label, sub, color }) => (
          <div key={label} className="stat-card p-4 text-center">
            <div className={`text-2xl font-extrabold ${color}`} style={{ fontFamily: "var(--app-font-display)" }}>{val}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-foreground" style={{ fontFamily: "var(--app-font-heading)" }}>
                Centre for UG &amp; PG Studies
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">In-Campus College of BPUT</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CUPGS is the premier in-campus college of BPUT, offering world-class technical education in
              Engineering, Management, Computer Applications, and Sciences. Located in Rourkela, Odisha.
            </p>
            <ul className="space-y-2">
              {[
                { icon: GraduationCap, text: "B.Tech, MBA, MCA, M.Tech, M.Sc programs", color: "text-violet-400" },
                { icon: Building2, text: "CSE, ECE, EE, ME, CE departments", color: "text-blue-400" },
                { icon: Trophy, text: "NAAC & NBA Accredited programs", color: "text-amber-400" },
                { icon: Zap, text: "State-of-the-art labs & infrastructure", color: "text-emerald-400" },
              ].map(({ icon: Icon, text, color }) => (
                <li key={text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0 mt-0.5`} />
                  {text}
                </li>
              ))}
            </ul>
            <a href="https://www.bput.ac.in/page.php?purl=cupgs" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Learn more about CUPGS <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="relative overflow-hidden min-h-[220px]">
            <img
              src="https://www.bput.ac.in/images/banner/Untitled-1_29.jpg"
              alt="BPUT Campus"
              className="w-full h-full object-cover"
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.src = "https://www.bput.ac.in/images/banner/Untitled-1_28.jpg";
              }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.3))" }} />
            <div className="absolute bottom-3 left-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                <Building2 className="w-3 h-3 text-violet-300" /> BPUT Campus, Rourkela
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Trophy, title: "NIRF Rankings", desc: "Consistently ranked among top technical universities in Odisha", color: "icon-circle-indigo", iconColor: "text-violet-500" },
          { icon: Award, title: "NBA Accreditation", desc: "Multiple B.Tech programs hold National Board of Accreditation approval", color: "icon-circle-blue", iconColor: "text-blue-500" },
          { icon: TrendingUp, title: "BPUT Tech Carnival", desc: "Annual tech festival with 200+ colleges and thousands of students", color: "icon-circle-teal", iconColor: "text-emerald-500" },
        ].map(({ icon: Icon, title, desc, color, iconColor }) => (
          <div key={title} className="glass-card rounded-2xl p-4 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className={`${iconColor}`} style={{ width: "1.125rem", height: "1.125rem" }} />
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

/* ──────────────────────────────────────────────
   Main Home Page
────────────────────────────────────────────── */
export default function Home() {
  const { data: windows, isLoading } = useListWindows();
  const activeWindows = windows?.filter(
    (w: { isActive?: boolean }) => w.isActive
  ) || [];
  const { role, faculty, hod, student, setFaculty, setHod, setStudent, setAdmin, logout } = useRole();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [rollNumber, setRollNumber] = useState("");
  const [empId, setEmpId] = useState("");
  const [pin, setPin] = useState("");
  const [hodEmpId, setHodEmpId] = useState("");
  const [hodPin, setHodPin] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearState = () => {
    setError(""); setRollNumber(""); setEmpId(""); setPin("");
    setHodEmpId(""); setHodPin(""); setAdminPass("");
  };

  const openModal = (type: "student" | "faculty" | "hod" | "admin") => {
    clearState();
    if (type === "student") setShowStudentModal(true);
    else if (type === "faculty") setShowFacultyModal(true);
    else if (type === "hod") setShowHodModal(true);
    else setShowAdminModal(true);
  };

  const handleStudentContinue = () => {
    if (!rollNumber.trim()) { setError("Please enter your roll number."); return; }
    setStudent({ rollNumber: rollNumber.trim() });
    setShowStudentModal(false);
    navigate("/submit-feedback");
  };

  const handleFacultyLogin = async () => {
    if (!empId.trim() || !pin.trim()) { setError("Please enter both Employee ID and PIN."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/faculty-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId.trim(), pin: pin.trim() }),
      });
      if (!res.ok) { setError((await res.json()).error || "Login failed."); return; }
      const data = await res.json();
      setFaculty(data);
      setShowFacultyModal(false);
      toast({ title: `Welcome, ${data.name}`, description: `${data.designation} — ${data.departmentName}` });
      navigate("/faculty-portal");
    } catch { setError("Could not reach the server. Please try again."); }
    finally { setLoading(false); }
  };

  const handleHodLogin = async () => {
    if (!hodEmpId.trim() || !hodPin.trim()) { setError("Please enter both HOD Employee ID and PIN."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/hod-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: hodEmpId.trim(), pin: hodPin.trim() }),
      });
      if (!res.ok) { setError((await res.json()).error || "Login failed."); return; }
      const data = await res.json();
      setHod(data);
      setShowHodModal(false);
      toast({ title: `Welcome, ${data.hodName}`, description: `HOD — ${data.name}` });
      navigate("/hod-dashboard");
    } catch { setError("Could not reach the server. Please try again."); }
    finally { setLoading(false); }
  };

  const handleAdminLogin = async () => {
    if (!adminPass.trim()) { setError("Please enter the admin password."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      if (!res.ok) { setError((await res.json()).error || "Invalid password."); return; }
      setAdmin();
      setShowAdminModal(false);
      toast({ title: "Admin access granted", description: "Full access to all system data." });
      navigate("/dashboard");
    } catch { setError("Could not reach the server. Please try again."); }
    finally { setLoading(false); }
  };

  const cards = [
    {
      key: "student",
      icon: GraduationCap,
      title: "Student Portal",
      desc: "Submit anonymous academic feedback for your courses.",
      accentClass: "accent-line-blue",
      iconClass: "icon-circle-blue",
      iconColor: "text-blue-500 dark:text-blue-400",
      btnClass: "btn-gradient-blue",
      roleCardClass: "role-card-blue",
      delay: "delay-150",
      badge: { label: "Anonymous", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
      loggedIn: role === "student",
      loggedInContent: role === "student" && student ? (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" /> Logged in
          </div>
          <div className="text-muted-foreground text-xs">Roll: {student.rollNumber}</div>
        </div>
      ) : null,
      defaultContent: (
        isLoading ? <Skeleton className="h-14 w-full rounded-xl" />
          : activeWindows.length > 0 ? (
            <div className="space-y-2">
              {activeWindows.map((w: { id: number; title: string; semester: number; academicYear: string; endDate?: string | null }) => (
                <div key={w.id} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/20 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs">{w.title}</span>
                  </div>
                  <div className="text-blue-500/80 text-[11px] mt-0.5 ml-5">
                    Sem {w.semester} | {w.academicYear} | Closes {w.endDate ? new Date(w.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/60 text-sm text-muted-foreground text-center">No active feedback windows right now.</div>
          )
      ),
      btnLabel: role === "student" ? "Submit Feedback" : "Submit as Student",
      btnDisabled: activeWindows.length === 0,
      onClick: () => role === "student" ? navigate("/submit-feedback") : openModal("student"),
    },
    {
      key: "faculty",
      icon: Users,
      title: "Faculty Dashboard",
      desc: "View feedback submitted for your assigned courses.",
      accentClass: "accent-line-teal",
      iconClass: "icon-circle-teal",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      btnClass: "btn-gradient-teal",
      roleCardClass: "role-card-emerald",
      delay: "delay-200",
      badge: { label: "Secure Login", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
      loggedIn: role === "faculty",
      loggedInContent: role === "faculty" && faculty ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-sm space-y-1">
          <div className="font-semibold text-emerald-700 dark:text-emerald-200">{faculty.name}</div>
          <div className="text-muted-foreground text-xs">{faculty.designation}</div>
          <div className="text-muted-foreground text-xs">{faculty.departmentName} | {faculty.employeeId}</div>
          <div className="text-emerald-500 text-xs">{faculty.courses.length} courses · {faculty.totalFeedbackCount} feedback</div>
        </div>
      ) : null,
      defaultContent: (
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["Course-wise rating breakdowns", "Anonymous student comments", "Semester performance trends", "Category-level analytics"].map(t => (
            <li key={t} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      ),
      btnLabel: role === "faculty" ? "My Dashboard" : "Faculty Login",
      btnDisabled: false,
      onClick: () => role === "faculty" ? navigate("/faculty-portal") : openModal("faculty"),
    },
    {
      key: "hod",
      icon: Building2,
      title: "HOD Analytics",
      desc: "Department heads — real-time analytics, reports & form builder.",
      accentClass: "accent-line-indigo",
      iconClass: "icon-circle-indigo",
      iconColor: "text-violet-500 dark:text-violet-400",
      btnClass: "btn-gradient-indigo",
      roleCardClass: "role-card-violet",
      delay: "delay-250",
      badge: { label: "Analytics", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20" },
      loggedIn: role === "hod",
      loggedInContent: role === "hod" && hod ? (
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-400/20 text-sm space-y-1">
          <div className="font-semibold text-violet-700 dark:text-violet-200">{hod.hodName}</div>
          <div className="text-muted-foreground text-xs">HOD — {hod.name}</div>
          <div className="text-muted-foreground text-xs font-mono">{hod.hodEmployeeId}</div>
        </div>
      ) : null,
      defaultContent: (
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["Full department feedback analytics", "Rating breakdowns by parameter", "One-click PDF report download", "Custom form builder"].map(t => (
            <li key={t} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      ),
      btnLabel: role === "hod" ? "HOD Dashboard" : "HOD Login",
      btnDisabled: false,
      onClick: () => role === "hod" ? navigate("/hod-dashboard") : openModal("hod"),
    },
    {
      key: "admin",
      icon: ShieldCheck,
      title: "Administration",
      desc: "Full system access — all departments, analytics & controls.",
      accentClass: "accent-line-slate",
      iconClass: "icon-circle-slate",
      iconColor: "text-rose-500 dark:text-rose-400",
      btnClass: "btn-gradient-slate",
      roleCardClass: "role-card-rose",
      delay: "delay-300",
      badge: { label: "Full Access", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" },
      loggedIn: role === "admin",
      loggedInContent: role === "admin" ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-2">Admin session active</div>
          {[["Dashboard", "/dashboard"], ["Analytics", "/analytics"], ["Feedback Windows", "/windows"]].map(([label, href]) => (
            <Link key={href} href={href}>
              <button className="w-full text-left px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs transition-all flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />{label}
              </button>
            </Link>
          ))}
        </div>
      ) : null,
      defaultContent: (
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["Institution-wide analytics", "Course & faculty management", "Feedback window control", "All department oversight"].map(t => (
            <li key={t} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      ),
      btnLabel: role === "admin" ? "Go to Dashboard" : "Admin Login",
      btnDisabled: false,
      onClick: () => role === "admin" ? navigate("/dashboard") : openModal("admin"),
    },
  ];

  const modalInputClass = "input-glass rounded-xl h-11 text-sm";
  const modalLabelClass = "text-foreground/80 text-sm font-medium";

  return (
    <div className="space-y-14">

      {/* ── Hero Slideshow ── */}
      <HeroSlideshow>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full hero-badge text-sm font-medium"
          style={{ fontFamily: "var(--app-font-sans)" }}>
          <div className="glow-dot" />
          <span>Academic Year 2024–25 · Even Semester · Feedback Open</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Main heading */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight drop-shadow-lg"
            style={{ fontFamily: "var(--app-font-display)" }}>
            CUPGS Academic
          </h1>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-none tracking-tight drop-shadow-lg text-gradient"
            style={{ fontFamily: "var(--app-font-display)" }}>
            Feedback System
          </h1>
          <p className="text-sm text-white/65 mt-1" style={{ fontFamily: "var(--app-font-sans)" }}>
            Secure · Anonymous · Real-time Analytics · BPUT Rourkela
          </p>
        </div>

        {role !== "guest" && (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {role === "faculty" && faculty && `Faculty: ${faculty.name}`}
            {role === "hod" && hod && `HOD: ${hod.hodName}`}
            {role === "student" && student && `Student: ${student.rollNumber}`}
            {role === "admin" && "Administrator"}
            <button onClick={logout} className="text-xs text-emerald-300/70 hover:text-white transition-colors underline ml-1">Sign out</button>
          </div>
        )}
      </HeroSlideshow>

      {/* ── Feature Strip ── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up delay-100">
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

      {/* ── Role Cards ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2.5 tracking-tight animate-fade-up delay-150"
          style={{ fontFamily: "var(--app-font-heading)" }}>
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-blue-500" />
          Portal Access
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`glass-card ${card.roleCardClass} rounded-2xl overflow-hidden flex flex-col animate-card-enter ${card.delay} cursor-pointer group`}
                onClick={card.onClick}
              >
                <div className={`h-[3px] w-full ${card.accentClass}`} />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.iconClass} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`${card.iconColor}`} style={{ width: "1.375rem", height: "1.375rem" }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground leading-tight" style={{ fontFamily: "var(--app-font-heading)" }}>
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${card.badge.color}`}>
                      {card.badge.label}
                    </span>
                  </div>
                  <div className="flex-1">
                    {card.loggedIn && card.loggedInContent ? card.loggedInContent : card.defaultContent}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); card.onClick(); }}
                    disabled={card.btnDisabled}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed ${card.btnClass}`}
                    style={{ fontFamily: "var(--app-font-heading)" }}
                  >
                    {card.btnLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live Top Teachers ── */}
      <TopTeachersSection />

      {/* ── BPUT Info ── */}
      <BputInfoSection />

      {/* ── Footer stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in delay-400">
        {[
          { val: "268+", label: "Courses", sub: "5 departments" },
          { val: "4",    label: "User Roles", sub: "Role-based access" },
          { val: "0.5★", label: "Rating Step", sub: "Half-star precision" },
          { val: "100%", label: "Anonymous", sub: "Ref ID system" },
        ].map(({ val, label, sub }) => (
          <div key={label} className="stat-card p-4 text-center">
            <div className="text-2xl font-extrabold text-gradient" style={{ fontFamily: "var(--app-font-display)" }}>{val}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5" style={{ fontFamily: "var(--app-font-heading)" }}>{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ══════ MODALS ══════ */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-blue flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-base" style={{ fontFamily: "var(--app-font-heading)" }}>Student Feedback</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Your identity remains completely anonymous.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber" className={modalLabelClass}>Roll Number</Label>
              <Input id="rollNumber" placeholder="e.g. 2201288006" value={rollNumber}
                className={modalInputClass}
                onChange={e => { setRollNumber(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleStudentContinue()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleStudentContinue}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-blue">
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
              <Label htmlFor="empId" className={modalLabelClass}>Employee ID</Label>
              <Input id="empId" placeholder="e.g. CUPGS/CSE/001" value={empId}
                className={modalInputClass}
                onChange={e => { setEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pin" className={modalLabelClass}>4-Digit PIN</Label>
              <Input id="pin" type="password" placeholder="••••" maxLength={4} value={pin}
                className={modalInputClass}
                onChange={e => { setPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleFacultyLogin()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleFacultyLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-teal disabled:opacity-50">
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
              <Label htmlFor="hodEmpId" className={modalLabelClass}>HOD Employee ID</Label>
              <Input id="hodEmpId" placeholder="e.g. HOD/CSE/001" value={hodEmpId}
                className={modalInputClass}
                onChange={e => { setHodEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hodPin" className={modalLabelClass}>Department PIN</Label>
              <Input id="hodPin" type="password" placeholder="e.g. CSE@2025" value={hodPin}
                className={modalInputClass}
                onChange={e => { setHodPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleHodLogin()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleHodLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-indigo disabled:opacity-50">
              {loading ? "Verifying…" : <>Login as HOD <ArrowRight className="w-4 h-4" /></>}
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
              <Label htmlFor="adminPass" className={modalLabelClass}>Admin Password</Label>
              <Input id="adminPass" type="password" placeholder="••••••••" value={adminPass}
                className={modalInputClass}
                onChange={e => { setAdminPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleAdminLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-slate disabled:opacity-50">
              {loading ? "Verifying…" : <>Admin Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
