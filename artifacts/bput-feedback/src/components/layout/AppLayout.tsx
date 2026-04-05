import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import {
  BookOpen, LayoutDashboard, LineChart, Users, Building,
  Calendar, List, MessageSquare, GraduationCap, LogOut,
  ShieldCheck, Briefcase, Building2, FileDown
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";

type NavItem = { name: string; href: string; icon: React.ElementType };

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { role, faculty, hod, student, logout } = useRole();

  const guestNav: NavItem[] = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "Submit Feedback", href: "/submit-feedback", icon: MessageSquare },
  ];

  const studentNav: NavItem[] = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "Submit Feedback", href: "/submit-feedback", icon: MessageSquare },
  ];

  const facultyNav: NavItem[] = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "My Dashboard", href: "/faculty-portal", icon: Briefcase },
  ];

  const hodNav: NavItem[] = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "HOD Dashboard", href: "/hod-dashboard", icon: Building2 },
  ];

  const adminNav: NavItem[] = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Reports", href: "/reports", icon: FileDown },
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

  const renderSessionBadge = () => {
    if (role === "hod" && hod) {
      return (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {hod.code}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{hod.hodName}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">HOD — {hod.name}</div>
            </div>
          </div>
          <div className="text-xs text-sidebar-foreground/50 mb-2">{hod.hodEmployeeId}</div>
          <Button size="sm" variant="ghost" className="w-full h-7 text-xs gap-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      );
    }
    if (role === "faculty" && faculty) {
      return (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {faculty.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{faculty.name}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">{faculty.designation}</div>
            </div>
          </div>
          <div className="text-xs text-sidebar-foreground/50 mb-2">{faculty.departmentCode} | {faculty.employeeId}</div>
          <Button size="sm" variant="ghost" className="w-full h-7 text-xs gap-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      );
    }
    if (role === "student" && student) {
      return (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold">Student</div>
              <div className="text-xs text-sidebar-foreground/60">{student.rollNumber}</div>
              {student.departmentCode && <div className="text-xs text-sidebar-foreground/50">{student.departmentCode}</div>}
            </div>
          </div>
          <Button size="sm" variant="ghost" className="w-full h-7 text-xs gap-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      );
    }
    if (role === "admin") {
      return (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold">Administrator</div>
              <div className="text-xs text-sidebar-foreground/60">Full Access</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="w-full h-7 text-xs gap-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-lg z-10 hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold tracking-tight">CUPGS Feedback</h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Academic Feedback System</p>
        </div>

        {renderSessionBadge()}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
          Centre for UG & PG Studies (CUPGS), BPUT
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <div className="font-bold">CUPGS Feedback</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navigation.map(item => (
              <Link key={item.name} href={item.href} className="px-2 py-1 bg-sidebar-accent rounded text-xs whitespace-nowrap">
                {item.name}
              </Link>
            ))}
            {role !== "guest" && (
              <button onClick={logout} className="px-2 py-1 bg-sidebar-accent/60 rounded text-xs whitespace-nowrap flex items-center gap-1">
                <LogOut className="w-3 h-3" /> Out
              </button>
            )}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
