import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { BookOpen, LayoutDashboard, LineChart, Users, Building, Calendar, List, MessageSquare } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: BookOpen },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Departments", href: "/departments", icon: Building },
    { name: "Faculty", href: "/faculty", icon: Users },
    { name: "Courses", href: "/courses", icon: List },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Windows", href: "/windows", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-lg z-10 hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold tracking-tight">BPUT Feedback</h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Manager Portal</p>
        </div>
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
          Biju Patnaik University of Technology
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <div className="font-bold">BPUT Feedback</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
             {navigation.map(item => (
                <Link key={item.name} href={item.href} className="px-2 py-1 bg-sidebar-accent rounded text-xs whitespace-nowrap">
                  {item.name}
                </Link>
             ))}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
