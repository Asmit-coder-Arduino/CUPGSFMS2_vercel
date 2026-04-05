import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../exports/docs");
mkdirSync(OUT, { recursive: true });

const W = 1240, H = 1754; // A4 portrait at ~150dpi
const PRI = "#1e3a8a", SEC = "#0f172a", ACC = "#2563eb", GRN = "#14532d";
const LIGHT = "#f0f4ff", MID = "#dbeafe", MUTED = "#64748b";

// ── Helper: wrap text into lines ──────────────────────────────────────────────
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

// ── Helper: render a text block (auto-wrapped) ────────────────────────────────
function textBlock(x, y, text, { fontSize = 13, fill = SEC, maxChars = 95, lineH = 22 } = {}) {
  const lines = wrapText(text, maxChars);
  return lines.map((l, i) =>
    `<text x="${x}" y="${y + i * lineH}" font-size="${fontSize}" fill="${fill}">${l}</text>`
  ).join("\n");
}

// ── Helper: section heading ───────────────────────────────────────────────────
function heading(x, y, num, title) {
  return `
  <rect x="${x}" y="${y}" width="1160" height="36" rx="4" fill="${PRI}"/>
  <text x="${x + 16}" y="${y + 24}" font-size="16" font-weight="800" fill="white">${num}. ${title}</text>`;
}

// ── Helper: bullet point ──────────────────────────────────────────────────────
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
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="55%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="150" r="280" fill="#ffffff08"/>
  <circle cx="1000" cy="200" r="180" fill="#ffffff05"/>
  <circle cx="140"  cy="1600" r="220" fill="#ffffff06"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${W}" height="8" fill="#3b82f6"/>

  <!-- College Logo Area -->
  <rect x="520" y="100" width="200" height="200" rx="100" fill="#1d4ed8" stroke="#60a5fa" stroke-width="3"/>
  <text x="620" y="170" text-anchor="middle" font-size="48" font-weight="900" fill="white">B</text>
  <text x="620" y="220" text-anchor="middle" font-size="18" font-weight="700" fill="#bfdbfe">PUT</text>
  <text x="620" y="244" text-anchor="middle" font-size="11" fill="#93c5fd">ROURKELA</text>

  <!-- Project Title -->
  <text x="620" y="380" text-anchor="middle" font-size="13" fill="#93c5fd" font-weight="600" letter-spacing="4">PROJECT DOCUMENTATION</text>
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
  <text x="890" y="742" text-anchor="middle" font-size="13" fill="#bfdbfe">Cross-Platform · Dark Theme</text>

  <!-- Tech Stack Pills -->
  <text x="620" y="810" text-anchor="middle" font-size="12" fill="#93c5fd" font-weight="600">TECHNOLOGY STACK</text>
  ${["React 18", "TypeScript", "Node.js", "Express", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "jsPDF"].map((t, i) => {
    const cols = 4, row = Math.floor(i / cols), col = i % cols;
    const bx = 155 + col * 240, by = 828 + row * 48;
    return `<rect x="${bx}" y="${by}" width="200" height="34" rx="17" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1"/>
    <text x="${bx+100}" y="${by+22}" text-anchor="middle" font-size="12" font-weight="600" fill="white">${t}</text>`;
  }).join("")}

  <!-- Document Info -->
  <rect x="120" y="980" width="1000" height="1" fill="#3b82f650"/>
  <text x="620" y="1010" text-anchor="middle" font-size="12" fill="#64748b">Academic Year 2024-25 · Version 1.0 · Confidential</text>

  <!-- Departments Covered -->
  <text x="620" y="1080" text-anchor="middle" font-size="13" fill="#93c5fd" font-weight="600">DEPARTMENTS COVERED</text>
  ${["Computer Science &amp; Engineering (CSE)", "Electronics &amp; Communication Engineering (ECE)", "Electrical Engineering (EE)", "Mechanical Engineering (ME)", "Civil Engineering (CE)"].map((d, i) => {
    const bx = 220 + (i % 2) * 410, by = 1100 + Math.floor(i / 2) * 46;
    return `<rect x="${bx}" y="${by}" width="380" height="34" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1"/>
    <text x="${bx+190}" y="${by+22}" text-anchor="middle" font-size="11" fill="white">${d}</text>`;
  }).join("")}
  <rect x="430" y="1284" width="380" height="34" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1"/>
  <text x="620" y="1306" text-anchor="middle" font-size="11" fill="white">Civil Engineering (CE)</text>

  <!-- Table of Contents Preview -->
  <rect x="120" y="1380" width="1000" height="280" rx="10" fill="#ffffff10" stroke="#3b82f640" stroke-width="1"/>
  <text x="620" y="1412" text-anchor="middle" font-size="14" font-weight="700" fill="#60a5fa">TABLE OF CONTENTS</text>
  ${[
    ["1. Project Overview &amp; Objectives", "Page 2"],
    ["2. Problem Statement &amp; Solution", "Page 3"],
    ["3. System Architecture &amp; Features", "Page 4"],
    ["4. User Roles &amp; Access Control", "Page 5"],
    ["5. Module-wise Explanation", "Page 6"],
    ["6. Technology Stack &amp; Design", "Page 7"],
    ["7. How To Use The System", "Page 8"],
    ["8. Data Flow &amp; Security", "Page 9"],
    ["9. Summary &amp; Future Scope", "Page 10"],
  ].map(([t, p], i) => {
    const y = 1434 + i * 26;
    const dots = "·".repeat(80);
    return `<text x="160" y="${y}" font-size="12" fill="#bfdbfe">${t}</text>
    <text x="1080" y="${y}" text-anchor="end" font-size="12" fill="#60a5fa" font-weight="600">${p}</text>
    <line x1="160" y1="${y+4}" x2="1080" y2="${y+4}" stroke="#3b82f620" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  }).join("")}

  <!-- Footer -->
  <rect x="0" y="${H-48}" width="${W}" height="48" fill="#0f172a"/>
  <text x="620" y="${H-20}" text-anchor="middle" font-size="11" fill="#475569">CUPGS Feedback Management System · Project Documentation · BPUT Rourkela</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — Project Overview & Objectives
// ═══════════════════════════════════════════════════════════════════════════════
function page2() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">1. Project Overview &amp; Objectives</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 2 of 10</text>

  <!-- Overview box -->
  <rect x="40" y="92" width="1160" height="120" rx="8" fill="${LIGHT}" stroke="${MID}" stroke-width="1.5"/>
  <text x="60" y="118" font-size="14" font-weight="800" fill="${PRI}">What is CUPGS Feedback Manager?</text>
  ${textBlock(60, 136, "CUPGS Feedback Manager ek full-stack web application hai jo BPUT Rourkela ke CUPGS (Centre for Urban &amp; Planning Graduate Studies) ke liye banaya gaya hai. Yeh system students ko apne courses aur faculty ke baare mein anonymous feedback dene ki suvidha deta hai, aur Heads of Departments (HODs) ko real-time analytics aur PDF reports generate karne ki suvidha deta hai.", { fontSize: 13, maxChars: 110, lineH: 22 })}

  <!-- 3 Columns: What, Who, Why -->
  <rect x="40"   y="230" width="360" height="220" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
  <rect x="440"  y="230" width="360" height="220" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
  <rect x="840"  y="230" width="360" height="220" rx="8" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="1.5"/>

  <text x="220"  y="260" text-anchor="middle" font-size="13" font-weight="800" fill="${ACC}">📋 KYA HAI (What)</text>
  <text x="620"  y="260" text-anchor="middle" font-size="13" font-weight="800" fill="${GRN}">👥 KAUN USE KARTA HAI (Who)</text>
  <text x="1020" y="260" text-anchor="middle" font-size="13" font-weight="800" fill="#7c3aed">🎯 KYUN BANAYA (Why)</text>

  ${bullets(56, 280, ["Anonymous feedback system", "Drag-based half-star rating (0.5 steps)", "HOD-customizable question forms", "Real-time analytics dashboard", "PDF report generation", "Role-based access control"], ACC).svg}
  ${bullets(456, 280, ["Students — feedback submit karo", "Faculty — apna performance dekho", "HOD — analytics + form customize", "Admin — pura system manage karo"], GRN).svg}
  ${bullets(856, 280, ["Manual paper feedback se hata", "Anonymous hone se honest feedback", "HOD ko real data milta hai", "Faculty improvement track hota hai", "Transparency badti hai"], "#7c3aed").svg}

  ${heading(40, 470, "1.1", "Core Objectives")}
  <rect x="40" y="510" width="1160" height="360" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["🎯", "Anonymous Feedback", "Students apna feedback bina naam bataye de sakte hain. Reference ID se track kar sakte hain lekin faculty/HOD identify nahi kar sakta."],
    ["⭐", "Half-Star Ratings", "Drag-based rating system 0.5 increment mein — 0.5 se 5.0 tak. Teaching Quality, Course Content, Lab Facilities, Study Material, Overall."],
    ["📊", "HOD Analytics Dashboard", "HOD apne department ke sab courses ki ratings dekh sakta hai, trends compare kar sakta hai, aur professional PDF report download kar sakta hai."],
    ["📝", "Customizable Feedback Forms", "HOD apne department ke liye custom questions add kar sakta hai — text, rating, ya multiple choice. Yeh standard questions ke saath milke show hote hain."],
    ["🔒", "Faculty-Course Integrity", "System ensure karta hai ki feedback sirf us course ke assigned faculty ke liye diya jaye. Cross-department manipulation prevent hota hai."],
    ["📅", "Feedback Window Control", "Admin specific time periods ke liye feedback windows khol aur band kar sakta hai. Window band hone pe feedback submit nahi hoga."],
  ].map(([icon, title, desc], i) => {
    const y = 520 + i * 58;
    return `<text x="64"  y="${y+18}" font-size="20">${icon}</text>
    <text x="96"  y="${y+14}" font-size="13" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(96, y + 28, desc, { fontSize: 11, fill: MUTED, maxChars: 110, lineH: 18 })}`;
  }).join("")}

  ${heading(40, 888, "1.2", "System Scope")}
  <rect x="40" y="928" width="1160" height="140" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  <text x="60" y="952" font-size="13" font-weight="700" fill="${PRI}">IN SCOPE:</text>
  ${bullets(60, 964, ["5 Engineering departments — CSE, ECE, EE, ME, CE", "Odd semester (July–Oct) aur Even semester (Nov–June) feedback", "Academic year auto-calculation (April = new year start)", "Complete audit trail with reference IDs"], ACC).svg}
  <text x="660" y="952" font-size="13" font-weight="700" fill="#dc2626">OUT OF SCOPE:</text>
  ${bullets(660, 964, ["Online examination system", "Attendance management", "Fee payment portal", "Result management system"], "#dc2626").svg}

  ${heading(40, 1086, "1.3", "Key Performance Indicators")}
  ${[
    ["268+", "Courses", "#1e3a8a"],
    ["5", "Departments", "#065f46"],
    ["4", "User Roles", "#7c2d12"],
    ["5+", "Rating Categories", "#4c1d95"],
    ["100%", "Anonymous", "#0c4a6e"],
    ["0.5", "Rating Steps", "#7c3aed"],
  ].map(([val, label, color], i) => {
    const x = 40 + i * 196;
    return `<rect x="${x}" y="1126" width="180" height="90" rx="8" fill="${color}" stroke="none"/>
    <text x="${x+90}" y="1172" text-anchor="middle" font-size="28" font-weight="900" fill="white">${val}</text>
    <text x="${x+90}" y="1200" text-anchor="middle" font-size="11" fill="#ffffff99">${label}</text>`;
  }).join("")}

  ${heading(40, 1234, "1.4", "Academic Context")}
  <rect x="40" y="1274" width="1160" height="420" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>

  <text x="60" y="1300" font-size="13" font-weight="700" fill="${PRI}">Semester System:</text>
  <rect x="60" y="1308" width="520" height="56" rx="6" fill="${LIGHT}" stroke="${MID}" stroke-width="1"/>
  <text x="70" y="1328" font-size="12" font-weight="600" fill="${ACC}">ODD Semester (July – October)</text>
  <text x="70" y="1348" font-size="11" fill="${MUTED}">1st, 3rd, 5th, 7th semester courses — feedback window opens October</text>
  <rect x="620" y="1308" width="560" height="56" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
  <text x="630" y="1328" font-size="12" font-weight="600" fill="${GRN}">EVEN Semester (November – June)</text>
  <text x="630" y="1348" font-size="11" fill="${MUTED}">2nd, 4th, 6th, 8th semester courses — feedback window opens June</text>

  <text x="60" y="1390" font-size="13" font-weight="700" fill="${PRI}">Academic Year Calculation:</text>
  <rect x="60" y="1398" width="1100" height="50" rx="6" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>
  <text x="80" y="1420" font-size="12" fill="#92400e">If current month >= April (month ≥ 4) → Academic Year = currentYear – (currentYear+1) → e.g., "2025-26"</text>
  <text x="80" y="1438" font-size="12" fill="#92400e">If current month &lt; April (Jan-Mar) → Academic Year = (currentYear-1) – currentYear → e.g., "2024-25"</text>

  <text x="60" y="1474" font-size="13" font-weight="700" fill="${PRI}">Login Credentials Format:</text>
  ${[
    ["Student", "CUPGS/DEPT/NNN (e.g. CUPGS/CSE/042)", "1234 (PIN)", "#1e3a8a"],
    ["Faculty", "CUPGS/DEPT/NNN (e.g. CUPGS/CSE/101)", "1234 (PIN)", "#4c1d95"],
    ["HOD",    "HOD/DEPT/001 (e.g. HOD/CSE/001)",      "DEPT@2025 (e.g. CSE@2025)", "#065f46"],
    ["Admin",  "bput@admin2025",                         "Admin password", "#7c2d12"],
  ].map(([role, fmt, pin, color], i) => {
    const y = 1490 + i * 48;
    return `<rect x="60" y="${y}" width="100" height="34" rx="4" fill="${color}"/>
    <text x="110" y="${y+21}" text-anchor="middle" font-size="12" font-weight="700" fill="white">${role}</text>
    <text x="175" y="${y+21}" font-size="12" fill="${SEC}">ID: <tspan font-weight="600">${fmt}</tspan></text>
    <text x="800" y="${y+21}" font-size="12" fill="${MUTED}">PIN/Pass: <tspan font-weight="600" fill="${SEC}">${pin}</tspan></text>`;
  }).join("")}

  <!-- Footer -->
  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
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
  <text x="60" y="156" font-size="14" font-weight="800" fill="#dc2626">Existing Problems at CUPGS:</text>
  ${bullets(60, 170, [
    "Manual paper-based feedback system — time-consuming, error-prone, hard to aggregate",
    "No anonymity guarantee — students identify hone ke darr se honest feedback nahi dete",
    "HOD ko manually sab forms collect aur calculate karne padte hain — weeks lag jaate hain",
    "Faculty-wise ya course-wise comparison possible nahi tha — koi analytics nahi",
    "Custom questions add karna impossible tha — ek hi standard form sabke liye",
    "Feedback window control nahi tha — koi bhi kabhi bhi feedback de sakta tha",
  ], "#dc2626").svg}

  ${heading(40, 320, "2.2", "Solution — How CUPGS Feedback Manager Solves It")}

  ${[
    {
      problem: "❌ Paper forms - no digitization",
      solution: "✅ 100% digital — web-based form submit, PostgreSQL mein store, instant available",
      color: "#dcfce7", border: "#86efac"
    },
    {
      problem: "❌ No anonymity — fear of identification",
      solution: "✅ Reference ID system — sirf student jaanta hai apna code, faculty/HOD identify nahi kar sakta",
      color: "#eff6ff", border: "#bfdbfe"
    },
    {
      problem: "❌ Manual aggregation — weeks of work",
      solution: "✅ Real-time HOD dashboard — ek click mein department analytics, PDF report download",
      color: "#fdf4ff", border: "#e9d5ff"
    },
    {
      problem: "❌ No course-wise comparison",
      solution: "✅ Per-course rating breakdown — 5 categories mein har course ki average rating visible",
      color: "#fff7ed", border: "#fed7aa"
    },
    {
      problem: "❌ Standard form only",
      solution: "✅ HOD form builder — custom text/rating/choice questions add kar sakta hai apne dept ke liye",
      color: "#f0fdf4", border: "#bbf7d0"
    },
    {
      problem: "❌ No access control on timing",
      solution: "✅ Feedback window system — Admin specific dates pe window khol/band kar sakta hai",
      color: "#fefce8", border: "#fef08a"
    },
  ].map(({ problem, solution, color, border }, i) => {
    const y = 364 + i * 100;
    return `<rect x="40" y="${y}" width="560" height="86" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
    ${textBlock(56, y+22, problem, { fontSize: 12, fill: "#dc2626", maxChars: 60, lineH: 20 })}
    <rect x="640" y="${y}" width="560" height="86" rx="6" fill="${color}" stroke="${border}" stroke-width="1"/>
    ${textBlock(656, y+22, solution, { fontSize: 12, fill: GRN, maxChars: 60, lineH: 20 })}
    <text x="620" y="${y+46}" text-anchor="middle" font-size="20">→</text>`;
  }).join("")}

  ${heading(40, 970, "2.3", "Unique Features Not Found in Typical Systems")}
  <rect x="40" y="1010" width="1160" height="280" rx="6" fill="${LIGHT}" stroke="${MID}" stroke-width="1"/>

  ${[
    ["🎯 Half-Star Drag Rating", "Sirf click nahi — drag karke 0.5 step pe rating set karo. Mouse aur touch dono pe kaam karta hai. Visually engaging aur precise."],
    ["🔐 Reference ID Anonymity", "Har submission pe unique FB-YYYYMMDD-XXXXXX format ka reference ID milta hai. Student apna feedback verify kar sakta hai, koi aur nahi."],
    ["📊 Live HOD Analytics", "HOD dashboard real-time data show karta hai — department average, per-course breakdown, rating category comparison, top/bottom performers."],
    ["🛠️ HOD Form Builder", "HOD apne dashboard se custom questions add/remove kar sakta hai bina developer ke. Fields: short text, long text, single choice, rating scale."],
    ["🔒 Faculty-Course Integrity", "Agar course mein faculty assign nahi hai (Faculty TBA), toh feedback dene pe faculty section optional rehta hai. Assigned courses mein auto-lock hota hai."],
    ["📄 One-Click PDF Report", "HOD 'Download PDF' click kare toh complete department report milti hai — college header, all courses, ratings table, charts, semester info."],
  ].map(([title, desc], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 56 + col * 590, y = 1020 + row * 88;
    return `<text x="${x}" y="${y+16}" font-size="13" font-weight="700" fill="${PRI}">${title}</text>
    ${textBlock(x, y + 32, desc, { fontSize: 11, fill: MUTED, maxChars: 60, lineH: 18 })}`;
  }).join("")}

  ${heading(40, 1306, "2.4", "Comparison with Traditional System")}
  <!-- Table header -->
  <rect x="40" y="1346" width="1160" height="36" rx="4" fill="${PRI}"/>
  <text x="250" y="1369" text-anchor="middle" font-size="12" font-weight="700" fill="white">Feature</text>
  <text x="700" y="1369" text-anchor="middle" font-size="12" font-weight="700" fill="white">Traditional Paper System</text>
  <text x="1060" y="1369" text-anchor="middle" font-size="12" font-weight="700" fill="white">CUPGS Feedback Manager</text>
  <line x1="460" y1="1346" x2="460" y2="${1346+8*38+36}" stroke="#3b82f6" stroke-width="1"/>
  <line x1="860" y1="1346" x2="860" y2="${1346+8*38+36}" stroke="#3b82f6" stroke-width="1"/>

  ${[
    ["Feedback Submission", "Physical form + pen", "Digital web form, any device"],
    ["Anonymity",           "None — handwriting visible", "100% — reference ID only"],
    ["Result Time",         "2–4 weeks manual count", "Instant — real-time dashboard"],
    ["Custom Questions",    "Reprint forms needed", "HOD adds in 1 click"],
    ["Rating System",       "1–5 whole numbers only", "0.5–5.0 half-star drag"],
    ["Report Format",       "Handwritten summary", "Auto-generated PDF report"],
    ["Access Control",      "No timing control", "Admin-controlled windows"],
    ["Data Storage",        "Physical files (losable)", "PostgreSQL — permanent, secure"],
  ].map(([feat, old, neww], i) => {
    const y = 1382 + i * 38;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="38" fill="${bg}"/>
    <text x="60" y="${y+24}" font-size="12" font-weight="600" fill="${SEC}">${feat}</text>
    <text x="480" y="${y+24}" font-size="11" fill="#dc2626">✗ ${old}</text>
    <text x="880" y="${y+24}" font-size="11" fill="${GRN}">✓ ${neww}</text>`;
  }).join("")}
  <rect x="40" y="1346" width="1160" height="${8*38+36}" rx="0" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">3 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — System Architecture & Features
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

  <!-- Architecture Diagram -->
  <!-- Tier 1: Frontend -->
  <rect x="40" y="128" width="1160" height="100" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/>
  <rect x="40" y="128" width="8" height="100" rx="4" fill="${ACC}"/>
  <text x="68" y="156" font-size="13" font-weight="800" fill="${ACC}">TIER 1 — PRESENTATION LAYER (Frontend)</text>
  <text x="68" y="176" font-size="11" fill="${MUTED}">React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui components</text>
  <text x="68" y="196" font-size="11" fill="${MUTED}">Pages: Login · Submit Feedback · HOD Dashboard · Admin Panel · Faculty View</text>
  <text x="68" y="214" font-size="11" fill="${MUTED}">PWA: Installable, Offline-capable, Responsive (Mobile + Desktop + Tablet)</text>

  <text x="620" y="242" text-anchor="middle" font-size="18" fill="${MUTED}">[ REST API -- HTTP/JSON -- Axios ]</text>

  <!-- Tier 2: Backend -->
  <rect x="40" y="254" width="1160" height="100" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/>
  <rect x="40" y="254" width="8" height="100" rx="4" fill="${GRN}"/>
  <text x="68" y="282" font-size="13" font-weight="800" fill="${GRN}">TIER 2 — APPLICATION LAYER (Backend API)</text>
  <text x="68" y="302" font-size="11" fill="${MUTED}">Node.js + Express.js + TypeScript · Runs on PORT 8080</text>
  <text x="68" y="322" font-size="11" fill="${MUTED}">Routes: /api/auth · /api/feedback · /api/departments · /api/courses · /api/faculty · /api/windows</text>
  <text x="68" y="340" font-size="11" fill="${MUTED}">Middleware: Rate Limiting · Session Management · Input Validation (Zod) · Trust Proxy</text>

  <text x="620" y="368" text-anchor="middle" font-size="18" fill="${MUTED}">[ Drizzle ORM -- SQL Queries ]</text>

  <!-- Tier 3: Database -->
  <rect x="40" y="380" width="1160" height="100" rx="8" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="2"/>
  <rect x="40" y="380" width="8" height="100" rx="4" fill="#7c3aed"/>
  <text x="68" y="408" font-size="13" font-weight="800" fill="#7c3aed">TIER 3 — DATA LAYER (Database)</text>
  <text x="68" y="428" font-size="11" fill="${MUTED}">PostgreSQL · 6 Tables · Replit managed database</text>
  <text x="68" y="448" font-size="11" fill="${MUTED}">Tables: departments · courses · faculty · feedback · form_templates · feedback_windows</text>
  <text x="68" y="466" font-size="11" fill="${MUTED}">Features: Real FK constraints · JSONB custom answers · real type for 0.5 ratings</text>

  ${heading(40, 494, "3.2", "Frontend Pages & Routing")}
  <rect x="40" y="534" width="1160" height="360" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>

  ${[
    { route: "/", page: "Login Page", desc: "Role-select karo (Student/Faculty/HOD/Admin) → ID aur PIN enter karo → dashboard pe redirect", color: "#1e3a8a" },
    { route: "/submit-feedback", page: "Submit Feedback", desc: "Course select karo → semester auto-fill → drag-star rating → comments → submit → Ref ID milega", color: "#14532d" },
    { route: "/hod-dashboard", page: "HOD Dashboard", desc: "Department analytics, per-course rating table, PDF download, feedback window toggle, form builder", color: "#065f46" },
    { route: "/admin", page: "Admin Panel", desc: "Institution-wide analytics, all departments overview, course/faculty management, window control", color: "#7c2d12" },
    { route: "/faculty", page: "Faculty View", desc: "Apne assigned courses ka feedback dekho, rating breakdown, student comments (anonymous)", color: "#4c1d95" },
  ].map(({ route, page, desc, color }, i) => {
    const y = 544 + i * 68;
    return `<rect x="56" y="${y}" width="110" height="28" rx="4" fill="${color}"/>
    <text x="111" y="${y+19}" text-anchor="middle" font-size="10" font-weight="700" fill="white">${route}</text>
    <text x="180" y="${y+18}" font-size="13" font-weight="700" fill="${PRI}">${page}</text>
    ${textBlock(180, y+32, desc, { fontSize: 11, fill: MUTED, maxChars: 100, lineH: 17 })}`;
  }).join("")}

  ${heading(40, 908, "3.3", "API Endpoints Overview")}
  <rect x="40" y="948" width="1160" height="36" rx="4" fill="${SEC}"/>
  <text x="160" y="971" text-anchor="middle" font-size="12" font-weight="700" fill="white">Method</text>
  <text x="420" y="971" text-anchor="middle" font-size="12" font-weight="700" fill="white">Endpoint</text>
  <text x="850" y="971" text-anchor="middle" font-size="12" font-weight="700" fill="white">Purpose</text>

  ${[
    ["POST", "/api/auth/login",                   "Student/Faculty/HOD/Admin login", "#0284c7"],
    ["POST", "/api/feedback",                     "Submit anonymous feedback", GRN],
    ["GET",  "/api/feedback/check/:refId",         "Reference ID se apna feedback verify karo", GRN],
    ["GET",  "/api/departments/:id/hod-report",   "HOD analytics data fetch karo", "#7c3aed"],
    ["GET",  "/api/departments/:id/form-template","Custom form template load karo", "#7c3aed"],
    ["POST", "/api/departments/:id/form-template","HOD form save karo", "#7c3aed"],
    ["GET",  "/api/windows",                      "Active feedback windows list", "#d97706"],
    ["POST", "/api/windows",                      "Admin — new window create karo", "#dc2626"],
    ["GET",  "/api/analytics/dashboard",          "Admin institution-wide analytics", "#dc2626"],
    ["GET",  "/api/courses",                      "Courses list with faculty info", "#475569"],
  ].map(([method, endpoint, purpose, color], i) => {
    const y = 984 + i * 38;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="38" fill="${bg}"/>
    <rect x="56" y="${y+7}" width="65" height="24" rx="4" fill="${color}"/>
    <text x="88" y="${y+23}" text-anchor="middle" font-size="11" font-weight="800" fill="white">${method}</text>
    <text x="280" y="${y+24}" font-size="11" font-weight="600" fill="${SEC}" font-family="Courier New,monospace">${endpoint}</text>
    <text x="640" y="${y+24}" font-size="11" fill="${MUTED}">${purpose}</text>`;
  }).join("")}
  <rect x="40" y="948" width="1160" height="${10*38+36}" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  ${heading(40, 1372, "3.4", "Rate Limiting & Security")}
  <rect x="40" y="1412" width="1160" height="280" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${[
    ["🌐 Global Rate Limit", "100 requests per 15 minutes per IP — DoS attack se protection"],
    ["🔐 Auth Rate Limit",   "10 login attempts per 15 minutes — brute force attack prevent"],
    ["📝 Feedback Rate Limit","20 submissions per 10 minutes — spam prevent"],
    ["🔒 Session Security",  "Express-session + SESSION_SECRET environment variable mein store"],
    ["✅ Input Validation",  "Zod schema validation — har route pe type-safe input check"],
    ["🛡️ Trust Proxy",      "app.set('trust proxy', 1) — reverse proxy ke peeche correct IP"],
  ].map(([title, desc], i) => {
    const y = 1422 + i * 44;
    return `<text x="60" y="${y+16}" font-size="13" font-weight="700" fill="${PRI}">${title}</text>
    <text x="280" y="${y+16}" font-size="12" fill="${MUTED}">${desc}</text>
    ${i < 5 ? `<line x1="56" y1="${y+28}" x2="1180" y2="${y+28}" stroke="#e5e7eb" stroke-width="0.8"/>` : ""}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">4 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — User Roles & Access Control
// ═══════════════════════════════════════════════════════════════════════════════
function page5() {
  const roles = [
    {
      title: "STUDENT", icon: "🎓", color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      id: "CUPGS/DEPT/NNN", pin: "4-digit PIN (default: 1234)",
      can: ["Submit anonymous feedback for enrolled courses", "Drag-based half-star rating (0.5 to 5.0)", "Add text comments per category", "Answer HOD's custom questions", "Get unique Reference ID after submit", "Verify own submission via Reference ID"],
      cannot: ["See other students' feedback", "See faculty names in analytics", "Access HOD or Admin panels", "Submit feedback outside active windows"],
    },
    {
      title: "FACULTY", icon: "👨‍🏫", color: "#4c1d95", light: "#fdf4ff", border: "#e9d5ff",
      id: "CUPGS/DEPT/NNN (same format)", pin: "4-digit PIN",
      can: ["View own course feedback analytics", "See average ratings per category", "See anonymous student comments", "Compare own performance across semesters", "View rating distribution charts"],
      cannot: ["Submit feedback", "See which student gave which rating", "Access other faculty's feedback", "Access HOD/Admin features", "Modify any data"],
    },
    {
      title: "HOD", icon: "🧑‍💼", color: "#065f46", light: "#f0fdf4", border: "#bbf7d0",
      id: "HOD/DEPT/001", pin: "DEPT@2025 (e.g., CSE@2025)",
      can: ["View entire department analytics dashboard", "See per-course rating breakdown (5 categories)", "Compare all courses in department", "Download PDF report (one click)", "Customize feedback form (add/remove questions)", "View feedback window status", "See top/bottom performing courses"],
      cannot: ["See individual student responses", "Access other departments' data", "Create/delete courses or faculty", "Modify Admin-level settings"],
    },
    {
      title: "ADMIN", icon: "⚙️", color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      id: "bput@admin2025", pin: "Admin password",
      can: ["Institution-wide analytics dashboard", "All departments combined overview", "Create/edit/delete departments", "Manage courses (add, assign faculty)", "Manage faculty records", "Create/control feedback windows (open/close)", "System-wide configuration"],
      cannot: ["See individual anonymous feedback content", "Override HOD's custom form for a dept"],
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
  <!-- 4 role summary cards -->
  ${roles.map(({ title, icon, color, light, border }, i) => {
    const x = 40 + i * 302;
    return `<rect x="${x}" y="128" width="280" height="80" rx="8" fill="${light}" stroke="${border}" stroke-width="2"/>
    <rect x="${x}" y="128" width="280" height="8" rx="4" fill="${color}"/>
    <text x="${x+140}" y="162" text-anchor="middle" font-size="22">${icon}</text>
    <text x="${x+140}" y="186" text-anchor="middle" font-size="16" font-weight="800" fill="${color}">${title}</text>`;
  }).join("")}

  <!-- Detailed role cards -->
  ${roles.map(({ title, icon, color, light, border, id, pin, can, cannot }, i) => {
    const y = 226 + i * 372;
    const canBullets = bullets(60, y + 84, can.slice(0, 5), color);
    const cannotBullets = bullets(660, y + 84, cannot.slice(0, 4), "#dc2626");
    return `
    <rect x="40" y="${y}" width="1160" height="356" rx="8" fill="${light}" stroke="${border}" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="44" rx="8" fill="${color}"/>
    <text x="60" y="${y+28}" font-size="20">${icon}</text>
    <text x="90" y="${y+28}" font-size="17" font-weight="800" fill="white">${title} ROLE</text>
    <text x="1180" y="${y+28}" text-anchor="end" font-size="12" fill="white">Login: ${id}  |  PIN: ${pin}</text>

    <text x="60" y="${y+68}" font-size="13" font-weight="700" fill="${color}">✅ CAN DO:</text>
    ${canBullets.svg}
    <line x1="630" y1="${y+50}" x2="630" y2="${y+340}" stroke="${border}" stroke-width="1"/>
    <text x="660" y="${y+68}" font-size="13" font-weight="700" fill="#dc2626">❌ CANNOT DO:</text>
    ${cannotBullets.svg}`;
  }).join("")}

  ${heading(40, 1710, "4.2", "Access Matrix Summary")}
  <!-- Compact matrix -->
  <rect x="40" y="1750" width="1160" height="36" rx="4" fill="${SEC}"/>
  ${["Feature", "Student", "Faculty", "HOD", "Admin"].map((h, i) => {
    const x = i === 0 ? 80 : 380 + (i-1)*204;
    return `<text x="${x}" y="1773" font-size="12" font-weight="700" fill="white">${h}</text>`;
  }).join("")}
  ${[
    ["Submit Feedback",         "✅", "❌", "❌", "❌"],
    ["View Own Course Ratings", "❌", "✅", "✅", "✅"],
    ["Dept Analytics",          "❌", "❌", "✅", "✅"],
    ["Download PDF Report",     "❌", "❌", "✅", "✅"],
    ["Custom Form Builder",     "❌", "❌", "✅", "❌"],
    ["Manage Courses/Faculty",  "❌", "❌", "❌", "✅"],
    ["Control Feedback Windows","❌", "❌", "❌", "✅"],
  ].map(([feat, ...vals], i) => {
    const y = 1786 + i * 32;
    const bg = i % 2 === 0 ? "#f8fafc" : "white";
    return `<rect x="40" y="${y}" width="1160" height="32" fill="${bg}"/>
    <text x="80" y="${y+21}" font-size="11" fill="${SEC}">${feat}</text>
    ${vals.map((v, j) => `<text x="${382 + j*204}" y="${y+21}" font-size="14">${v}</text>`).join("")}`;
  }).join("")}
  <rect x="40" y="1750" width="1160" height="${7*32+36}" fill="none" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
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
      num: "5.1", icon: "🔐", title: "Authentication Module",
      color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      desc: "Role-based login system jo different dashboard pe redirect karta hai.",
      steps: [
        "User apna Role select karta hai (Student / Faculty / HOD / Admin)",
        "ID aur PIN/Password enter karta hai",
        "Server ID pattern check karta hai — CUPGS/DEPT/NNN ya HOD/DEPT/001",
        "Valid hone pe session create hota hai, invalid pe error message",
        "Session-based auth — browser close karne pe auto logout",
        "Rate limit: 10 failed attempts per 15 min per IP ke baad block",
      ],
    },
    {
      num: "5.2", icon: "📝", title: "Feedback Submission Module",
      color: "#14532d", light: "#f0fdf4", border: "#bbf7d0",
      desc: "Core module — student ka anonymous feedback collect karta hai.",
      steps: [
        "Student apna Department aur Course select karta hai",
        "Faculty automatically course se assign hoti hai (ya TBA show hota)",
        "Semester aur Academic Year auto-calculate hota hai",
        "Drag-based star rating — 5 categories mein 0.5 step pe",
        "Text comments optional — each category ke liye",
        "HOD ke custom questions (agar configured ho) appear hote hain",
        "Submit pe: server validate → integrity check → store → Ref ID return",
      ],
    },
    {
      num: "5.3", icon: "📊", title: "HOD Analytics & Dashboard Module",
      color: "#065f46", light: "#ecfdf5", border: "#6ee7b7",
      desc: "HOD ka main tool — real-time department performance analytics.",
      steps: [
        "Department summary: total feedback count, overall average rating",
        "Per-course table: har course ki 5-category rating breakdown",
        "Sorting: best/worst performing courses identify karo",
        "Trend view: semester-wise comparison",
        "PDF Report: college header, date, all courses, ratings, download",
        "Form Builder: custom questions add/remove/reorder karo",
        "Window status: active hai ya nahi, dates dikhai deti hain",
      ],
    },
    {
      num: "5.4", icon: "🏛️", title: "Admin Institution Management Module",
      color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      desc: "Admin ka complete control — institution-wide management.",
      steps: [
        "Department-wise analytics summary (all 5 departments)",
        "Highest/lowest rated courses across institution",
        "Course management: add, edit, assign faculty, deactivate",
        "Faculty management: add, edit, department assign",
        "Feedback Window: create with title, dates, dept (or global)",
        "Window control: toggle active/inactive, delete windows",
        "Cross-department comparison analytics",
      ],
    },
  ].map(({ num, icon, title, color, light, border, desc, steps }, i) => {
    const y = 88 + i * 406;
    const stepBullets = bullets(76, y + 174, steps, color);
    return `
    ${heading(40, y, num, title)}
    <rect x="40" y="${y+40}" width="1160" height="358" rx="6" fill="${light}" stroke="${border}" stroke-width="1"/>
    <text x="64" y="${y+64}" font-size="24">${icon}</text>
    <text x="100" y="${y+65}" font-size="14" font-weight="700" fill="${color}">${title}</text>
    ${textBlock(100, y+82, desc, { fontSize: 12, fill: MUTED, maxChars: 110, lineH: 19 })}
    <line x1="56" y1="${y+106}" x2="1184" y2="${y+106}" stroke="${border}" stroke-width="1"/>
    <text x="64" y="${y+126}" font-size="13" font-weight="700" fill="${color}">Step-by-Step Flow:</text>
    ${steps.slice(0, 7).map((s, si) => {
      const sy = y + 142 + si * 30;
      return `<rect x="64" y="${sy-14}" width="24" height="24" rx="12" fill="${color}"/>
      <text x="76" y="${sy+3}" text-anchor="middle" font-size="11" font-weight="800" fill="white">${si+1}</text>
      <text x="100" y="${sy+3}" font-size="12" fill="${SEC}">${s}</text>`;
    }).join("")}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
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
        ["React 18", "UI library — component-based, hooks-based state management"],
        ["TypeScript", "Type-safe JavaScript — compile-time error catching"],
        ["Vite", "Build tool — lightning-fast HMR, optimized production builds"],
        ["Tailwind CSS", "Utility-first CSS — responsive, dark theme, custom design"],
        ["shadcn/ui", "Accessible component library — buttons, cards, dialogs, forms"],
        ["React Query", "Server state management — caching, background updates, loading states"],
        ["React Hook Form", "Form management — validation, error handling, submit state"],
        ["jsPDF + html2canvas", "PDF generation — HOD report, one-click download"],
        ["Framer Motion", "Animations — smooth transitions, drag interactions"],
      ]
    },
    {
      layer: "Backend", color: "#14532d", items: [
        ["Node.js", "JavaScript runtime — non-blocking I/O, event-driven"],
        ["Express.js", "HTTP server framework — routing, middleware, sessions"],
        ["TypeScript", "Type safety on server too — shared types with frontend"],
        ["express-session", "Server-side session management — authentication state"],
        ["express-rate-limit", "API rate limiting — brute force + DoS protection"],
        ["Zod", "Schema validation library — parse and validate all API inputs"],
        ["Pino", "Structured logging — JSON format, production-grade performance"],
      ]
    },
    {
      layer: "Database", color: "#7c2d12", items: [
        ["PostgreSQL", "Relational database — ACID compliant, JSON support, production-grade"],
        ["Drizzle ORM", "Type-safe ORM — schema-first, SQL-like queries, no magic"],
        ["Drizzle Kit", "Database migrations — push schema changes safely"],
        ["JSONB columns", "feedback.custom_answers aur form_templates.fields ke liye"],
        ["real type", "Rating columns 0.5 steps support karne ke liye float precision"],
      ]
    },
    {
      layer: "Infrastructure", color: "#4c1d95", items: [
        ["Replit", "Cloud development + hosting platform"],
        ["pnpm workspaces", "Monorepo — api-server aur bput-feedback packages"],
        ["PWA (Manifest+SW)", "Installable app, offline capability, mobile-optimized"],
        ["Environment secrets", "SESSION_SECRET securely stored, never in code"],
      ]
    },
  ].map(({ layer, color, items }, li) => {
    const y = 128 + li * 370;
    return `<rect x="40" y="${y}" width="1160" height="${items.length * 38 + 48}" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
    <rect x="40" y="${y}" width="1160" height="36" rx="4" fill="${color}20" stroke="${color}40" stroke-width="1"/>
    <text x="60" y="${y+23}" font-size="13" font-weight="800" fill="${color}">${layer.toUpperCase()} STACK</text>
    ${items.map(([tech, desc], i) => {
      const iy = y + 44 + i * 38;
      return `${i > 0 ? `<line x1="56" y1="${iy-4}" x2="1184" y2="${iy-4}" stroke="#e5e7eb" stroke-width="0.5"/>` : ""}
      <rect x="56" y="${iy}" width="120" height="26" rx="4" fill="${color}"/>
      <text x="116" y="${iy+18}" text-anchor="middle" font-size="11" font-weight="700" fill="white">${tech}</text>
      <text x="192" y="${iy+18}" font-size="11" fill="${MUTED}">${desc}</text>`;
    }).join("")}`;
  }).join("")}

  ${heading(40, 1558, "6.2", "UI Design System")}
  <rect x="40" y="1598" width="1160" height="90" rx="6" fill="#0f172a"/>
  <text x="620" y="1628" text-anchor="middle" font-size="14" font-weight="800" fill="white">Dark Glassmorphism Theme</text>
  <text x="620" y="1652" text-anchor="middle" font-size="12" fill="#94a3b8">Background: #0f172a (Slate 900) · Cards: backdrop-blur + rgba white overlay</text>
  <text x="620" y="1674" text-anchor="middle" font-size="12" fill="#94a3b8">Primary: #1e3a8a Blue · Accent: #2563eb · Success: #14532d Green · Error: #dc2626 Red</text>

  <!-- Color swatches -->
  ${[
    ["#0f172a", "Background"], ["#1e293b", "Card BG"], ["#1e3a8a", "Primary"],
    ["#2563eb", "Accent"], ["#14532d", "Success"], ["#7c2d12", "Danger"],
    ["#4c1d95", "Faculty"], ["#065f46", "HOD"], ["#f8fafc", "Light Text"],
  ].map(([color, label], i) => {
    const x = 40 + i * 130, y = 1704;
    return `<rect x="${x}" y="${y}" width="114" height="50" rx="6" fill="${color}" stroke="#374151" stroke-width="1"/>
    <text x="${x+57}" y="${y+68}" text-anchor="middle" font-size="9" fill="${MUTED}">${label}</text>
    <text x="${x+57}" y="${y+80}" text-anchor="middle" font-size="8" fill="${MUTED}">${color}</text>`;
  }).join("")}

  ${heading(40, 1800, "6.3", "PWA Features")}
  <rect x="40" y="1840" width="1160" height="100" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1858, [
    "Installable on Android/iOS/Windows/Mac — 'Add to Home Screen' prompt",
    "Responsive design — works on 320px mobile to 4K desktop screens",
    "Splash screen on app open — CUPGS branding with loading animation",
    "Dark theme optimized — OLED-friendly, reduces eye strain",
  ], ACC).svg}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">7 / 10</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 8 — How To Use (Step by Step)
// ═══════════════════════════════════════════════════════════════════════════════
function page8() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial,Helvetica,sans-serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="72" fill="${PRI}"/>
  <text x="60" y="32" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Management System</text>
  <text x="60" y="54" font-size="20" font-weight="800" fill="white">7. How To Use The System (Step-by-Step)</text>
  <text x="${W-60}" y="42" text-anchor="end" font-size="12" fill="#93c5fd">Page 8 of 10</text>

  ${[
    {
      role: "STUDENT", icon: "🎓", color: "#1e3a8a", light: "#eff6ff", border: "#bfdbfe",
      steps: [
        ["Open App", "Browser mein app URL open karo ya installed PWA launch karo"],
        ["Select Role", "'Student' select karo login page pe"],
        ["Login", "ID: CUPGS/CSE/042 (example), PIN: 1234 → Login karo"],
        ["Select Course", "Department → Course dropdown se apna course choose karo"],
        ["Rate Faculty", "Har category ke liye star rating drag karo (0.5 step mein)"],
        ["Add Comments", "Optional text comments add karo (har category ke liye)"],
        ["Custom Questions", "Agar HOD ne custom questions add kiye hain, unhe bhi fill karo"],
        ["Submit", "'Submit Feedback' button dabao → Reference ID note karo"],
        ["Verify (Optional)", "Reference ID se apna submission verify kar sakte ho"],
      ]
    },
    {
      role: "HOD", icon: "🧑‍💼", color: "#065f46", light: "#f0fdf4", border: "#bbf7d0",
      steps: [
        ["Login", "ID: HOD/CSE/001, Password: CSE@2025"],
        ["Dashboard View", "Department analytics automatically load hogi"],
        ["View Analytics", "Per-course rating table dekho — 5 categories mein breakdown"],
        ["Filter/Sort", "Courses ko sort karo — best/worst performing"],
        ["Download PDF", "'Download PDF Report' click karo — complete report milegi"],
        ["Form Builder", "'Customize Form' section mein custom questions add karo"],
        ["Window Status", "Active feedback window hai ya nahi — dates dekho"],
      ]
    },
    {
      role: "ADMIN", icon: "⚙️", color: "#7c2d12", light: "#fef2f2", border: "#fecaca",
      steps: [
        ["Login", "ID: bput@admin2025, Password enter karo"],
        ["Institution Dashboard", "All departments ka combined analytics dekho"],
        ["Manage Courses", "Course add karo, faculty assign karo, semester set karo"],
        ["Manage Faculty", "Faculty records add/edit/delete karo"],
        ["Feedback Windows", "New window create karo — title, start date, end date set karo"],
        ["Toggle Window", "Window active/inactive karo — students control ho"],
        ["Cross-Dept View", "Sab departments ka performance comparison dekho"],
      ]
    },
    {
      role: "FACULTY", icon: "👨‍🏫", color: "#4c1d95", light: "#fdf4ff", border: "#e9d5ff",
      steps: [
        ["Login", "ID: CUPGS/CSE/101 (example), PIN: 1234"],
        ["My Courses", "Apne assigned courses ki list dekho"],
        ["View Ratings", "Har course ki average rating aur breakdown dekho"],
        ["Read Comments", "Anonymous student comments padhte hain (no names shown)"],
        ["Track Progress", "Semester-wise performance compare karo"],
      ]
    },
  ].map(({ role, icon, color, light, border, steps }, i) => {
    const y = 88 + i * 396;
    return `
    <rect x="40" y="${y}" width="1160" height="380" rx="8" fill="${light}" stroke="${border}" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="48" rx="8" fill="${color}"/>
    <text x="68" y="${y+30}" font-size="22">${icon}</text>
    <text x="100" y="${y+30}" font-size="17" font-weight="800" fill="white">${role} — Step by Step Guide</text>

    ${steps.map(([title, desc], si) => {
      const sx = 56 + (si % 3) * 390;
      const sy = y + 60 + Math.floor(si / 3) * 100;
      return `<rect x="${sx}" y="${sy}" width="370" height="90" rx="6" fill="white" stroke="${border}" stroke-width="1"/>
      <rect x="${sx}" y="${sy}" width="370" height="8" rx="3" fill="${color}"/>
      <rect x="${sx+10}" y="${sy+18}" width="26" height="26" rx="13" fill="${color}"/>
      <text x="${sx+23}" y="${sy+35}" text-anchor="middle" font-size="12" font-weight="800" fill="white">${si+1}</text>
      <text x="${sx+46}" y="${sy+32}" font-size="12" font-weight="700" fill="${color}">${title}</text>
      ${textBlock(sx+46, sy+46, desc, { fontSize: 10, fill: MUTED, maxChars: 42, lineH: 17 })}`;
    }).join("")}`;
  }).join("")}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
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

  ${heading(40, 88, "8.1", "Feedback Submission Data Flow")}

  <!-- Step-by-step flow boxes -->
  <defs>
    <marker id="fl" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto">
      <polygon points="0 0,12 4.5,0 9" fill="#4b5563"/>
    </marker>
  </defs>
  ${[
    { icon: "🖥️", label: "Student submits form", color: "#1e3a8a" },
    { icon: "✅", label: "Frontend validates input\n(required fields, rating range)", color: "#0284c7" },
    { icon: "📡", label: "POST /api/feedback\n(HTTP request with JSON)", color: "#0284c7" },
    { icon: "🛡️", label: "Rate limit check\n(20 req / 10 min)", color: "#d97706" },
    { icon: "🔐", label: "Session auth check\n(is student logged in?)", color: "#7c3aed" },
    { icon: "📋", label: "Zod schema validate\n(type + range check)", color: "#14532d" },
    { icon: "🔒", label: "Course-Faculty integrity\n(dept + assignment check)", color: "#14532d" },
    { icon: "📅", label: "Feedback window check\n(is window active?)", color: "#d97706" },
    { icon: "💾", label: "Store in PostgreSQL\n(feedback table)", color: "#7c2d12" },
    { icon: "🎫", label: "Return Reference ID\n(FB-YYYYMMDD-XXXXXX)", color: "#065f46" },
  ].map(({ icon, label, color }, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 40 + col * 236, y = 128 + row * 140;
    const lines = label.split("\n");
    return `<rect x="${x}" y="${y}" width="216" height="116" rx="8" fill="white" stroke="${color}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="216" height="8" rx="4" fill="${color}"/>
    <text x="${x+108}" y="${y+44}" text-anchor="middle" font-size="28">${icon}</text>
    ${lines.map((l, li) => `<text x="${x+108}" y="${y+72+li*20}" text-anchor="middle" font-size="11" font-weight="${li===0?700:400}" fill="${li===0?color:MUTED}">${l}</text>`).join("")}
    ${col < 4 ? `<line x1="${x+216}" y1="${y+58}" x2="${x+236}" y2="${y+58}" stroke="#4b5563" stroke-width="2" marker-end="url(#fl)"/>` : ""}
    ${col === 4 && row === 0 ? `<path d="M${x+108},${y+116} L${x+108},${y+140}" stroke="#4b5563" stroke-width="2" marker-end="url(#fl)"/>` : ""}`;
  }).join("")}

  ${heading(40, 410, "8.2", "Database Schema — Complete")}
  <!-- Entity relationship quick ref -->
  ${[
    { table: "departments", color: "#1a7a6e", cols: ["id PK", "code UNIQUE", "name", "hod_name", "hod_employee_id", "created_at"] },
    { table: "faculty", color: "#1a7a6e", cols: ["id PK", "department_id FK", "employee_id UNIQUE", "name", "designation", "email", "is_active"] },
    { table: "courses", color: "#1a7a6e", cols: ["id PK", "department_id FK", "faculty_id FK?", "code UNIQUE", "name", "semester", "academic_year", "credits"] },
    { table: "feedback", color: "#92400e", cols: ["id PK", "reference_id UNIQUE", "course_id FK", "faculty_id FK?", "department_id FK", "semester", "5× real ratings", "comments", "custom_answers JSONB"] },
    { table: "form_templates", color: "#6b21a8", cols: ["id PK", "department_id FK UNIQUE", "fields JSONB", "created_at", "updated_at"] },
    { table: "feedback_windows", color: "#6b21a8", cols: ["id PK", "department_id FK?", "title", "is_active", "start_date", "end_date"] },
  ].map(({ table, color, cols }, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 40 + col * 394, y = 450 + row * 250;
    return `<rect x="${x}" y="${y}" width="374" height="${32+cols.length*28}" rx="6" fill="${color}20" stroke="${color}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="374" height="32" rx="6" fill="${color}"/>
    <text x="${x+8}" y="${y+21}" font-size="13" font-weight="800" fill="white">${table}</text>
    ${cols.map((c, ci) => {
      const cy = y + 32 + ci * 28;
      const isKey = c.includes("PK") || c.includes("FK");
      return `${ci > 0 ? `<line x1="${x+4}" y1="${cy}" x2="${x+370}" y2="${cy}" stroke="${color}40" stroke-width="0.8"/>` : ""}
      <text x="${x+12}" y="${cy+19}" font-size="11" fill="${isKey?"#d97706":SEC}" font-weight="${isKey?700:400}">${c}</text>`;
    }).join("")}`;
  }).join("")}

  ${heading(40, 966, "8.3", "Security Measures")}
  <rect x="40" y="1006" width="1160" height="340" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>

  ${[
    ["🔐 Session Management",    "Server-side express-session — SESSION_SECRET environment variable mein, never in code. Browser mein sirf session cookie store hoti hai.", "#1e3a8a"],
    ["⚡ Rate Limiting (3 levels)","Global: 100/15min · Auth: 10/15min · Feedback POST: 20/10min. Trust proxy enabled for correct IP behind reverse proxy.", "#d97706"],
    ["✅ Input Validation",        "Zod schemas har API route pe — types, ranges, required fields. Invalid input pe clear error message, server crash nahi hota.", "#14532d"],
    ["🔒 Anonymous Guarantee",    "Server kabhi student ID aur feedback ID link karke store nahi karta. Reference ID cryptographically unique — guessing se track nahi hota.", "#065f46"],
    ["🛡️ Faculty-Course Integrity","Cross-department feedback manipulation impossible — server course ka department aur student ka department match karta hai.", "#7c3aed"],
    ["📅 Window Enforcement",     "Server-side window check — client-side bypass possible nahi. Server database se active window check karta hai har submission pe.", "#0284c7"],
    ["🔒 No Direct DB Access",    "Database sirf Drizzle ORM ke through access hoti hai. Raw SQL queries nahi — SQL injection practically impossible.", "#4c1d95"],
    ["🌐 CORS + Proxy Config",    "Vite dev proxy configure hai — frontend-backend same origin pe, CORS issues nahi. Production mein Express sirf trusted paths serve karta hai.", "#92400e"],
  ].map(([title, desc, color], i) => {
    const y = 1016 + i * 41;
    return `${i > 0 ? `<line x1="56" y1="${y}" x2="1184" y2="${y}" stroke="#e5e7eb" stroke-width="0.8"/>` : ""}
    <text x="60" y="${y+18}" font-size="12" font-weight="700" fill="${color}">${title}</text>
    ${textBlock(280, y+5, desc, { fontSize: 11, fill: MUTED, maxChars: 95, lineH: 17 })}`;
  }).join("")}

  ${heading(40, 1360, "8.4", "Anonymity Architecture")}
  <rect x="40" y="1400" width="1160" height="290" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
  <text x="60" y="1428" font-size="14" font-weight="800" fill="#92400e">How Anonymity is Guaranteed:</text>
  ${textBlock(60, 1442, "Jab student feedback submit karta hai, server ek cryptographically random Reference ID generate karta hai (format: FB-YYYYMMDD-XXXXXX). Yeh ID feedback record mein store hoti hai, lekin student ka login ID (CUPGS/CSE/042) kabhi feedback table mein store nahi hota.", { fontSize: 12, fill: SEC, maxChars: 115, lineH: 20 })}

  <rect x="60" y="1496" width="1100" height="60" rx="6" fill="white" stroke="#fde68a" stroke-width="1"/>
  <text x="80" y="1522" font-size="12" font-weight="700" fill="#92400e">What is STORED in feedback table:</text>
  <text x="80" y="1542" font-size="11" fill="${MUTED}">reference_id, course_id, department_id, semester, academic_year, student_year, section, ratings, comments, custom_answers</text>

  <rect x="60" y="1566" width="1100" height="60" rx="6" fill="white" stroke="#fde68a" stroke-width="1"/>
  <text x="80" y="1592" font-size="12" font-weight="700" fill="#dc2626">What is NEVER STORED in feedback table:</text>
  <text x="80" y="1612" font-size="11" fill="${MUTED}">student_id, employee_id, name, login credentials, IP address, browser info — NOTHING that identifies the student</text>

  <text x="60" y="1650" font-size="12" fill="${GRN}" font-weight="600">✅ Even the developer / DBA cannot trace feedback back to a specific student.</text>
  <text x="60" y="1670" font-size="12" fill="${GRN}" font-weight="600">✅ Student can verify OWN feedback using their Reference ID — but others cannot use it to identify them.</text>

  ${heading(40, 1698, "8.5", "Error Handling")}
  <rect x="40" y="1738" width="1160" height="100" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1752, [
    "Validation errors: 400 Bad Request with field-specific error messages from Zod",
    "Auth errors: 401 Unauthorized — session invalid ya expired",
    "Rate limit hit: 429 Too Many Requests — retry-after header included",
    "Server errors: 500 Internal Server Error — logged with Pino, user gets generic message (no stack trace exposed)",
  ], "#dc2626").svg}

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
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
  <rect x="40" y="128" width="1160" height="160" rx="8" fill="${LIGHT}" stroke="${MID}" stroke-width="1.5"/>
  ${textBlock(60, 150, "CUPGS Academic Feedback Manager ek complete full-stack web application hai jo BPUT Rourkela ke CUPGS department ke liye specially design kiya gaya hai. Iska main purpose hai ki students apne courses aur faculty ke baare mein honest, anonymous feedback de sakein — bina kisi fear ke — aur HOD is data ko real-time analytics aur professional PDF reports mein dekh sakein.", { fontSize: 13, fill: SEC, maxChars: 110, lineH: 23 })}
  ${textBlock(60, 244, "System mein 4 roles hain — Student, Faculty, HOD, Admin. Har role ke liye alag dashboard aur permissions hain. Data PostgreSQL mein securely store hota hai, aur anonymity guarantee ki gayi hai reference ID system se.", { fontSize: 13, fill: SEC, maxChars: 110, lineH: 23 })}

  ${heading(40, 306, "9.2", "What Was Achieved (Key Deliverables)")}
  <rect x="40" y="346" width="1160" height="300" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>

  ${[
    ["✅ Anonymous Feedback System",   "Students kisi bhi device se feedback de sakte hain, 100% anonymously"],
    ["✅ Half-Star Drag Rating",        "5 categories mein 0.5-step precise ratings — better data quality"],
    ["✅ Real-time HOD Dashboard",     "Department analytics, per-course comparison, instant visibility"],
    ["✅ One-click PDF Reports",       "HOD ko manual work se mukti — complete PDF ek click mein"],
    ["✅ HOD Form Builder",            "Custom questions bina developer ke — HOD apne hisaab se form customize kar sakta hai"],
    ["✅ Faculty-Course Integrity",    "Cross-department fraud prevent — system automatically validate karta hai"],
    ["✅ Admin Institution Control",   "Centralized management — departments, courses, faculty, windows sab ek jagah"],
    ["✅ Feedback Window System",      "Time-controlled feedback collection — Admin ke haath mein complete control"],
    ["✅ Progressive Web App (PWA)",   "Installable, responsive, mobile-friendly — koi app store nahi chahiye"],
    ["✅ Rate Limiting + Security",    "Production-grade security — brute force, DoS, SQL injection protection"],
  ].map(([title, desc], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 56 + col * 580, y = 356 + row * 56;
    return `<text x="${x}" y="${y+20}" font-size="13" font-weight="700" fill="${GRN}">${title}</text>
    <text x="${x}" y="${y+38}" font-size="11" fill="${MUTED}">${desc}</text>
    ${i < 8 && i % 2 === 1 ? `<line x1="56" y1="${y+48}" x2="1184" y2="${y+48}" stroke="#e5e7eb" stroke-width="0.6"/>` : ""}`;
  }).join("")}

  ${heading(40, 664, "9.3", "Future Scope & Enhancements")}
  ${[
    {
      phase: "Phase 2 — Short Term", color: "#1e3a8a",
      items: [
        "Email notifications — HOD ko automatically report milegi semester end pe",
        "Graphical charts in PDF — bar charts, radar charts for visual comparison",
        "Student feedback history — apne purane submissions dekho (via Ref IDs)",
        "Multi-language support — Odia, Hindi mein bhi available ho",
        "Bulk course import — Excel se courses directly import karo",
      ]
    },
    {
      phase: "Phase 3 — Medium Term", color: "#065f46",
      items: [
        "AI-powered sentiment analysis — comments pe automatic positive/negative tagging",
        "Trend analysis — semester-over-semester performance graphs for faculty",
        "Mobile app (React Native) — iOS aur Android native app",
        "Comparison benchmarking — national/state level comparison with similar institutions",
        "Automated action triggers — low rating pe HOD ko auto-alert system",
      ]
    },
    {
      phase: "Phase 4 — Long Term", color: "#7c3aed",
      items: [
        "Institution network — multiple colleges ek platform pe",
        "NAAC/NIRF integration — feedback data directly NAAC reports ke liye exportable",
        "Predictive analytics — ML model se at-risk courses early identify karo",
        "Video feedback — students short video testimonials de sakein (anonymous)",
        "Blockchain anonymity — on-chain proof of anonymity for ultimate trust",
      ]
    },
  ].map(({ phase, color, items }, i) => {
    const y = 704 + i * 256;
    return `<rect x="40" y="${y}" width="1160" height="240" rx="8" fill="${color}10" stroke="${color}40" stroke-width="1.5"/>
    <rect x="40" y="${y}" width="1160" height="36" rx="8" fill="${color}"/>
    <text x="60" y="${y+24}" font-size="14" font-weight="800" fill="white">${phase}</text>
    ${bullets(60, y+46, items, color).svg}`;
  }).join("")}

  ${heading(40, 1472, "9.4", "Technical Lessons & Best Practices Used")}
  <rect x="40" y="1512" width="1160" height="180" rx="6" fill="#fafafa" stroke="#e5e7eb" stroke-width="1"/>
  ${bullets(60, 1526, [
    "Monorepo structure (pnpm workspaces) — frontend aur backend ek sath manage",
    "Type safety end-to-end — TypeScript + Zod + Drizzle = zero runtime type errors in theory",
    "Separation of concerns — API routes, business logic, database layer alag-alag",
    "Security by default — rate limiting, session management, input validation from day 1",
    "DRY principle — shared types between frontend and backend",
    "Git-based version control — every feature is a checkpoint",
  ], ACC).svg}

  <!-- Final Stats Banner -->
  <rect x="40" y="1710" width="1160" height="120" rx="12" fill="${PRI}"/>
  <text x="620" y="1740" text-anchor="middle" font-size="16" font-weight="800" fill="white">Project At A Glance</text>
  ${[
    ["6", "DB Tables"],
    ["10+", "API Routes"],
    ["4", "User Roles"],
    ["5", "Departments"],
    ["268+", "Courses"],
    ["5", "Rating Types"],
    ["100%", "Anon."],
    ["PWA", "Platform"],
  ].map(([v, l], i) => {
    const x = 80 + i * 142;
    return `<rect x="${x}" y="1754" width="120" height="64" rx="6" fill="#ffffff15"/>
    <text x="${x+60}" y="1784" text-anchor="middle" font-size="22" font-weight="900" fill="white">${v}</text>
    <text x="${x+60}" y="1806" text-anchor="middle" font-size="10" fill="#93c5fd">${l}</text>`;
  }).join("")}

  <!-- End Banner -->
  <rect x="40" y="1848" width="1160" height="80" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
  <text x="620" y="1880" text-anchor="middle" font-size="16" font-weight="800" fill="${GRN}">— End of Project Documentation —</text>
  <text x="620" y="1904" text-anchor="middle" font-size="12" fill="${MUTED}">CUPGS Academic Feedback Manager · BPUT Rourkela · Academic Year 2024-25</text>

  <rect x="0" y="${H-40}" width="${W}" height="40" fill="${SEC}"/>
  <text x="620" y="${H-16}" text-anchor="middle" font-size="10" fill="#475569">CUPGS Feedback Manager — Project Documentation</text>
  <text x="${W-40}" y="${H-16}" text-anchor="end" font-size="10" fill="#475569">10 / 10</text>
</svg>`;
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

// Strip emoji / surrogate-pair characters that RSVG cannot handle
const EMOJI_MAP = {
  "\u2705": "[OK]",   "\u274C": "[NO]",   "\u2714": "[Y]",    "\u2716": "[N]",
  "\u2713": "[Y]",    "\u2717": "[N]",    "\u2611": "[Y]",    "\u274E": "[N]",
  "\u2728": "[*]",    "\u2733": "[*]",    "\u2734": "[*]",    "\u2022": "-",
  "\u2023": "-",      "\u2024": ".",      "\u2025": "..",     "\u2026": "...",
  "\u2015": "-",      "\u2018": "'",      "\u2019": "'",      "\u201C": '"',
  "\u201D": '"',
};
function stripEmoji(svg) {
  // First do known emoji replacements
  let out = svg;
  for (const [k, v] of Object.entries(EMOJI_MAP)) {
    out = out.split(k).join(v);
  }
  // Strip all chars outside safe XML/Latin range
  out = out.replace(/[^\x00-\u024F\u2013\u2014\u00B7\u2264\u2265]/g, (ch) => {
    const cp = ch.codePointAt(0);
    if (cp >= 0x2010 && cp <= 0x2027) return ch;
    return "";
  });
  // Fix unescaped & in text content — replace & that is NOT already &amp; &lt; &gt; &quot; &apos; &#nnn;
  out = out.replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, "&amp;");
  return out;
}

console.log("Generating project documentation PDF...");
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
execSync(`magick ${pngs.map(p=>`"${p}"`).join(" ")} "${outPdf}"`, { stdio: "pipe" });
console.log(`\nPDF ready: exports/CUPGS-Project-Documentation.pdf  (${pages.length} pages)`);
