import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListWindows } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
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
  Award, ChevronRight, TrendingUp, Building, Zap
} from "lucide-react";
import { CupgsLogo } from "@/components/CupgsLogo";

interface TopFaculty {
  id: number;
  name: string;
  designation: string;
  departmentName: string;
  departmentCode: string;
  avgRating: number;
  totalFeedbackCount: number;
}

function StarRatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = (rating % 1) >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={`star-g-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= fullStars ? `url(#star-g-${i})` : (i === fullStars + 1 && hasHalf ? `url(#star-g-${i})` : "transparent")}
            opacity={i <= fullStars ? 1 : (i === fullStars + 1 && hasHalf ? 0.55 : 0.2)}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

const RANK_CONFIG = [
  {
    rank: 1,
    icon: Trophy,
    label: "Top Rated",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    border: "rgba(245,158,11,0.5)",
    glow: "rgba(245,158,11,0.25)",
    badge: "bg-amber-500/15 border-amber-400/30 text-amber-300",
    ring: "ring-amber-400/40",
  },
  {
    rank: 2,
    icon: Medal,
    label: "2nd Place",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    border: "rgba(148,163,184,0.45)",
    glow: "rgba(148,163,184,0.18)",
    badge: "bg-slate-400/15 border-slate-400/30 text-slate-300",
    ring: "ring-slate-400/35",
  },
  {
    rank: 3,
    icon: Award,
    label: "3rd Place",
    gradient: "linear-gradient(135deg, #cd7c3a 0%, #b45309 100%)",
    border: "rgba(205,124,58,0.45)",
    glow: "rgba(205,124,58,0.18)",
    badge: "bg-orange-700/15 border-orange-600/30 text-orange-300",
    ring: "ring-orange-600/35",
  },
];

function TopTeachersSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["top-rated"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/analytics/top-rated`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const topFaculty: TopFaculty[] = data?.faculty?.slice(0, 3) || [];

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground leading-tight">Top Teachers This Semester</h2>
            <p className="text-xs text-muted-foreground">Based on anonymous student ratings</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
          <TrendingUp className="w-3 h-3" /> Live Rankings
        </span>
      </div>

      {/* Teacher cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : error || topFaculty.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No ratings yet — rankings will appear once feedback is submitted.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {topFaculty.map((faculty, idx) => {
            const cfg = RANK_CONFIG[idx];
            const RankIcon = cfg.icon;
            return (
              <div
                key={faculty.id}
                className={`glass-card rounded-2xl overflow-hidden flex flex-col animate-card-enter delay-${(idx + 1) * 100} relative`}
                style={{
                  borderColor: cfg.border,
                  boxShadow: `0 8px 32px ${cfg.glow}, 0 0 0 1px ${cfg.border}`,
                }}
              >
                {/* Rank background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 pointer-events-none"
                  style={{ background: cfg.gradient }} />

                {/* Top rank bar */}
                <div className="h-1 w-full" style={{ background: cfg.gradient }} />

                <div className="p-5 flex-1 flex flex-col gap-3">
                  {/* Rank badge + name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                        style={{ background: cfg.gradient, boxShadow: `0 4px 16px ${cfg.glow}` }}>
                        <span className="text-white font-black text-lg leading-none">#{cfg.rank}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-foreground leading-tight truncate">{faculty.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{faculty.designation}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge} flex-shrink-0`}>
                      <RankIcon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <Building className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-400 truncate">{faculty.departmentName}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">{faculty.departmentCode}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-foreground">{faculty.avgRating?.toFixed(1) || "—"}</span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </div>
                      <StarRatingDisplay rating={faculty.avgRating || 0} />
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-violet-400">{faculty.totalFeedbackCount}</div>
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

function BputInfoSection() {
  const stats = [
    { val: "2002", label: "Established", sub: "Govt. of Odisha", color: "text-violet-400" },
    { val: "200+", label: "Affiliated Colleges", sub: "Across Odisha", color: "text-blue-400" },
    { val: "2L+", label: "Students", sub: "Enrolled annually", color: "text-emerald-400" },
    { val: "40+", label: "Programs", sub: "UG, PG & Ph.D.", color: "text-amber-400" },
  ];

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground leading-tight">About BPUT & CUPGS</h2>
          <p className="text-xs text-muted-foreground">Biju Patnaik University of Technology, Rourkela</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ val, label, sub, color }) => (
          <div key={label} className="stat-card p-4 text-center">
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* Info card with BPUT image */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Text side */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Centre for UG &amp; PG Studies</h3>
              <p className="text-xs text-muted-foreground mt-0.5">In-Campus College of BPUT</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CUPGS is the premier in-campus college of BPUT, offering world-class technical education in
              Engineering, Management, Computer Applications, and Sciences.
              Located in Rourkela, Odisha, it is directly administered by the university.
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
          {/* Image side */}
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
            <div className="absolute bottom-3 left-3 right-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                <Building2 className="w-3 h-3 text-violet-300" />
                BPUT Campus, Rourkela
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            icon: Trophy,
            title: "NIRF Rankings",
            desc: "Consistently ranked among top technical universities in Odisha in National Rankings",
            color: "icon-circle-indigo",
            iconColor: "text-violet-500",
          },
          {
            icon: Award,
            title: "NBA Accreditation",
            desc: "Multiple B.Tech programs hold National Board of Accreditation approval",
            color: "icon-circle-blue",
            iconColor: "text-blue-500",
          },
          {
            icon: TrendingUp,
            title: "BPUT Tech Carnival",
            desc: "Annual tech festival bringing together 200+ colleges and thousands of students",
            color: "icon-circle-teal",
            iconColor: "text-emerald-500",
          },
        ].map(({ icon: Icon, title, desc, color, iconColor }) => (
          <div key={title} className="glass-card rounded-2xl p-4 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className={`w-4.5 h-4.5 ${iconColor}`} style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: windows, isLoading } = useListWindows();
  const activeWindows = windows?.filter(w => w.isActive) || [];
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
    <div className="space-y-12">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden animate-fade-up">
        {/* Background image */}
        <img
          src="https://www.bput.ac.in/images/banner/Untitled-1_26.jpg"
          alt="BPUT Campus"
          className="w-full h-56 md:h-64 object-cover"
          onError={e => {
            const el = e.target as HTMLImageElement;
            el.src = "https://www.bput.ac.in/images/banner/2_4.jpg";
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(6,3,15,0.85) 0%, rgba(109,40,217,0.55) 50%, rgba(0,0,0,0.6) 100%)" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full hero-badge text-sm font-medium">
            <div className="glow-dot" />
            <span>Academic Year 2024–25 · Even Semester · Feedback Open</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
              CUPGS Academic
              <br />
              <span className="text-gradient">Feedback System</span>
            </h1>
            <p className="text-sm text-white/70 mt-2 max-w-md mx-auto">
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
        </div>
      </div>

      {/* ── Feature Strip ── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up delay-100">
        {[
          { icon: Lock, label: "100% Anonymous", sub: "No identity stored", color: "text-blue-500" },
          { icon: BarChart3, label: "Real-time Analytics", sub: "HOD dashboard live", color: "text-violet-500" },
          { icon: FileText, label: "PDF Reports", sub: "One-click download", color: "text-emerald-500" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="glass-card rounded-2xl p-3 text-center flex flex-col items-center gap-1.5">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="text-xs font-semibold text-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Role Cards ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2.5 animate-fade-up delay-150">
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
                        <Icon className={`w-5.5 h-5.5 ${card.iconColor}`} style={{ width: "1.375rem", height: "1.375rem" }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground leading-tight">{card.title}</h3>
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

      {/* ── Top 3 Teachers ── */}
      <TopTeachersSection />

      {/* ── BPUT Info ── */}
      <BputInfoSection />

      {/* ── Footer stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in delay-400">
        {[
          { val: "268+", label: "Courses", sub: "5 departments" },
          { val: "4",    label: "User Roles", sub: "Role-based access" },
          { val: "0.5★", label: "Rating Step", sub: "Half-star precision" },
          { val: "100%", label: "Anonymous", sub: "Ref ID system" },
        ].map(({ val, label, sub }) => (
          <div key={label} className="stat-card p-4 text-center">
            <div className="text-2xl font-extrabold text-gradient">{val}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ══ MODALS ══ */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl icon-circle-blue flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-base">Student Feedback</DialogTitle>
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
                <DialogTitle className="text-base">Faculty Login</DialogTitle>
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
                <DialogTitle className="text-base">HOD Login</DialogTitle>
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
                <DialogTitle className="text-base">Administrator Login</DialogTitle>
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
