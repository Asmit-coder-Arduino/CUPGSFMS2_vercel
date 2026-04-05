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
  CheckCircle2, Building2, ArrowRight, Sparkles, Star
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
      title: "Students",
      desc: "Submit anonymous academic feedback for your courses.",
      accentClass: "accent-line-blue",
      iconClass: "icon-circle-blue",
      iconColor: "text-sky-600 dark:text-sky-400",
      btnClass: "btn-gradient-blue",
      delay: "delay-150",
      loggedIn: role === "student",
      loggedInContent: role === "student" && student ? (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 dark:bg-sky-900/20 dark:border-sky-400/20 text-sm">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 font-semibold mb-1">
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
                <div key={w.id} className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 dark:bg-sky-900/20 dark:border-sky-400/20 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                    <span className="font-medium text-sky-700 dark:text-sky-300 text-xs">{w.title}</span>
                  </div>
                  <div className="text-sky-500/80 text-[11px] mt-0.5 ml-5">
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
      title: "Faculty",
      desc: "View feedback submitted for your own courses.",
      accentClass: "accent-line-teal",
      iconClass: "icon-circle-teal",
      iconColor: "text-teal-600 dark:text-teal-400",
      btnClass: "btn-gradient-teal",
      delay: "delay-200",
      loggedIn: role === "faculty",
      loggedInContent: role === "faculty" && faculty ? (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-900/20 dark:border-teal-400/20 text-sm space-y-1">
          <div className="font-semibold text-teal-700 dark:text-teal-200">{faculty.name}</div>
          <div className="text-muted-foreground text-xs">{faculty.designation}</div>
          <div className="text-muted-foreground text-xs">{faculty.departmentName} | {faculty.employeeId}</div>
          <div className="text-teal-500 text-xs">{faculty.courses.length} courses · {faculty.totalFeedbackCount} feedback</div>
        </div>
      ) : null,
      defaultContent: (
        <p className="text-sm text-muted-foreground leading-relaxed">Log in with your Employee ID and 4-digit PIN to view detailed feedback analytics for your courses only.</p>
      ),
      btnLabel: role === "faculty" ? "My Dashboard" : "Faculty Login",
      btnDisabled: false,
      onClick: () => role === "faculty" ? navigate("/faculty-portal") : openModal("faculty"),
    },
    {
      key: "hod",
      icon: Building2,
      title: "HOD Login",
      desc: "Department heads — view all feedback, analytics & download PDF reports.",
      accentClass: "accent-line-indigo",
      iconClass: "icon-circle-indigo",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      btnClass: "btn-gradient-indigo",
      delay: "delay-250",
      loggedIn: role === "hod",
      loggedInContent: role === "hod" && hod ? (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-400/20 text-sm space-y-1">
          <div className="font-semibold text-indigo-700 dark:text-indigo-200">{hod.hodName}</div>
          <div className="text-muted-foreground text-xs">HOD — {hod.name}</div>
          <div className="text-muted-foreground text-xs font-mono">{hod.hodEmployeeId}</div>
        </div>
      ) : null,
      defaultContent: (
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {["View all faculty & course feedback", "Rating breakdowns by parameter", "Anonymous student comments", "Download full PDF report"].map(t => (
            <li key={t} className="flex items-center gap-2">
              <Star className="w-3 h-3 text-indigo-400 flex-shrink-0" />{t}
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
      desc: "Full system access — all departments, analytics, and feedback controls.",
      accentClass: "accent-line-slate",
      iconClass: "icon-circle-slate",
      iconColor: "text-slate-600 dark:text-slate-400",
      btnClass: "btn-gradient-slate",
      delay: "delay-300",
      loggedIn: role === "admin",
      loggedInContent: role === "admin" ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Admin session active</div>
          {[["Dashboard", "/dashboard"], ["Analytics", "/analytics"], ["Feedback Windows", "/windows"]].map(([label, href]) => (
            <Link key={href} href={href}>
              <button className="w-full text-left px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs transition-all flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />{label}
              </button>
            </Link>
          ))}
        </div>
      ) : null,
      defaultContent: (
        <p className="text-sm text-muted-foreground leading-relaxed">Access institution-wide analytics, all department data, faculty management, and manage feedback windows.</p>
      ),
      btnLabel: role === "admin" ? "Go to Dashboard" : "Admin Login",
      btnDisabled: false,
      onClick: () => role === "admin" ? navigate("/dashboard") : openModal("admin"),
    },
  ];

  const modalLabelClass = "text-foreground/80 text-sm font-medium";

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* ── Hero ── */}
      <div className="text-center pt-6 pb-4 space-y-5 animate-fade-up">
        <div className="flex justify-center">
          <CupgsLogo size={72} className="animate-float drop-shadow-2xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full hero-badge text-sm font-medium animate-fade-up delay-100">
          <Sparkles className="w-3.5 h-3.5" />
          Academic Year 2024–25 | Even Semester
        </div>

        <div className="space-y-3 animate-fade-up delay-150">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-glow-blue leading-tight">
            CUPGS Academic<br className="hidden md:block" /> Feedback
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Secure, structured feedback collection for Centre for UG &amp; PG Studies (CUPGS), BPUT Rourkela.
          </p>
        </div>

        {role !== "guest" && (
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-400/25 text-green-700 dark:text-green-300 text-sm font-medium animate-fade-up delay-200">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
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

      {/* ── Role Cards ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`glass-card rounded-2xl overflow-hidden flex flex-col animate-card-enter ${card.delay}`}
            >
              <div className={`h-0.5 w-full ${card.accentClass}`} />
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.iconClass}`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-foreground leading-tight">{card.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>

                <div className="flex-1">
                  {card.loggedIn && card.loggedInContent
                    ? card.loggedInContent
                    : card.defaultContent}
                </div>

                <button
                  onClick={card.onClick}
                  disabled={card.btnDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${card.btnClass}`}
                >
                  {card.btnLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-4 animate-fade-in delay-500">
        <div className="inline-flex items-center gap-2 text-muted-foreground/60 text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          CUPGS Feedback Management System · Secure &amp; Anonymous
        </div>
      </div>

      {/* ══ MODALS ══ */}
      {/* Student Modal */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Student Feedback Access</DialogTitle>
            <DialogDescription>Enter your roll number. Your feedback will remain anonymous.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber" className={modalLabelClass}>Roll Number</Label>
              <Input id="rollNumber" placeholder="e.g. 2201288006" value={rollNumber}
                className="input-glass rounded-xl h-11"
                onChange={e => { setRollNumber(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleStudentContinue()} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button onClick={handleStudentContinue}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-blue">
              Continue to Submit Feedback <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Modal */}
      <Dialog open={showFacultyModal} onOpenChange={setShowFacultyModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Faculty Login</DialogTitle>
            <DialogDescription>Use your CUPGS Employee ID and 4-digit PIN to log in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="empId" className={modalLabelClass}>Employee ID</Label>
              <Input id="empId" placeholder="e.g. CUPGS/CSE/001" value={empId}
                className="input-glass rounded-xl h-11"
                onChange={e => { setEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pin" className={modalLabelClass}>4-Digit PIN</Label>
              <Input id="pin" type="password" placeholder="••••" maxLength={4} value={pin}
                className="input-glass rounded-xl h-11"
                onChange={e => { setPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleFacultyLogin()} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button onClick={handleFacultyLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-teal disabled:opacity-50">
              {loading ? "Verifying…" : <> Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* HOD Modal */}
      <Dialog open={showHodModal} onOpenChange={setShowHodModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>HOD Login</DialogTitle>
            <DialogDescription>Enter your HOD Employee ID and department PIN to access your branch dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="hodEmpId" className={modalLabelClass}>HOD Employee ID</Label>
              <Input id="hodEmpId" placeholder="e.g. HOD/CSE/001" value={hodEmpId}
                className="input-glass rounded-xl h-11"
                onChange={e => { setHodEmpId(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hodPin" className={modalLabelClass}>Department PIN</Label>
              <Input id="hodPin" type="password" placeholder="e.g. CSE@2025" value={hodPin}
                className="input-glass rounded-xl h-11"
                onChange={e => { setHodPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleHodLogin()} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button onClick={handleHodLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white btn-gradient-indigo disabled:opacity-50">
              {loading ? "Verifying…" : <>Login as HOD <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Administrator Login</DialogTitle>
            <DialogDescription>Enter the system administrator password for full access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="adminPass" className={modalLabelClass}>Admin Password</Label>
              <Input id="adminPass" type="password" placeholder="••••••••" value={adminPass}
                className="input-glass rounded-xl h-11"
                onChange={e => { setAdminPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
