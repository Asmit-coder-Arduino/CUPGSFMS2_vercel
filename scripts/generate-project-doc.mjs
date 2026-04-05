import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../exports/docs");
mkdirSync(OUT, { recursive: true });

const W = 1240, H = 1754;
const PRI = "#1e3a8a", SEC = "#0f172a", ACC = "#2563eb", GRN = "#14532d";
const LIGHT = "#f0f4ff", MID = "#dbeafe", MUTED = "#64748b";

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length <= maxChars) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function textBlock(x, y, text, { fontSize = 13, fill = SEC, maxChars = 95, lineH = 22 } = {}) {
  const lines = wrapText(text, maxChars);
  return lines.map((l, i) =>
    `<text x="${x}" y="${y + i * lineH}" font-size="${fontSize}" fill="${fill}">${l}</text>`
  ).join("\n");
}

function heading(x, y, num, title) {
  return `
  <rect x="${x}" y="${y}" width="1160" height="36" rx="4" fill="${PRI}"/>
  <text x="${x + 16}" y="${y + 24}" font-size="16" font-weight="800" fill="white">${num}. ${title}</text>`;
}

function bullet(x, y, text, color = ACC) {
  const lines = wrapText(text, 90);
  let out = `<circle cx="${x + 8}" cy="${y - 4}" r="4" fill="${color}"/>`;
  lines.forEach((l, i) => {
    out += `<text x="${x + 20}" y="${y + i * 20}" font-size="12" fill="${SEC}">${l}</text>`;
  });
  return { svg: out, height: lines.length * 20 + 4 };
}

function bullets(x, startY, items, color = ACC) {
  let y = startY, out = "";
  for (const item of items) {
    const b = bullet(x, y, item, color);
    out += b.svg;
    y += b.height + 8;
  }
  return { svg: out, bottom: y };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function page1() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="55%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1100" cy="150" r="280" fill="#ffffff08"/>
  <circle cx="1000" cy="200" r="180" fill="#ffffff05"/>
  <circle cx="140"  cy="1600" r="220" fill="#ffffff06"/>
  <rect x="0" y="0" width="${W}" height="8" fill="#3b82f6"/>

  <!-- College Badge -->
  <rect x="520" y="100" width="200" height="200" rx="100" fill="#1d4ed8" stroke="#60a5fa" stroke-width="3"/>
  <text x="620" y="170" text-anchor="middle" font-size="48" font-weight="900" fill="white">B</text>
  <text x="620" y="220" text-anchor="middle" font-size="18" font-weight="700" fill="#bfdbfe">PUT</text>
  <text x="620" y="244" text-anchor="middle" font-size="11" fill="#93c5fd">ROURKELA</text>

  <!-- Title -->
  <text x="620" y="380" text-anchor="middle" font-size="13" fill="#93c5fd" font-weight="600" letter-spacing="4">PROJECT DOCUMENTATION REPORT</text>
  <rect x="200" y="398" width="840" height="3" fill="#3b82f6" rx="2"/>
  <text x="620" y="464" text-anchor="middle" font-size="36" font-weight="900" fill="white">CUPGS Academic</text>
  <text x="620" y="512" text-anchor="middle" font-size="36" font-weight="900" fill="white">Feedback Manager</text>
  <rect x="200" y="530" width="840" height="3" fill="#3b82f6" rx="2"/>
  <text x="620" y="564" text-anchor="middle" font-size="15" fill="#bfdbfe">Anonymous Student Feedback System</text>
  <text x="620" y="588" text-anchor="middle" font-size="15" fill="#bfdbfe">with Role-Based Access Control</text>

  <!-- Info Cards -->
  <rect x="120" y="640" width="460" height="120" rx="10" fill="#ffffff15" stroke="#3b82f690" stroke-width="1"/>
  <text x="350" y="672" text-anchor="middle" font-size="11" fill="#93c5fd" font-weight="700">INSTITUTION</text>
  <text x="350" y="696" text-anchor="middle" font-size="16" font-weight="700" fill="white">Centre for Urban &amp; Planning</text>
  <text x="350" y="718" text-anchor="middle" font-size="15" fill="white">Graduate Studies (CUPGS)</text>
  <text x="350" y="742" text-anchor="middle" font-size="13" fill="#bfdbfe">BPUT Rourkela, Odisha</text>

  <rect x="660" y="640" width="460" height="120" rx="10" fill="#ffffff15" stroke="#3b82f690" stroke-width="1"/>
  <text x="890" y="672" text-anchor="middle" font-size="11" fill="#93c5fd" font-weight="700">SYSTEM TYPE</text>
  <text x="890" y="696" text-anchor="middle" font-size="16" font-weight="700" fill="white">Full-Stack Web Application</text>
  <text x="890" y="718" text-anchor="middle" font-size="15" fill="white">Progressive Web App (PWA)</text>
  <text x="890" y="742" text-anchor="middle" font-size="13" fill="#bfdbfe">Cross-Platform + Dark Theme</text>

  <!-- Tech Stack Pills -->
  <text x="620" y="810" text-anchor="middle" font-size="12" fill="#93c5fd" font-weight="600">TECHNOLOGY STACK</text>
  ${["React 18", "TypeScript", "Node.js", "Express", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "jsPDF"].map((t, i) => {
    const cols = 4, row = Math.floor(i / cols), col = i % cols;
    const bx = 155 + col * 240, by = 828 + row * 48;
    return `<rect x="${bx}" y="${by}" width="200" height="34" rx="17" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1"/>
    <text x="${bx+100}" y="${by+22}" text-anchor="middle" font-size="12" font-weight="600" fill="white">${t}</text>`;
  }).join("")}

  <rect x="120" y="980" width="1000" height="1" fill="#3b82f650"/>
  <text x="620" y="1010" text-anchor="middle" font-size="12" fill="#64748b">Academic Year 2024-25  |  Version 1.0  |  Confidential</text>

  <!-- Departments -->
  <text x="620" y="1068" text-anchor="middle" font-size="13" fill="#93c5fd" font-weight="600">ENGINEERING DEPARTMENTS COVERED</text>
  ${[
    "Computer Science &amp; Engineering (CSE)",
    "Electronics &amp; Communication Engineering (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
  ].map((d, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = col === 0 ? 200 : 660, by = 1086 + row * 46;
    const w = col === 0 && i === 4 ? 840 : 380;
    const cx = col === 0 && i === 4 ? 620 : bx + w/2;
    return `<rect x="${col === 0 && i === 4 ? 200 : bx}" y="${by}" width="${w}" height="34" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1"/>
    <text x="${cx}" y="${by+22}" text-anchor="middle" font-size="11" fill="white">${d}</text>`;
  }).join("")}

  <!-- Table of Contents -->
  <rect x="120" y="1274" width="1000" height="380" rx="10" fill="#ffffff10" stroke="#3b82f640" stroke-width="1"/>
  <text x="620" y="1308" text-anchor="middle" font-size="15" font-weight="700" fill="#60a5fa">TABLE OF CONTENTS</text>
  ${[
    ["1. Project Overview &amp; Objectives",      "Page 2"],
    ["2. Problem Statement &amp; Solution",        "Page 3"],
    ["3. System Architecture &amp; Features",      "Page 4"],
    ["4. User Roles &amp; Access Control",         "Page 5"],
    ["5. Module-wise Explanation",                 "Page 6"],
    ["6. Technology Stack &amp; Design",           "Page 7"],
    ["7. How To Use The System",                   "Page 8"],
    ["8. Data Flow &amp; Security",                "Page 9"],
    ["9. Summary &amp; Future Scope",              "Page 10"],
  ].map(([t, p], i) => {
    const y = 1334 + i * 32;
    return `<text x="160" y="${y}" font-size="13" fill="#bfdbfe">${t}</text>
    <text x="1080" y="${y}" text-anchor="end" font-size="13" fill="#60a5fa" font-weight="600">${p}</text>
    <line x1="160" y1="${y+6}" x2="1080" y2="${y+6}" stroke="#3b82f620" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  }).join("")}

  <!-- Footer -->
  <rect x="0" y="${H-48}" width="${W}" height="48" fill="#0f172a"/>
  <text x="620" y="${H-20}" text-anchor="middle" font-size="11" fill="#475569">CUPGS Feedback Management System  |  Project Documentation  |  BPUT Rourkela</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — Project Overview & Objectives
// ═══════════════════════════════════════════════════════════════════════════════
function page2() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">1. Project Overview &amp; Objectives</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 2 of 10</text>

  <!-- Overview -->
  <rect x="40" y="92" width="1160" height="110" rx="8" fill="${LIGHT}" stroke="${MID}" stroke-width="1.5"/>
  <text x="60" y="118" font-size="14" font-weight="800" fill="${PRI}">What is CUPGS Feedback Manager?</text>
  ${textBlock(60, 135, "CUPGS Feedback Manager is a full-stack web application designed exclusively for the Centre for Urban and Planning Graduate Studies (CUPGS) at BPUT Rourkela. It enables students to submit anonymous feedback on courses and faculty, while providing Heads of Departments (HODs) with a real-time analytics dashboard and one-click PDF reports. The system enforces strict role-based access and anonymity guarantees.", { fontSize: 12, maxChars: 115, lineH: 21 })}

  <!-- 3 columns -->
  <rect x="40"  y="216" width="368" height="220" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
  <rect x="436" y="216" width="368" height="220" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
  <rect x="832" y="216" width="368" height="220" rx="8" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="1.5"/>

  <text x="224"  y="246" text-anchor="middle" font-size="13" font-weight="800" fill="${ACC}">WHAT IT IS</text>
  <text x="620"  y="246" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">WHO USES IT</text>
  <text x="1016" y="246" text-anchor="middle" font-size="13" font-weight="800" fill="#7c3aed">WHY IT WAS BUILT</text>

  ${bullets(56, 260, ["Anonymous digital feedback system", "Drag-based half-star ratings (0.5 steps)", "HOD-customizable question forms", "Real-time analytics dashboard", "One-click PDF report generation", "Role-based access control (4 roles)"], ACC).svg}
  ${bullets(452, 260, ["Students — submit course feedback", "Faculty — view own performance data", "HOD — analytics + form customization", "Admin — institution-wide management"], GRN).svg}
  ${bullets(848, 260, ["Replace paper-based feedback system", "Guarantee student anonymity", "Give HOD real-time actionable data", "Track faculty performance over time", "Improve transparency and trust"], "#7c3aed").svg}

  ${heading(40, 450, "1.1", "Core Objectives")}
  <rect x="40" y="490" width="1160" height="380" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["Anonymous Feedback System", "Students submit feedback without revealing their identity. A unique Reference ID (FB-YYYYMMDD-XXXXXX) is issued per submission. Faculty and HODs cannot identify which student gave which rating."],
    ["Half-Star Drag Rating", "5 rating categories: Teaching Quality, Course Content, Lab Facilities, Study Material, and Overall. Each rated 0.5 to 5.0 in 0.5 increments using a drag interaction. Works on mouse and touch."],
    ["HOD Analytics Dashboard", "HOD sees department-wide analytics: total feedback count, average ratings per course, category breakdowns, top and bottom performing courses, and a downloadable PDF report."],
    ["Customizable Feedback Forms", "HOD can add custom questions (text, rating, or multiple-choice) to their department's feedback form from within the dashboard. No developer required."],
    ["Faculty-Course Integrity Check", "The system verifies that a student can only rate a course that belongs to their department and that the feedback references a validly assigned faculty member, preventing cross-department manipulation."],
    ["Admin-Controlled Feedback Windows", "Admin creates time-bound feedback windows (with start and end dates). Students can only submit feedback when an active window is open. Windows can be global or department-specific."],
  ].map(([title, desc], i) => {
    const y = 500 + i * 62;
    return `<line x1="40" y1="${y}" x2="1200" y2="${y}" stroke="#e5e7eb" stroke-width="${i === 0 ? 0 : 0.8}"/>
    <text x="64" y="${y+18}" font-size="13" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(64, y+32, desc, { fontSize: 11, fill: MUTED, maxChars: 112, lineH: 17 })}`;
  }).join("")}

  ${heading(40, 882, "1.2", "System Scope")}
  <rect x="40" y="922" width="1160" height="130" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  <text x="60" y="946" font-size="13" font-weight="700" fill="${PRI}">IN SCOPE:</text>
  ${bullets(60, 958, ["5 Engineering departments: CSE, ECE, EE, ME, CE", "Odd semester (July-October) and Even semester (November-June) feedback", "Academic year auto-detection based on current month (April = new year)", "Full audit trail via Reference IDs, no personally identifiable information stored"], ACC).svg}
  <text x="660" y="946" font-size="13" font-weight="700" fill="#dc2626">OUT OF SCOPE:</text>
  ${bullets(660, 958, ["Examination or results management", "Attendance and fee management", "Hostel or library systems", "External university integrations"], "#dc2626").svg}

  ${heading(40, 1064, "1.3", "Key Metrics")}
  ${[
    ["268+", "Total Courses", "#1e3a8a"],
    ["5",    "Departments",   "#065f46"],
    ["4",    "User Roles",    "#7c2d12"],
    ["5",    "Rating Cats.",  "#4c1d95"],
    ["100%", "Anonymous",     "#0c4a6e"],
    ["0.5",  "Rating Step",   "#7c3aed"],
  ].map(([val, label, color], i) => {
    const x = 40 + i * 196;
    return `<rect x="${x}" y="1104" width="180" height="90" rx="8" fill="${color}"/>
    <text x="${x+90}" y="1154" text-anchor="middle" font-size="28" font-weight="900" fill="white">${val}</text>
    <text x="${x+90}" y="1180" text-anchor="middle" font-size="11" fill="#ffffff99">${label}</text>`;
  }).join("")}

  ${heading(40, 1208, "1.4", "Login Credentials &amp; Academic Context")}
  <rect x="40" y="1248" width="1160" height="440" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>

  <text x="60" y="1274" font-size="13" font-weight="700" fill="${PRI}">Login Credential Formats:</text>
  ${[
    ["Student",  "CUPGS/DEPT/NNN (e.g. CUPGS/CSE/042)",  "4-digit PIN (default: 1234)",          "#1e3a8a"],
    ["Faculty",  "CUPGS/DEPT/NNN (e.g. CUPGS/CSE/101)",  "4-digit PIN",                           "#4c1d95"],
    ["HOD",      "HOD/DEPT/001 (e.g. HOD/CSE/001)",       "DEPT@2025 (e.g. CSE@2025)",            "#065f46"],
    ["Admin",    "bput@admin2025",                          "Admin password",                       "#7c2d12"],
  ].map(([role, fmt, pin, color], i) => {
    const y = 1286 + i * 50;
    return `<rect x="60" y="${y}" width="100" height="34" rx="4" fill="${color}"/>
    <text x="110" y="${y+21}" text-anchor="middle" font-size="12" font-weight="700" fill="white">${role}</text>
    <text x="175" y="${y+21}" font-size="12" fill="${SEC}">Login ID: <tspan font-weight="600">${fmt}</tspan></text>
    <text x="860" y="${y+21}" font-size="12" fill="${MUTED}">Password: <tspan font-weight="600" fill="${SEC}">${pin}</tspan></text>`;
  }).join("")}

  <line x1="56" y1="1490" x2="1184" y2="1490" stroke="#e5e7eb" stroke-width="1"/>
  <text x="60" y="1514" font-size="13" font-weight="700" fill="${PRI}">Semester System:</text>
  <rect x="60" y="1522" width="520" height="52" rx="6" fill="${LIGHT}" stroke="${MID}" stroke-width="1"/>
  <text x="72" y="1542" font-size="12" font-weight="600" fill="${ACC}">ODD Semester (July - October)</text>
  <text x="72" y="1560" font-size="11" fill="${MUTED}">1st, 3rd, 5th, 7th semester courses. Feedback window opens in October.</text>
  <rect x="620" y="1522" width="560" height="52" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
  <text x="632" y="1542" font-size="12" font-weight="600" fill="${GRN}">EVEN Semester (November - June)</text>
  <text x="632" y="1560" font-size="11" fill="${MUTED}">2nd, 4th, 6th, 8th semester courses. Feedback window opens in June.</text>

  <text x="60" y="1598" font-size="13" font-weight="700" fill="${PRI}">Academic Year Calculation:</text>
  <rect x="60" y="1606" width="1100" height="48" rx="6" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>
  <text x="80" y="1626" font-size="12" fill="#92400e">If current month is April or later (month &gt;= 4): Academic Year = currentYear-(currentYear+1)  e.g., 2025-26</text>
  <text x="80" y="1644" font-size="12" fill="#92400e">If current month is before April (Jan-Mar): Academic Year = (currentYear-1)-currentYear  e.g., 2024-25</text>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">2 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — Problem Statement & Solution
// ═══════════════════════════════════════════════════════════════════════════════
function page3() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">2. Problem Statement &amp; Solution Approach</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 3 of 10</text>

  ${heading(40, 88, "2.1", "Problem Statement")}
  <rect x="40" y="128" width="1160" height="180" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1.5"/>
  <text x="60" y="156" font-size="14" font-weight="800" fill="#dc2626">Existing Problems at CUPGS Before This System:</text>
  ${bullets(60, 172, [
    "Paper-based feedback forms were time-consuming to distribute, collect, and manually aggregate",
    "Students had no anonymity guarantee on paper — fear of identification led to dishonest or skipped responses",
    "HODs had to spend weeks manually tallying ratings and summarizing results — no real-time insight",
    "No course-by-course or category-by-category comparison was possible — no trend data across semesters",
    "One standardized form for all departments — HODs could not add department-specific custom questions",
    "No control over when feedback could be submitted — open to abuse outside the intended feedback period",
  ], "#dc2626").svg}

  ${heading(40, 322, "2.2", "How CUPGS Feedback Manager Solves Each Problem")}

  ${[
    {
      problem: "Paper forms — no digitization",
      solution: "100% digital web-based form submission, stored instantly in PostgreSQL, accessible from any device",
      color: "#dcfce7", border: "#86efac"
    },
    {
      problem: "No anonymity — fear of identification",
      solution: "Reference ID system: only the student knows their code. Faculty and HODs cannot link a rating to a student",
      color: "#eff6ff", border: "#bfdbfe"
    },
    {
      problem: "Manual aggregation takes weeks",
      solution: "Real-time HOD dashboard with department analytics. One-click PDF report generation for download",
      color: "#fdf4ff", border: "#e9d5ff"
    },
    {
      problem: "No course-wise comparison possible",
      solution: "Per-course rating breakdown across 5 categories with averages, sorting, and semester history",
      color: "#fff7ed", border: "#fed7aa"
    },
    {
      problem: "One standard form for all departments",
      solution: "HOD form builder lets each HOD add custom text, rating, or multiple-choice questions for their dept",
      color: "#f0fdf4", border: "#bbf7d0"
    },
    {
      problem: "No control over submission timing",
      solution: "Admin creates time-bound feedback windows with start and end dates. Students cannot submit outside windows",
      color: "#fefce8", border: "#fef08a"
    },
  ].map(({ problem, solution, color, border }, i) => {
    const y = 366 + i * 98;
    return `<rect x="40" y="${y}" width="565" height="84" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
    <text x="60" y="${y+22}" font-size="12" font-weight="700" fill="#dc2626">PROBLEM ${i+1}:</text>
    ${textBlock(60, y+36, problem, { fontSize: 12, fill: "#dc2626", maxChars: 58, lineH: 18 })}
    <text x="620" y="${y+10}" text-anchor="middle" font-size="20" fill="${MUTED}">-&gt;</text>
    <rect x="645" y="${y}" width="555" height="84" rx="6" fill="${color}" stroke="${border}" stroke-width="1"/>
    <text x="665" y="${y+22}" font-size="12" font-weight="700" fill="${GRN}">SOLUTION:</text>
    ${textBlock(665, y+36, solution, { fontSize: 12, fill: GRN, maxChars: 57, lineH: 18 })}`;
  }).join("")}

  ${heading(40, 960, "2.3", "Unique Features Not Typically Found in Academic Feedback Systems")}
  <rect x="40" y="1000" width="1160" height="280" rx="6" fill="${LIGHT}" stroke="${MID}" stroke-width="1"/>

  ${[
    ["Half-Star Drag Rating",    "Users drag to set ratings in 0.5 increments (0.5 to 5.0), not just whole numbers. Designed for mouse and touch input. Provides higher data precision than integer-only systems."],
    ["Reference ID Anonymity",   "Each submission receives a unique ID formatted as FB-YYYYMMDD-XXXXXX. Students verify their own response; nobody else can use this ID to trace them. No student ID is ever stored alongside feedback."],
    ["Live HOD Analytics",       "HOD dashboard refreshes in real time. Shows department average, per-course rating comparison by all 5 categories, top and bottom performers, and trend data by semester."],
    ["HOD Form Builder",         "HOD adds or removes custom questions directly from their dashboard. Supported field types: short text, long text, single-choice, and rating scale. Changes apply immediately to the student feedback form."],
    ["Course-Faculty Integrity",  "The server checks that the submitted course belongs to the student's department and that the referenced faculty member is actually assigned to that course, preventing fraudulent cross-department submissions."],
    ["One-Click PDF Report",      "HOD clicks 'Download Report' and receives a fully formatted PDF with college header, semester info, all courses, category ratings table, and averages. Generated entirely client-side using jsPDF."],
  ].map(([title, desc], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 56 + col * 590, y = 1010 + row * 88;
    return `<text x="${x}" y="${y+16}" font-size="13" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(x, y + 32, desc, { fontSize: 11, fill: MUTED, maxChars: 62, lineH: 18 })}`;
  }).join("")}

  ${heading(40, 1296, "2.4", "Feature Comparison: Traditional vs. CUPGS Feedback Manager")}
  <rect x="40" y="1336" width="1160" height="36" rx="4" fill="${PRI}"/>
  <text x="220" y="1359" text-anchor="middle" font-size="12" font-weight="700" fill="white">Feature</text>
  <text x="660" y="1359" text-anchor="middle" font-size="12" font-weight="700" fill="white">Traditional Paper System</text>
  <text x="1040" y="1359" text-anchor="middle" font-size="12" font-weight="700" fill="white">CUPGS Feedback Manager</text>
  <line x1="420" y1="1336" x2="420" y2="${1336+9*38+36}" stroke="#3b82f6" stroke-width="1"/>
  <line x1="840" y1="1336" x2="840" y2="${1336+9*38+36}" stroke="#3b82f6" stroke-width="1"/>

  ${[
    ["Submission Method",    "Physical paper form + pen",           "Digital web form, any device or browser"],
    ["Student Anonymity",    "None — handwriting is recognizable",  "Guaranteed — reference ID only, no name stored"],
    ["Result Availability",  "2-4 weeks of manual counting",        "Instant — real-time dashboard always current"],
    ["Custom Questions",     "Requires reprinting all forms",       "HOD adds in 1 click from the dashboard"],
    ["Rating Granularity",   "1 to 5 whole numbers only",          "0.5 to 5.0 in drag-based half-star steps"],
    ["Report Generation",    "Manual written or typed summary",     "Auto-generated PDF report with one click"],
    ["Access Timing Control","No restriction on timing",            "Admin-controlled windows with start/end dates"],
    ["Data Storage",         "Physical files — risk of loss",       "PostgreSQL database — permanent and queryable"],
    ["Faculty Comparison",   "Difficult, requires manual work",     "Instant side-by-side course and category comparison"],
  ].map(([feat, old, neww], i) => {
    const y = 1372 + i * 38;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="38" fill="${bg}"/>
    <text x="60" y="${y+24}" font-size="11" font-weight="600" fill="${SEC}">${feat}</text>
    <text x="440" y="${y+24}" font-size="11" fill="#dc2626">X  ${old}</text>
    <text x="860" y="${y+24}" font-size="11" fill="${GRN}">OK  ${neww}</text>`;
  }).join("")}
  <rect x="40" y="1336" width="1160" height="${9*38+36}" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">3 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — System Architecture
// ═══════════════════════════════════════════════════════════════════════════════
function page4() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">3. System Architecture &amp; Features</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 4 of 10</text>

  ${heading(40, 88, "3.1", "Three-Tier Architecture")}

  <rect x="40" y="128" width="1160" height="100" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/>
  <rect x="40" y="128" width="8" height="100" rx="4" fill="${ACC}"/>
  <text x="68" y="156" font-size="13" font-weight="800" fill="${ACC}">TIER 1 -- PRESENTATION LAYER (Frontend)</text>
  <text x="68" y="178" font-size="11" fill="${MUTED}">React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui components</text>
  <text x="68" y="196" font-size="11" fill="${MUTED}">Pages: Login  |  Submit Feedback  |  HOD Dashboard  |  Admin Panel  |  Faculty View</text>
  <text x="68" y="214" font-size="11" fill="${MUTED}">PWA: Installable, responsive, works on mobile and desktop browsers</text>

  <rect x="360" y="232" width="520" height="28" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="620" y="250" text-anchor="middle" font-size="12" fill="${MUTED}">[ REST API  --  HTTP/JSON via Axios ]</text>

  <rect x="40" y="264" width="1160" height="100" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/>
  <rect x="40" y="264" width="8" height="100" rx="4" fill="${GRN}"/>
  <text x="68" y="292" font-size="13" font-weight="800" fill="${GRN}">TIER 2 -- APPLICATION LAYER (Backend API)</text>
  <text x="68" y="312" font-size="11" fill="${MUTED}">Node.js + Express.js + TypeScript  |  Runs on PORT 8080</text>
  <text x="68" y="330" font-size="11" fill="${MUTED}">Routes: /api/auth  /api/feedback  /api/departments  /api/courses  /api/faculty  /api/windows</text>
  <text x="68" y="348" font-size="11" fill="${MUTED}">Middleware: Rate Limiting  |  Session Management  |  Input Validation (Zod)  |  Trust Proxy</text>

  <rect x="360" y="368" width="520" height="28" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="620" y="386" text-anchor="middle" font-size="12" fill="${MUTED}">[ Drizzle ORM  --  Type-safe SQL Queries ]</text>

  <rect x="40" y="400" width="1160" height="100" rx="8" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="2"/>
  <rect x="40" y="400" width="8" height="100" rx="4" fill="#7c3aed"/>
  <text x="68" y="428" font-size="13" font-weight="800" fill="#7c3aed">TIER 3 -- DATA LAYER (Database)</text>
  <text x="68" y="448" font-size="11" fill="${MUTED}">PostgreSQL  |  6 Tables  |  Replit-managed database via DATABASE_URL</text>
  <text x="68" y="466" font-size="11" fill="${MUTED}">Tables: departments  courses  faculty  feedback  form_templates  feedback_windows</text>
  <text x="68" y="484" font-size="11" fill="${MUTED}">Notable: JSONB for custom answers, real type for 0.5-step rating precision</text>

  ${heading(40, 514, "3.2", "Frontend Pages &amp; Routing")}
  <rect x="40" y="554" width="1160" height="340" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    { route: "/",               page: "Login Page",       desc: "User selects their role (Student, Faculty, HOD, Admin), then enters ID and PIN. Successful auth redirects to the appropriate dashboard.", color: "#1e3a8a" },
    { route: "/submit-feedback",page: "Submit Feedback",  desc: "Student selects department and course, enters section and year, drags star ratings for 5 categories, adds optional comments, answers custom questions, and submits. Receives Reference ID on success.", color: "#14532d" },
    { route: "/hod-dashboard",  page: "HOD Dashboard",   desc: "HOD views department analytics, per-course rating table with 5-category breakdown, downloads PDF report, customizes feedback form, and checks feedback window status.", color: "#065f46" },
    { route: "/admin",          page: "Admin Panel",      desc: "Admin views institution-wide analytics for all 5 departments, manages courses and faculty records, creates and toggles feedback windows.", color: "#7c2d12" },
    { route: "/faculty",        page: "Faculty View",     desc: "Faculty sees performance data for their assigned courses: average ratings per category, anonymous student comments, and semester trends.", color: "#4c1d95" },
  ].map(({ route, page, desc, color }, i) => {
    const y = 562 + i * 66;
    return `<rect x="56" y="${y}" width="120" height="28" rx="4" fill="${color}"/>
    <text x="116" y="${y+19}" text-anchor="middle" font-size="10" font-weight="700" fill="white">${route}</text>
    <text x="190" y="${y+18}" font-size="13" font-weight="700" fill="${PRI}">${page}</text>
    ${textBlock(190, y+32, desc, { fontSize: 10, fill: MUTED, maxChars: 108, lineH: 16 })}`;
  }).join("")}

  ${heading(40, 906, "3.3", "API Endpoints Overview")}
  <rect x="40" y="946" width="1160" height="36" rx="4" fill="${SEC}"/>
  <text x="148" y="969" text-anchor="middle" font-size="12" font-weight="700" fill="white">Method</text>
  <text x="410" y="969" text-anchor="middle" font-size="12" font-weight="700" fill="white">Endpoint</text>
  <text x="830" y="969" text-anchor="middle" font-size="12" font-weight="700" fill="white">Purpose</text>

  ${[
    ["POST", "/api/auth/login",                    "Login for all roles (Student, Faculty, HOD, Admin)", "#0284c7"],
    ["POST", "/api/feedback",                      "Submit anonymous student feedback",                  GRN],
    ["GET",  "/api/feedback/check/:refId",          "Verify own submission via Reference ID",             GRN],
    ["GET",  "/api/departments/:id/hod-report",    "Fetch HOD analytics data for department",            "#7c3aed"],
    ["GET",  "/api/departments/:id/form-template", "Load custom feedback form template",                 "#7c3aed"],
    ["POST", "/api/departments/:id/form-template", "Save HOD custom form configuration",                 "#7c3aed"],
    ["GET",  "/api/windows",                       "List all feedback windows (active status)",          "#d97706"],
    ["POST", "/api/windows",                       "Admin: create a new feedback window",                "#dc2626"],
    ["GET",  "/api/analytics/dashboard",           "Admin: institution-wide analytics summary",          "#dc2626"],
    ["GET",  "/api/courses",                       "List courses with assigned faculty info",            "#475569"],
  ].map(([method, endpoint, purpose, color], i) => {
    const y = 982 + i * 38;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="38" fill="${bg}"/>
    <rect x="56" y="${y+7}" width="65" height="24" rx="4" fill="${color}"/>
    <text x="88" y="${y+23}" text-anchor="middle" font-size="11" font-weight="800" fill="white">${method}</text>
    <text x="260" y="${y+24}" font-size="11" font-weight="600" fill="${SEC}">${endpoint}</text>
    <text x="640" y="${y+24}" font-size="11" fill="${MUTED}">${purpose}</text>`;
  }).join("")}
  <rect x="40" y="946" width="1160" height="${10*38+36}" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  ${heading(40, 1368, "3.4", "Rate Limiting &amp; Security")}
  <rect x="40" y="1408" width="1160" height="280" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["[SEC] Session Management",    "Server-side express-session with SESSION_SECRET stored as an environment secret. Only a session cookie is stored in the browser — no passwords or tokens."],
    ["[FAST] Rate Limiting (3 Layers)","Global: 100 req/15 min per IP. Auth endpoint: 10 attempts/15 min. Feedback POST: 20 submissions/10 min. Trust proxy enabled for accurate IP detection."],
    ["[OK] Input Validation",        "Zod schema validation on every API route. Type checking, range enforcement, and required field checks are applied server-side. Clear error messages are returned on invalid input."],
    ["[LOCK] Anonymity Guarantee",  "Student login ID is never stored in the feedback table. Only the generated Reference ID is persisted. Even the database admin cannot link a feedback record to a student."],
    ["[SHD] Faculty-Course Integrity","Server verifies that the submitted course belongs to the student's department and that the referenced faculty is assigned to that course. Cross-department submissions are rejected."],
    ["[CAL] Window Enforcement",     "Feedback window status is checked server-side on every submission. Even if the client-side check is bypassed, the server rejects submissions outside active windows."],
  ].map(([title, desc], i) => {
    const y = 1418 + i * 44;
    return `${i > 0 ? `<line x1="56" y1="${y}" x2="1184" y2="${y}" stroke="#e5e7eb" stroke-width="0.8"/>` : ""}
    <text x="60" y="${y+18}" font-size="12" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(290, y+5, desc, { fontSize: 11, fill: MUTED, maxChars: 96, lineH: 17 })}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">4 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — User Roles & Access Control
// ═══════════════════════════════════════════════════════════════════════════════
function page5() {
  const roles = [
    {
      title: "STUDENT", icon: "[STU]", color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      id: "CUPGS/DEPT/NNN", pin: "4-digit PIN (default: 1234)",
      can: ["Submit anonymous feedback for enrolled courses", "Use drag-based half-star rating (0.5 to 5.0 per category)", "Add optional text comments per rating category", "Answer HOD's custom questions if configured", "Receive a unique Reference ID after each submission", "Verify own submission using the Reference ID"],
      cannot: ["View other students' feedback or ratings", "See faculty names linked to specific ratings", "Access HOD, Admin, or Faculty dashboards", "Submit feedback outside active feedback windows"],
    },
    {
      title: "FACULTY", icon: "[FAC]", color: "#4c1d95", light: "#fdf4ff", border: "#e9d5ff",
      id: "CUPGS/DEPT/NNN (same ID format)", pin: "4-digit PIN",
      can: ["View analytics for own assigned courses only", "See average ratings per category across all feedback", "Read anonymous student comments (no identity revealed)", "Compare own performance across semesters", "View rating distribution and submission count"],
      cannot: ["Submit any feedback", "Identify which student gave which rating", "Access another faculty member's data", "Access HOD or Admin dashboards", "Modify any data in the system"],
    },
    {
      title: "HOD (Head of Department)", icon: "[HOD]", color: "#065f46", light: "#f0fdf4", border: "#bbf7d0",
      id: "HOD/DEPT/001", pin: "DEPT@2025 (e.g. CSE@2025 for CSE HOD)",
      can: ["View full department analytics dashboard", "See per-course rating breakdown across 5 categories", "Sort and compare all courses in the department", "Download a formatted PDF report with one click", "Add, edit, and remove custom feedback questions", "View current feedback window status and dates", "Identify top-rated and bottom-rated courses"],
      cannot: ["Access individual student responses or identities", "View data from other departments", "Create or delete courses and faculty records", "Create or control feedback windows (Admin only)"],
    },
    {
      title: "ADMIN", icon: "[ADM]", color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      id: "bput@admin2025", pin: "Admin-configured password",
      can: ["View institution-wide analytics across all departments", "Manage departments (add, edit, update HOD info)", "Add, edit, and assign faculty to courses", "Create feedback windows (title, dates, dept or global)", "Toggle feedback windows open or closed at any time", "Compare cross-department performance metrics"],
      cannot: ["View individual anonymous feedback content or comments", "Override a HOD's department-specific custom form configuration"],
    },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">4. User Roles &amp; Access Control</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 5 of 10</text>

  ${heading(40, 88, "4.1", "Role Overview")}
  ${roles.map(({ title, color, light, border }, i) => {
    const x = 40 + i * 302;
    return `<rect x="${x}" y="128" width="280" height="70" rx="8" fill="${light}" stroke="${border}" stroke-width="2"/>
    <rect x="${x}" y="128" width="280" height="8" rx="4" fill="${color}"/>
    <text x="${x+140}" y="178" text-anchor="middle" font-size="15" font-weight="800" fill="${color}">${title}</text>`;
  }).join("")}

  ${roles.map(({ title, color, light, border, id, pin, can, cannot }, i) => {
    const y = 210 + i * 372;
    const canB = bullets(60, y + 78, can.slice(0, 6), color);
    const cannotB = bullets(660, y + 78, cannot.slice(0, 4), "#dc2626");
    return `
    <rect x="40" y="${y}" width="1160" height="356" rx="8" fill="${light}" stroke="${border}" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="44" rx="8" fill="${color}"/>
    <text x="60" y="${y+28}" font-size="17" font-weight="800" fill="white">${title}</text>
    <text x="1180" y="${y+28}" text-anchor="end" font-size="11" fill="white">ID: ${id}  |  PIN/Pass: ${pin}</text>
    <text x="60" y="${y+62}" font-size="13" font-weight="700" fill="${color}">CAN DO:</text>
    ${canB.svg}
    <line x1="630" y1="${y+50}" x2="630" y2="${y+340}" stroke="${border}" stroke-width="1"/>
    <text x="660" y="${y+62}" font-size="13" font-weight="700" fill="#dc2626">CANNOT DO:</text>
    ${cannotB.svg}`;
  }).join("")}

  ${heading(40, 1698, "4.2", "Access Matrix Summary")}
  <rect x="40" y="1738" width="1160" height="36" rx="4" fill="${SEC}"/>
  ${["Feature", "Student", "Faculty", "HOD", "Admin"].map((h, i) => {
    const x = i === 0 ? 80 : 380 + (i-1)*204;
    return `<text x="${x}" y="1761" font-size="12" font-weight="700" fill="white">${h}</text>`;
  }).join("")}
  ${[
    ["Submit Feedback",          "YES", "NO",  "NO",  "NO"],
    ["View Own Course Ratings",  "NO",  "YES", "YES", "YES"],
    ["Department Analytics",     "NO",  "NO",  "YES", "YES"],
    ["Download PDF Report",      "NO",  "NO",  "YES", "YES"],
    ["Custom Form Builder",      "NO",  "NO",  "YES", "NO"],
    ["Manage Courses / Faculty", "NO",  "NO",  "NO",  "YES"],
    ["Control Feedback Windows", "NO",  "NO",  "NO",  "YES"],
  ].map(([feat, ...vals], i) => {
    const y = 1774 + i * 32;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="32" fill="${bg}"/>
    <text x="80" y="${y+21}" font-size="11" fill="${SEC}">${feat}</text>
    ${vals.map((v, j) => {
      const color = v === "YES" ? GRN : "#dc2626";
      return `<text x="${382 + j*204}" y="${y+21}" font-size="12" font-weight="700" fill="${color}">${v}</text>`;
    }).join("")}`;
  }).join("")}
  <rect x="40" y="1738" width="1160" height="${7*32+36}" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">5 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 6 — Module-wise Explanation
// ═══════════════════════════════════════════════════════════════════════════════
function page6() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">5. Module-wise Explanation</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 6 of 10</text>

  ${[
    {
      num: "5.1", title: "Authentication Module",
      color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      desc: "Handles all user authentication with role detection and session management.",
      steps: [
        "User selects their role from the login page (Student, Faculty, HOD, Admin)",
        "User enters their ID and PIN or password",
        "Server checks the ID format to determine role: CUPGS/* for students and faculty, HOD/* for HODs",
        "PIN is verified against the stored record for that employee or student ID",
        "On success, server creates a session; on failure, returns a clear error message",
        "Rate limiting blocks IPs after 10 failed attempts within 15 minutes",
        "Session persists until the browser is closed or the user logs out explicitly",
      ],
    },
    {
      num: "5.2", title: "Feedback Submission Module",
      color: "#14532d", light: "#f0fdf4", border: "#bbf7d0",
      desc: "Core module — collects, validates, and stores anonymous student feedback.",
      steps: [
        "Student selects their department, then the specific course from a filtered dropdown",
        "Faculty is auto-populated from the course record (or shown as 'Faculty TBA' if unassigned)",
        "Semester and Academic Year are auto-calculated from the current date",
        "Student drags star ratings for 5 categories, each from 0.5 to 5.0 in 0.5 steps",
        "Optional text comments can be added for each rating category",
        "HOD's custom questions are shown if configured; student fills them out",
        "On submit: server validates inputs, checks window, verifies integrity, stores record, returns Reference ID",
      ],
    },
    {
      num: "5.3", title: "HOD Analytics &amp; Dashboard Module",
      color: "#065f46", light: "#ecfdf5", border: "#6ee7b7",
      desc: "HOD's primary tool for real-time department performance analysis and reporting.",
      steps: [
        "Dashboard loads with department summary: total feedback received and overall average rating",
        "Per-course table shows 5-category rating breakdown for every course in the department",
        "HOD can sort the table by any rating category to identify top or bottom performers",
        "Trend section shows semester-on-semester comparison for selected courses",
        "PDF Report button generates a formatted report with college header, all courses, and ratings",
        "Form Builder section lets HOD add, reorder, or delete custom feedback questions",
        "Window Status panel shows whether a feedback window is currently active, with its dates",
      ],
    },
    {
      num: "5.4", title: "Admin Institution Management Module",
      color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      desc: "Admin's complete control panel for institution-wide configuration and oversight.",
      steps: [
        "Institution dashboard shows combined analytics summary for all 5 departments",
        "Highest and lowest rated courses across the institution are highlighted",
        "Course management: add new courses, assign or reassign faculty, set semester and academic year",
        "Faculty management: add, edit, or deactivate faculty records with department assignment",
        "Feedback Window creation: set title, description, start date, end date, and target department",
        "Window toggle: activate or deactivate any window at any time with a single toggle switch",
        "Cross-department comparison shows relative performance of all departments side by side",
      ],
    },
  ].map(({ num, title, color, light, border, desc, steps }, i) => {
    const y = 88 + i * 406;
    return `
    ${heading(40, y, num, title)}
    <rect x="40" y="${y+40}" width="1160" height="358" rx="6" fill="${light}" stroke="${border}" stroke-width="1"/>
    <text x="64" y="${y+68}" font-size="14" font-weight="700" fill="${color}">${title}</text>
    ${textBlock(64, y+84, desc, { fontSize: 12, fill: MUTED, maxChars: 112, lineH: 19 })}
    <line x1="56" y1="${y+108}" x2="1184" y2="${y+108}" stroke="${border}" stroke-width="1"/>
    <text x="64" y="${y+128}" font-size="13" font-weight="700" fill="${color}">Step-by-Step Flow:</text>
    ${steps.map((s, si) => {
      const sy = y + 144 + si * 30;
      return `<rect x="64" y="${sy-14}" width="24" height="24" rx="12" fill="${color}"/>
      <text x="76" y="${sy+3}" text-anchor="middle" font-size="11" font-weight="800" fill="white">${si+1}</text>
      <text x="100" y="${sy+3}" font-size="12" fill="${SEC}">${s}</text>`;
    }).join("")}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">6 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 7 — Technology Stack & Design
// ═══════════════════════════════════════════════════════════════════════════════
function page7() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">6. Technology Stack &amp; Design System</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 7 of 10</text>

  ${heading(40, 88, "6.1", "Complete Technology Stack")}

  ${[
    {
      layer: "Frontend", color: "#1e3a8a", items: [
        ["React 18",         "Component-based UI library with hooks-based state management"],
        ["TypeScript",       "Statically typed JavaScript — compile-time error detection across all files"],
        ["Vite",             "Build tool with lightning-fast HMR and optimized production bundles"],
        ["Tailwind CSS",     "Utility-first CSS framework for responsive dark-themed design"],
        ["shadcn/ui",        "Accessible component library: buttons, cards, dialogs, form inputs"],
        ["React Query",      "Server state management: caching, background refetch, loading/error states"],
        ["React Hook Form",  "Form state management with validation, error messages, and submit handling"],
        ["jsPDF + html2canvas","Client-side PDF generation: HOD report is built in the browser on download"],
      ]
    },
    {
      layer: "Backend", color: "#14532d", items: [
        ["Node.js",             "JavaScript runtime with non-blocking I/O and event-driven architecture"],
        ["Express.js",          "HTTP server framework for routing, middleware chaining, and session handling"],
        ["TypeScript",          "Full type safety on the server, sharing types with the frontend codebase"],
        ["express-session",     "Server-side session management to maintain authentication state between requests"],
        ["express-rate-limit",  "API rate limiting: protects against brute-force attacks and request flooding"],
        ["Zod",                 "Schema declaration and validation library — parses and validates all API inputs"],
        ["Pino",                "High-performance structured JSON logging for production-grade observability"],
      ]
    },
    {
      layer: "Database", color: "#7c2d12", items: [
        ["PostgreSQL",   "Production-grade relational database: ACID compliant, JSON support, scalable"],
        ["Drizzle ORM",  "Type-safe ORM with a schema-first approach and SQL-like query syntax"],
        ["Drizzle Kit",  "Migration tooling: schema changes are pushed safely to the database"],
        ["JSONB columns","Used for feedback.custom_answers and form_templates.fields for flexible storage"],
        ["real type",    "Rating columns use PostgreSQL real (float) type to support 0.5 precision ratings"],
      ]
    },
    {
      layer: "Infrastructure &amp; Tooling", color: "#4c1d95", items: [
        ["Replit",          "Cloud development and hosting platform; manages ports, secrets, and domains"],
        ["pnpm workspaces", "Monorepo setup — api-server and bput-feedback as separate workspace packages"],
        ["PWA",             "Web App Manifest + Service Worker: installable on any device, no app store needed"],
        ["Environment Secrets","SESSION_SECRET stored securely as a Replit environment variable, never in code"],
      ]
    },
  ].map(({ layer, color, items }, li) => {
    const y = 128 + li * 340;
    return `<rect x="40" y="${y}" width="1160" height="${items.length * 36 + 48}" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
    <rect x="40" y="${y}" width="1160" height="36" rx="4" fill="${color}20" stroke="${color}40" stroke-width="1"/>
    <text x="60" y="${y+23}" font-size="13" font-weight="800" fill="${color}">${layer.toUpperCase()} STACK</text>
    ${items.map(([tech, desc], i) => {
      const iy = y + 44 + i * 36;
      return `${i > 0 ? `<line x1="56" y1="${iy-2}" x2="1184" y2="${iy-2}" stroke="#e5e7eb" stroke-width="0.5"/>` : ""}
      <rect x="56" y="${iy+2}" width="130" height="24" rx="4" fill="${color}"/>
      <text x="121" y="${iy+18}" text-anchor="middle" font-size="11" font-weight="700" fill="white">${tech}</text>
      <text x="200" y="${iy+18}" font-size="11" fill="${MUTED}">${desc}</text>`;
    }).join("")}`;
  }).join("")}

  ${heading(40, 1508, "6.2", "UI Design System")}
  <rect x="40" y="1548" width="1160" height="80" rx="6" fill="#0f172a"/>
  <text x="620" y="1576" text-anchor="middle" font-size="14" font-weight="800" fill="white">Dark Glassmorphism Theme</text>
  <text x="620" y="1598" text-anchor="middle" font-size="12" fill="#94a3b8">Background: #0f172a (Slate 900)  |  Cards use backdrop-blur with semi-transparent white overlay</text>
  <text x="620" y="1618" text-anchor="middle" font-size="12" fill="#94a3b8">Primary Blue: #1e3a8a  |  Accent: #2563eb  |  Success Green: #14532d  |  Danger Red: #dc2626</text>

  ${[
    ["#0f172a","Background"], ["#1e293b","Card BG"],  ["#1e3a8a","Primary"],
    ["#2563eb","Accent"],     ["#14532d","Success"],  ["#7c2d12","Danger"],
    ["#4c1d95","Faculty"],    ["#065f46","HOD"],       ["#f8fafc","Light Text"],
  ].map(([color, label], i) => {
    const x = 40 + i * 130, y = 1648;
    return `<rect x="${x}" y="${y}" width="114" height="50" rx="6" fill="${color}" stroke="#374151" stroke-width="1"/>
    <text x="${x+57}" y="${y+68}" text-anchor="middle" font-size="9" fill="${MUTED}">${label}</text>
    <text x="${x+57}" y="${y+80}" text-anchor="middle" font-size="8" fill="${MUTED}">${color}</text>`;
  }).join("")}

  ${heading(40, 1750, "6.3", "PWA Features")}
  <rect x="40" y="1790" width="1160" height="100" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1806, [
    "Installable on Android, iOS, Windows, and macOS via the browser's 'Add to Home Screen' prompt",
    "Fully responsive — tested from 320px mobile screens up to 4K desktop resolutions",
    "Custom splash screen on app launch with CUPGS branding and an animated loading indicator",
    "OLED-optimized dark theme reduces eye strain and improves battery life on AMOLED displays",
  ], ACC).svg}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">7 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 8 — How To Use
// ═══════════════════════════════════════════════════════════════════════════════
function page8() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">7. How To Use The System (Step-by-Step Guides)</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 8 of 10</text>

  ${[
    {
      role: "STUDENT", color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      steps: [
        ["Open the App",       "Navigate to the app URL in any browser, or launch the installed PWA"],
        ["Select Role",        "Choose 'Student' from the role selector on the login screen"],
        ["Log In",             "Enter ID (e.g. CUPGS/CSE/042) and 4-digit PIN, then click Login"],
        ["Select Course",      "Pick your department, then choose the specific course from the dropdown"],
        ["Rate Each Category", "Drag the star control to set ratings in 0.5 steps for all 5 categories"],
        ["Add Comments",       "Optionally type text comments for each rating category"],
        ["Custom Questions",   "Fill in any custom questions the HOD has added for your department"],
        ["Submit",             "Click 'Submit Feedback' and copy the Reference ID shown on screen"],
        ["Verify (Optional)",  "Use the Reference ID on the verification page to confirm your submission"],
      ]
    },
    {
      role: "HOD (Head of Department)", color: "#065f46", light: "#f0fdf4", border: "#bbf7d0",
      steps: [
        ["Log In",             "Enter ID (e.g. HOD/CSE/001) and password (e.g. CSE@2025)"],
        ["View Dashboard",     "Department analytics load automatically — total feedback count and overall average"],
        ["Analyze by Course",  "Review the per-course table showing 5-category rating breakdown for every course"],
        ["Sort and Filter",    "Click column headers to sort by any rating category — find top and bottom performers"],
        ["Download PDF",       "Click 'Download PDF Report' to get a fully formatted department report"],
        ["Customize Form",     "Use the 'Form Builder' section to add, reorder, or delete custom questions"],
        ["Check Window",       "Review the Feedback Window panel to see if a window is active and its date range"],
      ]
    },
    {
      role: "ADMIN", color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      steps: [
        ["Log In",             "Enter Admin ID (bput@admin2025) and the configured admin password"],
        ["Institution View",   "See the combined analytics summary for all 5 departments at a glance"],
        ["Manage Courses",     "Add new courses, assign faculty, set semester number and academic year"],
        ["Manage Faculty",     "Add or edit faculty records, assign to departments, deactivate as needed"],
        ["Create Window",      "Set a title, description, start date, end date, and target department (or global)"],
        ["Toggle Window",      "Flip the Active toggle on any window to open or close feedback collection"],
        ["Cross-Dept View",    "Use the comparison panel to see relative performance across all departments"],
      ]
    },
    {
      role: "FACULTY", color: "#4c1d95", light: "#fdf4ff", border: "#e9d5ff",
      steps: [
        ["Log In",             "Enter Faculty ID (e.g. CUPGS/CSE/101) and 4-digit PIN"],
        ["View My Courses",    "The dashboard lists all courses assigned to you in the current semester"],
        ["Select a Course",    "Click on any course to see detailed feedback analytics for that course"],
        ["Review Ratings",     "See average ratings for each of the 5 categories and the overall average"],
        ["Read Comments",      "Anonymous student comments are displayed below the ratings — no names shown"],
        ["Track Progress",     "Switch between semesters to compare how your ratings have changed over time"],
      ]
    },
  ].map(({ role, color, light, border, steps }, i) => {
    const y = 88 + i * 396;
    return `
    <rect x="40" y="${y}" width="1160" height="380" rx="8" fill="${light}" stroke="${border}" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="44" rx="8" fill="${color}"/>
    <text x="68" y="${y+28}" font-size="17" font-weight="800" fill="white">${role} -- Step by Step Guide</text>
    ${steps.map(([title, desc], si) => {
      const sx = 56 + (si % 3) * 390;
      const sy = y + 54 + Math.floor(si / 3) * 108;
      return `<rect x="${sx}" y="${sy}" width="370" height="98" rx="6" fill="white" stroke="${border}" stroke-width="1"/>
      <rect x="${sx}" y="${sy}" width="370" height="8" rx="3" fill="${color}"/>
      <rect x="${sx+10}" y="${sy+18}" width="28" height="28" rx="14" fill="${color}"/>
      <text x="${sx+24}" y="${sy+36}" text-anchor="middle" font-size="12" font-weight="800" fill="white">${si+1}</text>
      <text x="${sx+48}" y="${sy+32}" font-size="12" font-weight="700" fill="${color}">${title}</text>
      ${textBlock(sx+48, sy+46, desc, { fontSize: 10, fill: MUTED, maxChars: 44, lineH: 16 })}`;
    }).join("")}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">8 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 9 — Data Flow & Security
// ═══════════════════════════════════════════════════════════════════════════════
function page9() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">8. Data Flow &amp; Security Design</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 9 of 10</text>

  ${heading(40, 88, "8.1", "Feedback Submission Data Flow (10 Steps)")}

  ${[
    { label: "Student submits\nfeedback form",               color: "#1e3a8a" },
    { label: "Frontend validates\ninput (required, ranges)", color: "#0284c7" },
    { label: "POST /api/feedback\n(HTTP JSON request)",      color: "#0284c7" },
    { label: "Rate limit check\n(20 req per 10 min)",        color: "#d97706" },
    { label: "Session auth check\n(is student logged in?)",  color: "#7c3aed" },
    { label: "Zod schema validation\n(type + range check)",  color: "#14532d" },
    { label: "Course-Faculty\nintegrity check",              color: "#14532d" },
    { label: "Feedback window\ncheck (is window open?)",     color: "#d97706" },
    { label: "Store record in\nPostgreSQL database",         color: "#7c2d12" },
    { label: "Return Reference ID\n(FB-YYYYMMDD-XXXXXX)",   color: "#065f46" },
  ].map(({ label, color }, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 40 + col * 236, y = 128 + row * 140;
    const lines = label.split("\n");
    return `<rect x="${x}" y="${y}" width="216" height="116" rx="8" fill="white" stroke="${color}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="216" height="8" rx="4" fill="${color}"/>
    <rect x="${x+88}" y="${y+18}" width="40" height="40" rx="20" fill="${color}20" stroke="${color}" stroke-width="1"/>
    <text x="${x+108}" y="${y+43}" text-anchor="middle" font-size="16" font-weight="800" fill="${color}">${i+1}</text>
    ${lines.map((l, li) => `<text x="${x+108}" y="${y+74+li*18}" text-anchor="middle" font-size="11" font-weight="${li===0?700:400}" fill="${li===0?color:MUTED}">${l}</text>`).join("")}
    ${col < 4 ? `<line x1="${x+216}" y1="${y+58}" x2="${x+236}" y2="${y+58}" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>` : ""}`;
  }).join("")}
  <defs><marker id="arr" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="#4b5563"/></marker></defs>
  <path d="M1200,186 Q1220,186 1220,326 L40,326" stroke="#4b5563" stroke-width="2" fill="none" marker-end="url(#arr)"/>

  ${heading(40, 400, "8.2", "Database Schema -- All 6 Tables")}
  ${[
    { table: "departments", color: "#1a7a6e", cols: ["id PK", "code UNIQUE", "name", "hod_name", "hod_employee_id", "created_at", "updated_at"] },
    { table: "faculty",     color: "#1a7a6e", cols: ["id PK", "department_id FK", "employee_id UNIQUE", "name", "designation", "email", "is_active"] },
    { table: "courses",     color: "#1a7a6e", cols: ["id PK", "department_id FK", "faculty_id FK nullable", "code UNIQUE", "name", "semester", "academic_year", "credits"] },
    { table: "feedback",    color: "#92400e", cols: ["id PK", "reference_id UNIQUE", "course_id FK", "faculty_id FK?", "department_id FK", "semester", "academic_year", "5 x real ratings", "comments text", "custom_answers JSONB"] },
    { table: "form_templates", color: "#6b21a8", cols: ["id PK", "department_id FK UNIQUE", "fields JSONB", "created_at", "updated_at", "updated_by"] },
    { table: "feedback_windows", color: "#6b21a8", cols: ["id PK", "department_id FK nullable", "title", "is_active boolean", "start_date", "end_date", "description"] },
  ].map(({ table, color, cols }, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * 394, y = 440 + row * 270;
    return `<rect x="${x}" y="${y}" width="374" height="${32+cols.length*28}" rx="6" fill="${color}15" stroke="${color}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="374" height="32" rx="6" fill="${color}"/>
    <text x="${x+8}" y="${y+21}" font-size="13" font-weight="800" fill="white">${table}</text>
    ${cols.map((c, ci) => {
      const cy = y + 32 + ci * 28;
      const isKey = c.includes("PK") || c.includes("FK");
      return `${ci > 0 ? `<line x1="${x+4}" y1="${cy}" x2="${x+370}" y2="${cy}" stroke="${color}30" stroke-width="0.8"/>` : ""}
      <text x="${x+12}" y="${cy+19}" font-size="11" fill="${isKey?"#d97706":SEC}" font-weight="${isKey?700:400}">${c}</text>`;
    }).join("")}`;
  }).join("")}

  ${heading(40, 990, "8.3", "Security Measures Implemented")}
  <rect x="40" y="1030" width="1160" height="380" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["Session Management",    "Server-side express-session. SESSION_SECRET is stored as an environment secret — never in code. The browser stores only a session cookie, no sensitive data."],
    ["Rate Limiting (3 Levels)","Global: 100 requests per 15 min per IP. Auth endpoint: 10 login attempts per 15 min. Feedback POST: 20 submissions per 10 min. Prevents brute-force and flooding."],
    ["Input Validation",       "Zod schema validation on every API route — type checks, value ranges, and required fields. Server returns field-level error messages; invalid input never reaches the database."],
    ["Anonymous Guarantee",   "Student login ID is never written to the feedback table. Only the system-generated Reference ID is stored. Even a database administrator cannot trace feedback to a student."],
    ["Integrity Enforcement", "Server validates: course belongs to student's department, faculty is assigned to that course. Cross-department submissions are rejected at the server, independent of client-side checks."],
    ["Window Enforcement",     "Feedback window is verified server-side on every submission. Client-side bypass has no effect — the server checks the database for an active window before accepting any record."],
    ["No Raw SQL",             "All database access goes through Drizzle ORM with parameterized queries. SQL injection is effectively impossible — no string interpolation in queries."],
    ["Error Handling",         "Server errors are logged with Pino (JSON format). Clients receive generic error messages — stack traces and database details are never exposed in API responses."],
  ].map(([title, desc], i) => {
    const y = 1040 + i * 46;
    return `${i > 0 ? `<line x1="56" y1="${y}" x2="1184" y2="${y}" stroke="#e5e7eb" stroke-width="0.8"/>` : ""}
    <text x="60" y="${y+18}" font-size="12" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(260, y+5, desc, { fontSize: 11, fill: MUTED, maxChars: 100, lineH: 16 })}`;
  }).join("")}

  ${heading(40, 1424, "8.4", "Anonymity Architecture -- How It Is Guaranteed")}
  <rect x="40" y="1464" width="1160" height="230" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
  <text x="60" y="1492" font-size="14" font-weight="800" fill="#92400e">How Anonymity Is Guaranteed:</text>
  ${textBlock(60, 1508, "When a student submits feedback, the server generates a cryptographically unique Reference ID (format: FB-YYYYMMDD-XXXXXX). This ID is stored in the feedback record. The student's login ID (e.g. CUPGS/CSE/042) is NEVER written to the feedback table. There is no column, no join, and no log entry that links a student's identity to their feedback.", { fontSize: 12, fill: SEC, maxChars: 114, lineH: 20 })}

  <rect x="60" y="1578" width="500" height="50" rx="6" fill="white" stroke="#fde68a" stroke-width="1"/>
  <text x="80" y="1598" font-size="12" font-weight="700" fill="#92400e">STORED in the feedback table:</text>
  <text x="80" y="1618" font-size="11" fill="${MUTED}">reference_id, course_id, dept_id, semester, year, ratings, comments, custom_answers</text>

  <rect x="600" y="1578" width="560" height="50" rx="6" fill="white" stroke="#fde68a" stroke-width="1"/>
  <text x="620" y="1598" font-size="12" font-weight="700" fill="#dc2626">NEVER STORED in the feedback table:</text>
  <text x="620" y="1618" font-size="11" fill="${MUTED}">student_id, employee_id, name, login credentials, IP address, browser fingerprint</text>

  <text x="60" y="1662" font-size="12" fill="${GRN}" font-weight="600">- Even the developer and database admin cannot trace feedback back to a specific student.</text>
  <text x="60" y="1682" font-size="12" fill="${GRN}" font-weight="600">- Students can verify their own submission using their Reference ID — but no one else can use it to identify them.</text>

  ${heading(40, 1702, "8.5", "Error Handling Strategy")}
  <rect x="40" y="1742" width="1160" height="100" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1756, [
    "Validation errors (HTTP 400): Field-specific error messages from Zod schema; user sees exactly what is wrong",
    "Auth errors (HTTP 401): Session missing or expired — client is redirected to the login page",
    "Rate limit exceeded (HTTP 429): Includes Retry-After header; client shows a countdown before allowing retry",
    "Server errors (HTTP 500): Logged with Pino for developer review; client receives a safe generic message (no stack trace exposed)",
  ], "#dc2626").svg}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">9 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 10 — Summary & Future Scope
// ═══════════════════════════════════════════════════════════════════════════════
function page10() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">9. Summary &amp; Future Scope</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 10 of 10</text>

  ${heading(40, 88, "9.1", "Project Summary")}
  <rect x="40" y="128" width="1160" height="150" rx="8" fill="${LIGHT}" stroke="${MID}" stroke-width="1.5"/>
  ${textBlock(60, 150, "CUPGS Academic Feedback Manager is a complete full-stack web application built specifically for BPUT Rourkela's CUPGS engineering departments. Its primary goal is to allow students to submit honest, anonymous feedback on their courses and faculty — without fear of identification — and to give HODs immediate, actionable insights through a real-time analytics dashboard and professional PDF reports.", { fontSize: 12, fill: SEC, maxChars: 114, lineH: 22 })}
  ${textBlock(60, 242, "The system serves 4 distinct roles (Student, Faculty, HOD, Admin), enforces strict access boundaries, and stores all data securely in a PostgreSQL database. Anonymity is guaranteed by architecture: student identity is never stored alongside feedback records.", { fontSize: 12, fill: SEC, maxChars: 114, lineH: 22 })}

  ${heading(40, 290, "9.2", "Key Deliverables Achieved")}
  <rect x="40" y="330" width="1160" height="310" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["Anonymous Feedback System",   "Students submit via any device with a guaranteed Reference ID — no name stored"],
    ["Half-Star Drag Rating",        "5 categories rated from 0.5 to 5.0 in 0.5 steps — drag interaction, mouse and touch"],
    ["Real-Time HOD Dashboard",     "Department analytics with per-course rating breakdown, always up to date"],
    ["One-Click PDF Report",        "HOD receives a fully formatted department report in seconds, no manual work"],
    ["HOD Form Builder",            "Custom question types (text, rating, choice) added without any developer involvement"],
    ["Faculty-Course Integrity",    "Server-side validation prevents cross-department or fraudulent course submissions"],
    ["Admin Institution Control",   "Centralized management: departments, courses, faculty, windows — all in one panel"],
    ["Feedback Window System",      "Time-controlled collection with date-bound windows that Admin opens and closes"],
    ["Progressive Web App",         "Installable, responsive, splash screen, dark theme — works like a native app"],
    ["Production-Grade Security",   "Rate limiting (3 layers), session management, Zod validation, no raw SQL exposure"],
  ].map(([title, desc], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 56 + col * 580, y = 340 + row * 56;
    return `<text x="${x}" y="${y+18}" font-size="13" font-weight="700" fill="${GRN}">OK  ${title}</text>
    <text x="${x}" y="${y+36}" font-size="11" fill="${MUTED}">${desc}</text>
    ${i < 8 && col === 1 ? `<line x1="56" y1="${y+46}" x2="1184" y2="${y+46}" stroke="#e5e7eb" stroke-width="0.6"/>` : ""}`;
  }).join("")}

  ${heading(40, 654, "9.3", "Future Scope &amp; Planned Enhancements")}
  ${[
    {
      phase: "Phase 2 -- Short Term (next 3-6 months)", color: "#1e3a8a",
      items: [
        "Email notifications: HODs receive automated semester-end reports by email",
        "Charts in PDF report: bar charts and radar charts for visual rating comparison",
        "Student feedback history: view all past submissions using saved Reference IDs",
        "Bulk course import: import courses from an Excel/CSV file instead of one by one",
        "Multi-language support: Odia and Hindi language options for wider accessibility",
      ]
    },
    {
      phase: "Phase 3 -- Medium Term (6-18 months)", color: "#065f46",
      items: [
        "AI sentiment analysis: automatic positive/negative/neutral tagging on student comments",
        "Semester trend graphs: visual performance tracking for faculty across multiple semesters",
        "Mobile app: React Native version for iOS and Android with push notifications",
        "Automated alerts: HOD receives auto-alert when a course rating drops below a threshold",
        "Comparative benchmarking: compare department ratings against similar institutions",
      ]
    },
    {
      phase: "Phase 4 -- Long Term (18+ months)", color: "#7c3aed",
      items: [
        "Multi-institution network: extend the platform to cover multiple BPUT affiliated colleges",
        "NAAC/NIRF integration: feedback data exportable in formats accepted by accreditation bodies",
        "Predictive analytics: machine learning model to identify at-risk courses early in the semester",
        "Blockchain-verified anonymity: on-chain proof of anonymity for maximum student trust",
        "Faculty improvement plans: HOD can attach action items to low-rated courses, track resolution",
      ]
    },
  ].map(({ phase, color, items }, i) => {
    const y = 694 + i * 240;
    return `<rect x="40" y="${y}" width="1160" height="224" rx="8" fill="${color}10" stroke="${color}40" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="36" rx="8" fill="${color}"/>
    <text x="60" y="${y+24}" font-size="14" font-weight="800" fill="white">${phase}</text>
    ${bullets(60, y+46, items, color).svg}`;
  }).join("")}

  ${heading(40, 1418, "9.4", "Technical Best Practices Applied")}
  <rect x="40" y="1458" width="1160" height="180" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1474, [
    "Monorepo architecture (pnpm workspaces) — frontend and backend co-located, shared types, single repository",
    "End-to-end type safety — TypeScript + Zod + Drizzle ORM eliminates an entire class of runtime type errors",
    "Separation of concerns — API route handlers, business logic, and database queries are kept in distinct layers",
    "Security by default — rate limiting, session management, and input validation are built in from day one, not added later",
    "Principle of least privilege — each user role has access to exactly the data and operations it needs, no more",
    "Git checkpoint-based version control — every major feature has a recoverable state that can be rolled back",
  ], ACC).svg}

  <!-- Final Stats Banner -->
  <rect x="40" y="1654" width="1160" height="120" rx="12" fill="${PRI}"/>
  <text x="620" y="1684" text-anchor="middle" font-size="16" font-weight="800" fill="white">Project At A Glance</text>
  ${[
    ["6",    "DB Tables"],
    ["10+",  "API Routes"],
    ["4",    "User Roles"],
    ["5",    "Departments"],
    ["268+", "Courses"],
    ["5",    "Rating Cats."],
    ["100%", "Anonymous"],
    ["PWA",  "Platform"],
  ].map(([v, l], i) => {
    const x = 80 + i * 142;
    return `<rect x="${x}" y="1698" width="120" height="64" rx="6" fill="#ffffff15"/>
    <text x="${x+60}" y="1728" text-anchor="middle" font-size="22" font-weight="900" fill="white">${v}</text>
    <text x="${x+60}" y="1750" text-anchor="middle" font-size="10" fill="#93c5fd">${l}</text>`;
  }).join("")}

  <!-- End Banner -->
  <rect x="40" y="1788" width="1160" height="80" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
  <text x="620" y="1820" text-anchor="middle" font-size="16" font-weight="800" fill="${GRN}">-- End of Project Documentation --</text>
  <text x="620" y="1848" text-anchor="middle" font-size="12" fill="${MUTED}">CUPGS Academic Feedback Manager  |  BPUT Rourkela  |  Academic Year 2024-25</text>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager  |  Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">10 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Strip emoji & fix XML
// ═══════════════════════════════════════════════════════════════════════════════
const EMOJI_MAP = {
  "\u2705": "[OK]",  "\u274C": "[NO]", "\u2714": "[Y]", "\u2716": "[N]",
  "\u2713": "[Y]",   "\u2717": "[N]",  "\u2022": "-",   "\u2026": "...",
  "\u2018": "'",     "\u2019": "'",    "\u201C": '"',   "\u201D": '"',
};
function stripEmoji(svg) {
  let out = svg;
  for (const [k, v] of Object.entries(EMOJI_MAP)) {
    out = out.split(k).join(v);
  }
  out = out.replace(/[^\x00-\u024F\u2013\u2014\u00B7\u2264\u2265]/g, (ch) => {
    const cp = ch.codePointAt(0);
    if (cp >= 0x2010 && cp <= 0x2027) return ch;
    return "";
  });
  // Fix unescaped & that are not already valid XML entity references
  out = out.replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, "&amp;");
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generate PDF
// ═══════════════════════════════════════════════════════════════════════════════
const pages = [
  { fn: page1,  name: "pg01-cover" },
  { fn: page2,  name: "pg02-overview" },
  { fn: page3,  name: "pg03-problem" },
  { fn: page4,  name: "pg04-architecture" },
  { fn: page5,  name: "pg05-roles" },
  { fn: page6,  name: "pg06-modules" },
  { fn: page7,  name: "pg07-techstack" },
  { fn: page8,  name: "pg08-howto" },
  { fn: page9,  name: "pg09-dataflow" },
  { fn: page10, name: "pg10-summary" },
];

console.log("Generating English project documentation PDF...");
const pngs = [];
for (const { fn, name } of pages) {
  const svgPath = join(OUT, `${name}.svg`);
  const pngPath = join(OUT, `${name}.png`);
  const svgContent = stripEmoji(fn());
  writeFileSync(svgPath, svgContent, "utf8");
  execSync(`magick -density 120 "${svgPath}" -background white -alpha remove -alpha off "${pngPath}"`, { stdio: "pipe" });
  pngs.push(pngPath);
  process.stdout.write(`  OK ${name}\n`);
}

const outPdf = join(__dir, "../exports/CUPGS-Project-Documentation.pdf");
execSync(`magick ${pngs.map(p => `"${p}"`).join(" ")} "${outPdf}"`, { stdio: "pipe" });
console.log(`\nDone: exports/CUPGS-Project-Documentation.pdf  (${pages.length} pages)`);
