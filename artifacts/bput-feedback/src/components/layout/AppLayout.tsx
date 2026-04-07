import { Link, useLocation } from "wouter";
import { ReactNode, useState } from "react";
import {
  BookOpen, LayoutDashboard, LineChart, Users, Building,
  Calendar, List, MessageSquare, GraduationCap, LogOut,
  ShieldCheck, Briefcase, Building2, FileDown, Home,
  Sun, Moon, Zap, FileText
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { usePlatform } from "@/hooks/usePlatform";
import { useTheme } from "@/contexts/ThemeContext";
import { CupgsLogo } from "@/components/CupgsLogo";
import { BackgroundSlideshow } from "@/components/BackgroundSlideshow";
import { ComplaintNotifications } from "@/components/ComplaintNotifications";

type NavItem = { name: string; href: string; icon: React.ElementType };

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { role, faculty, hod, student, logout } = useRole();
  const { isMobile, isIOS } = usePlatform();
  const { theme, toggleTheme, isDark } = useTheme();
  const [iconKey, setIconKey] = useState(0);

  const handleToggle = () => {
    setIconKey(k => k + 1);
    toggleTheme();
  };

  const guestNav: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Feedback", href: "/submit-feedback", icon: MessageSquare },
    { name: "Complaint Box", href: "/complaint-box", icon: FileText },
  ];
  const studentNav: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Feedback", href: "/submit-feedback", icon: MessageSquare },
    { name: "Complaint Box", href: "/complaint-box", icon: FileText },
  ];
  const facultyNav: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/faculty-portal", icon: Briefcase },
  ];
  const hodNav: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Analytics", href: "/hod-dashboard", icon: Building2 },
    { name: "Complaints", href: "/complaints", icon: FileText },
  ];
  const adminNav: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Reports", href: "/reports", icon: FileDown },
    { name: "Complaints", href: "/complaints", icon: FileText },
    { name: "Departments", href: "/departments", icon: Building },
    { name: "Faculty", href: "/faculty", icon: Users },
    { name: "Courses", href: "/courses", icon: List },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Windows", href: "/windows", icon: Calendar },
  ];

  const navigation =
    role === "admin" ? adminNav :
    role === "faculty" ? facultyNav :
    role === "hod" ? hodNav :
    role === "student" ? studentNav :
    guestNav;

  const mobileBottomNav = navigation.slice(0, 5);

  const getRoleAvatar = () => {
    if (role === "hod" && hod)
      return { initials: hod.code, color: "from-violet-500 to-purple-700", name: hod.hodName, sub: `HOD — ${hod.name}`, id: hod.hodEmployeeId, accent: "rgba(139,92,246,0.25)" };
    if (role === "faculty" && faculty)
      return { initials: faculty.name.charAt(0), color: "from-emerald-500 to-teal-700", name: faculty.name, sub: faculty.designation, id: `${faculty.departmentCode} | ${faculty.employeeId}`, accent: "rgba(16,185,129,0.22)" };
    if (role === "student" && student)
      return { initials: "S", color: "from-blue-500 to-blue-700", name: "Student", sub: student.rollNumber, id: student.departmentCode || "", accent: "rgba(59,130,246,0.22)" };
    if (role === "admin")
      return { initials: "A", color: "from-rose-500 to-rose-700", name: "Administrator", sub: "Full Access", id: "", accent: "rgba(244,63,94,0.22)" };
    return null;
  };

  const avatar = getRoleAvatar();

  const ThemeToggle = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <button
      key={iconKey}
      onClick={handleToggle}
      className={`theme-toggle animate-theme-pop ${size === "sm" ? "!w-8 !h-8 !rounded-lg" : ""}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark
        ? <Sun className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        : <Moon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      }
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <BackgroundSlideshow />
      {/* Dark-only floating blobs */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      {/* Light-only soft blobs */}
      <div className="bg-blob-light bg-blob-light-1" />
      <div className="bg-blob-light bg-blob-light-2" />

      {/* ── Desktop Sidebar ── */}
      <div className="w-full md:w-64 flex flex-col z-10 hidden md:flex relative"
        style={{
          background: "rgba(255,255,255,0)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "0 28px 28px 0",
          boxShadow: "4px 0 30px rgba(0,0,0,0.25)",
        }}>

        {/* Sidebar inner glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: "0 28px 28px 0" }}>
          <div style={{
            position: "absolute", top: -60, left: -40,
            width: 220, height: 220,
            background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)",
            filter: "blur(30px)",
          }} />
        </div>

        {/* Logo row */}
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-3 relative">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-lg opacity-60"
              style={{ background: "rgba(139,92,246,0.5)" }} />
            <CupgsLogo size={38} className="flex-shrink-0 relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">CUPGS Feedback</h1>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(196,181,253,0.5)" }}>Academic Feedback System</p>
          </div>
          <ComplaintNotifications />
          <ThemeToggle />
        </div>

        {/* Session badge */}
        {avatar && (
          <div className="mx-3 mt-3 mb-1 p-3 rounded-xl animate-fade-in relative overflow-hidden"
            style={{
              background: `rgba(255, 255, 255, 0)`,
              backdropFilter: "blur(6px)",
              boxShadow: `0 0 20px ${avatar.accent}`
            }}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0`}>
                {avatar.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{avatar.name}</div>
                <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{avatar.sub}</div>
              </div>
            </div>
            {avatar.id && <div className="text-[10px] mt-1.5 font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{avatar.id}</div>}
            <button
              onClick={logout}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.85)"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.target as HTMLElement).style.background = "transparent"; }}
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item, i) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-nav-in glass-nav-item ${
                  isActive ? "active text-white" : "text-white/50 hover:text-white"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <item.icon
                  className={`flex-shrink-0 ${isActive ? "text-violet-300" : ""}`}
                  style={{ width: "1.05rem", height: "1.05rem" }}
                />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" style={{ boxShadow: "0 0 6px rgba(139,92,246,0.8)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-white/[0.05]" style={{ background: "#000000" }}>
          <div className="flex items-center gap-2 justify-center">
            <Zap className="w-2.5 h-2.5" style={{ color: "rgba(139,92,246,0.5)" }} />
            <span className="text-[10px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
              CUPGS · BPUT Rourkela
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden sticky top-0 z-30 glass-strong border-b">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <CupgsLogo size={28} className="flex-shrink-0" />
            <span className="font-extrabold text-sm text-foreground tracking-tight">CUPGS Feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <ComplaintNotifications />
            <ThemeToggle size="sm" />
            {avatar && (
              <>
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold shadow`}>
                  {avatar.initials}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg glass text-foreground/60 hover:text-foreground transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 mobile-content ${isMobile ? "pb-24" : ""}`}>
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t ${isIOS ? "safe-area-bottom" : ""}`}
        style={{ paddingBottom: isIOS ? "env(safe-area-inset-bottom, 0px)" : undefined }}
      >
        <div className="flex items-stretch">
          {mobileBottomNav.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 min-h-[56px] transition-all duration-200 ${
                  isActive ? "text-violet-500" : "text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <div className={`relative ${isActive ? "animate-pulse-ring rounded-full" : ""}`}>
                  <item.icon className="w-5 h-5" />
                  {isActive && <div className="absolute inset-0 rounded-full scale-150 blur-sm" style={{ background: "rgba(139,92,246,0.25)" }} />}
                </div>
                <span className={`text-[10px] font-medium leading-tight ${isActive ? "text-violet-500" : ""}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          {role !== "guest" && (
            <button
              onClick={logout}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 min-h-[56px] text-foreground/35 hover:text-foreground/60 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
