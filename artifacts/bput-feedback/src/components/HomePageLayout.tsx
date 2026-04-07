import { ReactNode } from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import {
  Sun, Moon, Globe, Phone, Mail, MapPin,
  GraduationCap, ExternalLink, LogOut, ChevronRight
} from "lucide-react";
import { CupgsLogo } from "@/components/CupgsLogo";
import { BackgroundSlideshow } from "@/components/BackgroundSlideshow";

function ThemeToggleBtn() {
  const { isDark, toggleTheme } = useTheme();
  const [key, setKey] = useState(0);
  return (
    <button
      key={key}
      onClick={() => { setKey(k => k + 1); toggleTheme(); }}
      className="theme-toggle animate-theme-pop"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export function HomePageLayout({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  const { role, faculty, hod, student, logout } = useRole();

  const getUserLabel = () => {
    if (role === "faculty" && faculty) return `${faculty.name} (Faculty)`;
    if (role === "hod" && hod) return `${hod.hodName} (HOD)`;
    if (role === "student" && student) return `Roll: ${student.rollNumber}`;
    if (role === "admin") return "Administrator";
    return null;
  };
  const userLabel = getUserLabel();

  return (
    <div className="min-h-screen flex flex-col relative">
      <BackgroundSlideshow />
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob-light bg-blob-light-1" />
      <div className="bg-blob-light bg-blob-light-2" />

      {/* ══════════ BPUT OFFICIAL HEADER ══════════ */}
      <header className="relative z-30">
        {/* Top utility bar */}
        <div
          className="text-xs"
          style={{
            background: "rgba(255, 255, 255, 0)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: "0 0 30px 0px rgba(0,0,0,0.3)",
          }}
        >
          <div className="w-full px-4 md:px-10 xl:px-16 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white/50">
              <a href="https://www.bput.ac.in" target="_blank" rel="noreferrer"
                className="hover:text-white/80 transition-colors flex items-center gap-1">
                <Globe className="w-3 h-3" /> www.bput.ac.in
              </a>
              <span className="hidden sm:flex items-center gap-1">
                <Phone className="w-3 h-3" /> (0661) 2482556
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/50">
              <a href="https://results.bput.ac.in" target="_blank" rel="noreferrer"
                className="hover:text-white/80 transition-colors hidden sm:inline">Results Portal</a>
              <span className="hidden sm:inline">|</span>
              <a href="https://www.bput.ac.in/page.php?purl=cupgs" target="_blank" rel="noreferrer"
                className="hover:text-white/80 transition-colors">CUPGS Official</a>
            </div>
          </div>
        </div>

        {/* Main header — BPUT branding */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: "0 0 30px 0px rgba(0,0,0,0.3)",
          }}
        >
          <div className="w-full px-4 md:px-10 xl:px-16 py-3 flex items-center gap-4">
            {/* BPUT Official Logo */}
            <a href="https://www.bput.ac.in" target="_blank" rel="noreferrer" className="flex-shrink-0">
              <img
                src="https://www.bput.ac.in/asset/images/logo/bput-logo.png"
                alt="BPUT Logo"
                className="h-14 w-auto drop-shadow-lg"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </a>

            {/* University name */}
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-white leading-tight tracking-tight text-base md:text-lg">
                Biju Patnaik University of Technology
              </h1>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(196,181,253,0.7)" }}>
                CUPGS — Centre for UG &amp; PG Studies, Rourkela, Odisha
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
                  <GraduationCap className="w-2.5 h-2.5" /> Academic Feedback System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live · 2024–25
                </span>
              </div>
            </div>

            {/* CUPGS Logo + Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex flex-col items-center gap-1">
                <CupgsLogo size={44} className="drop-shadow-xl" />
                <span className="text-[9px] font-bold tracking-wider" style={{ color: "rgba(196,181,253,0.5)" }}>CUPGS</span>
              </div>
              <div className="flex items-center gap-2">
                {userLabel && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}>
                    <span className="truncate max-w-[140px]">{userLabel}</span>
                    <button onClick={logout} className="hover:text-white transition-colors" title="Sign out">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <ThemeToggleBtn />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav
          style={{
            background: isDark
              ? "rgba(139,92,246,0.08)"
              : "rgba(109,40,217,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            boxShadow: "0 0 30px 0px rgba(0,0,0,0.3)",
          }}
        >
          <div className="w-full px-4 md:px-10 xl:px-16">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              {[
                { label: "Home", href: "/" },
                { label: "Submit Feedback", href: "/submit-feedback" },
                { label: "About BPUT", href: "https://www.bput.ac.in/history.html", ext: true },
                { label: "Academic Calendar", href: "https://www.bput.ac.in/academic-calendar.html", ext: true },
                { label: "Results", href: "https://results.bput.ac.in", ext: true },
                { label: "Contact", href: "#bput-footer" },
              ].map(item => (
                item.ext ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/65 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">
                    {item.label}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                )
              ))}
              <div className="ml-auto flex-shrink-0">
                {userLabel && (
                  <button onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all md:hidden">
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 relative z-10">
        <div className="w-full px-4 md:px-10 xl:px-16 py-8 pb-12">
          {children}
        </div>
      </main>

      {/* ══════════ BPUT OFFICIAL FOOTER ══════════ */}
      <footer id="bput-footer" className="relative z-10 mt-auto"
        style={{
          background: "#000000",
        }}>
        <div className="w-full px-4 md:px-10 xl:px-16 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Col 1: Logo + About */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://www.bput.ac.in/asset/images/logo/bput-logo.png"
                  alt="BPUT" className="h-12 w-auto drop-shadow"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div>
                  <div className="text-white font-bold text-sm">Biju Patnaik University of Technology</div>
                  <div className="text-[11px]" style={{ color: "rgba(196,181,253,0.55)" }}>State University, Odisha • Est. 2002</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                BPUT is one of the largest technical universities in India with 200+ affiliated colleges
                across Odisha. CUPGS is the in-campus college of the university, offering B.Tech, MBA, MCA,
                M.Tech &amp; MBA programs at Rourkela.
              </p>
              <div className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-violet-400" />
                <span>Chhend Colony, Rourkela, Odisha – 769015</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
                <span>(0661) 2482556</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(196,181,253,0.7)" }}>Quick Links</h3>
              <ul className="space-y-2">
                {[
                  ["BPUT Official", "https://www.bput.ac.in"],
                  ["Examination Results", "https://results.bput.ac.in"],
                  ["CUPGS Page", "https://www.bput.ac.in/page.php?purl=cupgs"],
                  ["Academic Calendar", "https://www.bput.ac.in/academic-calendar.html"],
                  ["NIRF Rankings", "https://www.bput.ac.in"],
                  ["Ph.D. Programs", "https://www.bput.ac.in/phd.html"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer"
                      className="text-xs flex items-center gap-1.5 transition-colors hover:text-violet-300"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      <ChevronRight className="w-3 h-3 text-violet-500 flex-shrink-0" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Feedback System */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(196,181,253,0.7)" }}>Feedback System</h3>
              <ul className="space-y-2">
                {[
                  ["Submit Feedback", "/submit-feedback"],
                  ["Faculty Login", "/"],
                  ["HOD Dashboard", "/hod-dashboard"],
                  ["Admin Panel", "/dashboard"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href}>
                      <span className="text-xs flex items-center gap-1.5 cursor-pointer transition-colors hover:text-violet-300" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <ChevronRight className="w-3 h-3 text-violet-500 flex-shrink-0" />
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.1)" }}>
                <div className="text-[10px] font-semibold text-violet-300 mb-1">CUPGS Feedback Manager</div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Secure · Anonymous · Real-time Analytics
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "transparent" }}>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2025 Biju Patnaik University of Technology, Rourkela. All Rights Reserved.
            </div>
            <div className="text-[11px]" style={{ color: "rgba(139,92,246,0.6)" }}>
              CUPGS Feedback Management System · Academic Year 2024–25
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
