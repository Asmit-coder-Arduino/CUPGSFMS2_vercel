import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useListWindows } from "@workspace/api-client-react";
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
  Lock, BarChart3, FileText, Zap, Shield, ChevronRight
} from "lucide-react";
import { CupgsLogo } from "@/components/CupgsLogo";

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
      glow: "rgba(59,130,246,0.15)",
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
              {activeWindows.map(w => (
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
      glow: "rgba(16,185,129,0.12)",
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
      glow: "rgba(139,92,246,0.18)",
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
      glow: "rgba(244,63,94,0.12)",
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
    <div className="max-w-5xl mx-auto space-y-10">

      {/* ── Hero Section ── */}
      <div className="text-center pt-8 pb-2 space-y-6 animate-fade-up">

        {/* Logo with glow ring */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 dark:opacity-60"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)" }} />
            <CupgsLogo size={76} className="animate-float drop-shadow-2xl relative z-10" />
          </div>
        </div>

        {/* Semester badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full hero-badge text-sm font-medium animate-fade-up delay-100">
          <div className="glow-dot" />
          <span>Academic Year 2024–25 · Even Semester</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Headline with gradient */}
        <div className="space-y-3 animate-fade-up delay-150">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-glow-blue">CUPGS Academic</span>
            <br />
            <span className="text-gradient">Feedback System</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Secure, structured &amp; anonymous feedback collection for
            Centre for UG &amp; PG Studies, BPUT Rourkela.
          </p>
        </div>

        {/* Logged-in status */}
        {role !== "guest" && (
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-fade-up delay-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {role === "faculty" && faculty && `Faculty: ${faculty.name} — ${faculty.departmentName}`}
            {role === "hod" && hod && `HOD: ${hod.hodName} — ${hod.name}`}
            {role === "student" && student && `Student: Roll No. ${student.rollNumber}`}
            {role === "admin" && "Administrator — Full Access"}
            <button onClick={logout} className="ml-2 text-xs text-muted-foreground hover:text-foreground underline transition-colors">
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* ── Feature Highlights Strip ── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up delay-200">
        {[
          { icon: Lock, label: "100% Anonymous", sub: "No identity stored", color: "text-blue-500" },
          { icon: BarChart3, label: "Real-time Analytics", sub: "HOD dashboard live", color: "text-violet-500" },
          { icon: FileText, label: "PDF Reports", sub: "One-click download", color: "text-emerald-500" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="glass-card rounded-2xl p-3 text-center flex flex-col items-center gap-1.5">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="text-xs font-semibold text-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Role Cards ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`glass-card ${card.roleCardClass} rounded-2xl overflow-hidden flex flex-col animate-card-enter ${card.delay} cursor-pointer group`}
              onClick={card.onClick}
            >
              {/* Top accent bar */}
              <div className={`h-[3px] w-full ${card.accentClass}`} />

              <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.iconClass} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-5.5 h-5.5 ${card.iconColor}`} style={{ width: "1.375rem", height: "1.375rem" }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground leading-tight">{card.title}</h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${card.badge.color}`}>
                    {card.badge.label}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {card.loggedIn && card.loggedInContent
                    ? card.loggedInContent
                    : card.defaultContent}
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); card.onClick(); }}
                  disabled={card.btnDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none ${card.btnClass}`}
                >
                  {card.btnLabel}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in delay-400">
        {[
          { val: "268+", label: "Courses", sub: "5 departments" },
          { val: "4",    label: "User Roles", sub: "Role-based access" },
          { val: "0.5★", label: "Rating Step", sub: "Half-star drag" },
          { val: "100%", label: "Anonymous", sub: "Ref ID system" },
        ].map(({ val, label, sub }) => (
          <div key={label} className="stat-card p-4 text-center">
            <div className="text-2xl font-extrabold text-gradient">{val}</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-6 animate-fade-in delay-500">
        <div className="inline-flex items-center gap-2 text-muted-foreground/50 text-xs">
          <Shield className="w-3 h-3" />
          CUPGS Feedback Management System · Secure &amp; Anonymous · BPUT Rourkela
        </div>
      </div>

      {/* ══ MODALS ══ */}
      {/* Student Modal */}
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

      {/* Faculty Modal */}
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

      {/* HOD Modal */}
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

      {/* Admin Modal */}
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
