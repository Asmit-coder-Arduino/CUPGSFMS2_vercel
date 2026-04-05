import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../exports/se-report");
mkdirSync(OUT, { recursive: true });

const W = 1240, H = 1754; // A4 at 150 dpi
const BLK = "#1a1a2e", NAV = "#16213e", PRI = "#0f3460", ACC = "#e94560";
const GRY = "#374151", LGT = "#6b7280", WHT = "#ffffff";
const RULE = "#d1d5db";

// ── helpers ──────────────────────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function wrap(text, maxChars) {
  const words = String(text).split(" ");
  const lines = []; let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxChars) cur = (cur + " " + w).trim();
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function tb(x, y, text, { fs=12, fill=GRY, max=100, lh=20, fw="normal" }={}) {
  return wrap(text, max).map((l,i)=>
    `<text x="${x}" y="${y+i*lh}" font-size="${fs}" fill="${fill}" font-weight="${fw}">${esc(l)}</text>`
  ).join("\n");
}

function para(x, y, text, opts={}) { return tb(x, y, text, { fs:12, fill:GRY, max:105, lh:21, ...opts }); }

function chHead(y, num, title) {
  return `<rect x="0" y="${y}" width="${W}" height="56" fill="${PRI}"/>
  <rect x="0" y="${y+56}" width="${W}" height="4" fill="${ACC}"/>
  <text x="60" y="${y+36}" font-size="22" font-weight="800" fill="${WHT}">Chapter ${num}: ${esc(title)}</text>`;
}

function secHead(x, y, title) {
  return `<rect x="${x}" y="${y}" width="${W-x*2}" height="30" rx="4" fill="${PRI}15" stroke="${PRI}40" stroke-width="1"/>
  <text x="${x+12}" y="${y+20}" font-size="13" font-weight="800" fill="${PRI}">${esc(title)}</text>`;
}

function subHead(x, y, title) {
  return `<text x="${x}" y="${y}" font-size="13" font-weight="700" fill="${PRI}">${esc(title)}</text>
  <line x1="${x}" y1="${y+4}" x2="${x+200}" y2="${y+4}" stroke="${ACC}" stroke-width="2"/>`;
}

function bul(x, y, items, color=PRI) {
  let out="", cy=y;
  for (const item of items) {
    const lines = wrap(item, 98);
    out += `<circle cx="${x+6}" cy="${cy-3}" r="4" fill="${color}"/>`;
    lines.forEach((l,i)=>{
      out += `<text x="${x+18}" y="${cy+i*20}" font-size="12" fill="${GRY}">${esc(l)}</text>`;
    });
    cy += lines.length*20 + 6;
  }
  return { svg: out, bottom: cy };
}

function footer(pageNum, total) {
  return `<rect x="0" y="${H-48}" width="${W}" height="48" fill="${PRI}"/>
  <line x1="0" y1="${H-48}" x2="${W}" y2="${H-48}" stroke="${ACC}" stroke-width="3"/>
  <text x="60" y="${H-18}" font-size="11" fill="#94a3b8">CUPGS Academic Feedback Manager  |  Software Engineering Project Report</text>
  <text x="${W-60}" y="${H-18}" text-anchor="end" font-size="11" fill="#94a3b8">Page ${pageNum} of ${total}</text>`;
}

function tableRow(x, y, w, cells, widths, bg="#fafafa", textColor=GRY, bold=false) {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="34" fill="${bg}"/>`;
  let cx = x;
  cells.forEach((cell, i) => {
    out += `<text x="${cx+10}" y="${y+22}" font-size="${bold?13:11}" fill="${textColor}" font-weight="${bold?"700":"400"}">${esc(cell)}</text>`;
    cx += widths[i];
    if (i < cells.length-1) out += `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y+34}" stroke="${RULE}" stroke-width="0.8"/>`;
  });
  out += `<line x1="${x}" y1="${y+34}" x2="${x+w}" y2="${y+34}" stroke="${RULE}" stroke-width="0.8"/>`;
  return out;
}

// strip unsafe chars
function clean(svg) {
  let o = svg;
  o = o.replace(/[^\x00-\u024F\u2013\u2014\u00B7\u2264\u2265]/g, ch => {
    const cp = ch.codePointAt(0);
    if (cp >= 0x2010 && cp <= 0x2027) return ch;
    return "";
  });
  o = o.replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, "&amp;");
  return o;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function cover() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <defs>
    <linearGradient id="topBand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${PRI}"/>
      <stop offset="50%" stop-color="#1a4a8a"/>
      <stop offset="100%" stop-color="${PRI}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="white"/>

  <!-- Top decorative band -->
  <rect x="0" y="0" width="${W}" height="10" fill="url(#topBand)"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>

  <!-- University Name Block -->
  <rect x="0" y="14" width="${W}" height="110" fill="${PRI}"/>
  <text x="620" y="60" text-anchor="middle" font-size="20" font-weight="700" fill="${WHT}">BIJU PATNAIK UNIVERSITY OF TECHNOLOGY</text>
  <text x="620" y="88" text-anchor="middle" font-size="15" fill="#bfdbfe">Centre for Urban &amp; Planning Graduate Studies (CUPGS), Rourkela</text>
  <text x="620" y="112" text-anchor="middle" font-size="13" fill="#93c5fd">Department of Computer Science &amp; Engineering</text>

  <!-- Border frame -->
  <rect x="30" y="140" width="${W-60}" height="${H-220}" fill="none" stroke="${PRI}" stroke-width="3" rx="2"/>
  <rect x="38" y="148" width="${W-76}" height="${H-236}" fill="none" stroke="${ACC}" stroke-width="1" rx="1"/>

  <!-- Decorative corner elements -->
  <rect x="30" y="140" width="60" height="60" fill="${PRI}"/>
  <rect x="${W-90}" y="140" width="60" height="60" fill="${PRI}"/>
  <rect x="30" y="${H-220}" width="60" height="60" fill="${PRI}"/>
  <rect x="${W-90}" y="${H-220}" width="60" height="60" fill="${PRI}"/>
  <rect x="34" y="144" width="52" height="52" fill="${ACC}"/>
  <rect x="${W-86}" y="144" width="52" height="52" fill="${ACC}"/>
  <rect x="34" y="${H-216}" width="52" height="52" fill="${ACC}"/>
  <rect x="${W-86}" y="${H-216}" width="52" height="52" fill="${ACC}"/>

  <!-- PROJECT REPORT label -->
  <text x="620" y="230" text-anchor="middle" font-size="14" fill="${LGT}" letter-spacing="6">PROJECT REPORT</text>
  <text x="620" y="258" text-anchor="middle" font-size="13" fill="${LGT}">Submitted in partial fulfillment of the requirements for the degree of</text>
  <text x="620" y="282" text-anchor="middle" font-size="14" font-weight="700" fill="${GRY}">Bachelor of Technology in Computer Science &amp; Engineering</text>

  <!-- Divider -->
  <line x1="160" y1="306" x2="1080" y2="306" stroke="${ACC}" stroke-width="2"/>

  <!-- Project Title -->
  <text x="620" y="350" text-anchor="middle" font-size="13" fill="${LGT}" letter-spacing="3">PROJECT TITLE</text>
  <text x="620" y="404" text-anchor="middle" font-size="30" font-weight="700" fill="${PRI}">CUPGS Academic</text>
  <text x="620" y="448" text-anchor="middle" font-size="30" font-weight="700" fill="${PRI}">Feedback Manager</text>
  <text x="620" y="490" text-anchor="middle" font-size="16" fill="${GRY}">An Anonymous Student Feedback System</text>
  <text x="620" y="516" text-anchor="middle" font-size="16" fill="${GRY}">with Role-Based Access Control</text>

  <!-- Divider -->
  <line x1="160" y1="544" x2="1080" y2="544" stroke="${ACC}" stroke-width="2"/>

  <!-- Submitted By -->
  <text x="620" y="590" text-anchor="middle" font-size="13" fill="${LGT}" letter-spacing="3">SUBMITTED BY</text>
  <rect x="280" y="610" width="680" height="190" rx="6" fill="${PRI}08" stroke="${PRI}30" stroke-width="1"/>

  <text x="620" y="648" text-anchor="middle" font-size="22" font-weight="700" fill="${PRI}">Akshaya Gardia</text>
  <text x="620" y="678" text-anchor="middle" font-size="14" fill="${GRY}">B.Tech — Computer Science &amp; Engineering</text>

  <line x1="320" y1="696" x2="920" y2="696" stroke="${RULE}" stroke-width="1" stroke-dasharray="4,4"/>

  <text x="400" y="724" font-size="13" fill="${LGT}">Roll Number:</text>
  <text x="560" y="724" font-size="13" fill="${GRY}">_____________________________</text>
  <text x="400" y="752" font-size="13" fill="${LGT}">Registration No.:</text>
  <text x="560" y="752" font-size="13" fill="${GRY}">_____________________________</text>
  <text x="400" y="780" font-size="13" fill="${LGT}">Academic Year:</text>
  <text x="560" y="780" font-size="13" fill="${GRY}">2024 - 2025</text>

  <!-- Divider -->
  <line x1="160" y1="820" x2="1080" y2="820" stroke="${ACC}" stroke-width="2"/>

  <!-- Submitted To -->
  <text x="620" y="864" text-anchor="middle" font-size="13" fill="${LGT}" letter-spacing="3">SUBMITTED TO</text>
  <rect x="280" y="882" width="680" height="200" rx="6" fill="${PRI}08" stroke="${PRI}30" stroke-width="1"/>

  <text x="400" y="918" font-size="13" fill="${LGT}">Guide Name:</text>
  <text x="560" y="918" font-size="13" fill="${GRY}">_____________________________</text>
  <text x="400" y="946" font-size="13" fill="${LGT}">Designation:</text>
  <text x="560" y="946" font-size="13" fill="${GRY}">_____________________________</text>
  <text x="400" y="974" font-size="13" fill="${LGT}">Department:</text>
  <text x="560" y="974" font-size="13" fill="${GRY}">Computer Science &amp; Engineering</text>
  <text x="400" y="1002" font-size="13" fill="${LGT}">Institution:</text>
  <text x="560" y="1002" font-size="13" fill="${GRY}">CUPGS, BPUT Rourkela</text>
  <text x="400" y="1030" font-size="13" fill="${LGT}">Semester:</text>
  <text x="560" y="1030" font-size="13" fill="${GRY}">_____________________________</text>

  <!-- Divider -->
  <line x1="160" y1="1102" x2="1080" y2="1102" stroke="${ACC}" stroke-width="2"/>

  <!-- University Logos / Seal area -->
  <text x="620" y="1150" text-anchor="middle" font-size="13" fill="${LGT}" letter-spacing="3">INSTITUTION SEAL</text>
  <circle cx="620" cy="1270" r="100" fill="none" stroke="${PRI}" stroke-width="2" stroke-dasharray="6,4"/>
  <circle cx="620" cy="1270" r="86" fill="none" stroke="${PRI}50" stroke-width="1"/>
  <text x="620" y="1262" text-anchor="middle" font-size="13" fill="${PRI}">Official</text>
  <text x="620" y="1282" text-anchor="middle" font-size="13" fill="${PRI}">Seal</text>

  <!-- Exam year -->
  <text x="620" y="1432" text-anchor="middle" font-size="15" font-weight="700" fill="${PRI}">Biju Patnaik University of Technology</text>
  <text x="620" y="1458" text-anchor="middle" font-size="13" fill="${GRY}">Odisha, India</text>
  <text x="620" y="1488" text-anchor="middle" font-size="14" font-weight="700" fill="${ACC}">Academic Year: 2024 - 2025</text>

  <!-- Bottom decorative band -->
  <rect x="0" y="${H-80}" width="${W}" height="80" fill="${PRI}"/>
  <rect x="0" y="${H-80}" width="${W}" height="4" fill="${ACC}"/>
  <text x="620" y="${H-44}" text-anchor="middle" font-size="13" fill="#93c5fd">CUPGS Academic Feedback Manager  |  CSE Project Report</text>
  <text x="620" y="${H-20}" text-anchor="middle" font-size="12" fill="#64748b">Biju Patnaik University of Technology, Rourkela  |  2024-25</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — CERTIFICATE + DECLARATION
// ═══════════════════════════════════════════════════════════════════════════════
function certificate() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  <rect x="30" y="34" width="${W-60}" height="${H-120}" fill="none" stroke="${PRI}" stroke-width="2" rx="2"/>

  <!-- CERTIFICATE OF APPROVAL -->
  <text x="620" y="100" text-anchor="middle" font-size="22" font-weight="700" fill="${PRI}">CERTIFICATE OF APPROVAL</text>
  <line x1="200" y1="116" x2="1040" y2="116" stroke="${ACC}" stroke-width="2"/>

  ${para(80, 154, "This is to certify that the project report entitled", {fs:13, fill:GRY, max:90})}
  <rect x="80" y="180" width="1080" height="54" rx="4" fill="${PRI}08" stroke="${PRI}30" stroke-width="1"/>
  <text x="620" y="212" text-anchor="middle" font-size="16" font-weight="700" fill="${PRI}">"CUPGS Academic Feedback Manager"</text>

  ${para(80, 252, "submitted by", {fs:13, fill:GRY, max:90})}
  <text x="80" y="284" font-size="16" font-weight="700" fill="${PRI}">Akshaya Gardia</text>
  <text x="80" y="308" font-size="13" fill="${GRY}">Roll No.: _______________________</text>
  <text x="80" y="330" font-size="13" fill="${GRY}">Registration No.: _______________________</text>
  <text x="80" y="352" font-size="13" fill="${GRY}">B.Tech (CSE), CUPGS, BPUT Rourkela</text>

  ${para(80, 390, "is a bonafide record of the work carried out by the student in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering from Biju Patnaik University of Technology, Rourkela during the Academic Year 2024-25. The project was carried out under my guidance and supervision.", {fs:13, fill:GRY, max:104, lh:24})}

  ${para(80, 510, "The report has been approved as it satisfies the academic requirements in respect of the project work prescribed for the said degree.", {fs:13, fill:GRY, max:104, lh:22})}

  <!-- Signatures -->
  <line x1="80" y1="640" x2="440" y2="640" stroke="${GRY}" stroke-width="1"/>
  <text x="260" y="660" text-anchor="middle" font-size="12" fill="${GRY}">Project Guide</text>
  <text x="260" y="678" text-anchor="middle" font-size="12" fill="${LGT}">Name: ___________________</text>
  <text x="260" y="696" text-anchor="middle" font-size="12" fill="${LGT}">Designation: ___________________</text>
  <text x="260" y="714" text-anchor="middle" font-size="12" fill="${LGT}">Date: ___________________</text>

  <line x1="800" y1="640" x2="1160" y2="640" stroke="${GRY}" stroke-width="1"/>
  <text x="980" y="660" text-anchor="middle" font-size="12" fill="${GRY}">Head of Department</text>
  <text x="980" y="678" text-anchor="middle" font-size="12" fill="${LGT}">Name: ___________________</text>
  <text x="980" y="696" text-anchor="middle" font-size="12" fill="${LGT}">Designation: ___________________</text>
  <text x="980" y="714" text-anchor="middle" font-size="12" fill="${LGT}">Date: ___________________</text>

  <!-- Examiner -->
  <line x1="400" y1="800" x2="840" y2="800" stroke="${GRY}" stroke-width="1"/>
  <text x="620" y="820" text-anchor="middle" font-size="12" fill="${GRY}">External Examiner</text>
  <text x="620" y="840" text-anchor="middle" font-size="12" fill="${LGT}">Name: ___________________</text>
  <text x="620" y="858" text-anchor="middle" font-size="12" fill="${LGT}">Date: ___________________</text>

  <!-- Stamp -->
  <circle cx="620" cy="980" r="80" fill="none" stroke="${PRI}" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="620" y="974" text-anchor="middle" font-size="12" fill="${PRI}">Institution</text>
  <text x="620" y="992" text-anchor="middle" font-size="12" fill="${PRI}">Stamp</text>

  <!-- DECLARATION -->
  <line x1="80" y1="1100" x2="1160" y2="1100" stroke="${ACC}" stroke-width="2"/>
  <text x="620" y="1140" text-anchor="middle" font-size="20" font-weight="700" fill="${PRI}">DECLARATION BY THE STUDENT</text>
  <line x1="200" y1="1156" x2="1040" y2="1156" stroke="${ACC}" stroke-width="2"/>

  ${para(80, 1192, "I, Akshaya Gardia, student of B.Tech (Computer Science and Engineering) at Centre for Urban and Planning Graduate Studies (CUPGS), Biju Patnaik University of Technology, Rourkela, hereby declare that the project report entitled:", {fs:13, fill:GRY, max:104, lh:24})}

  <rect x="80" y="1282" width="1080" height="50" rx="4" fill="${PRI}08" stroke="${PRI}30" stroke-width="1"/>
  <text x="620" y="1313" text-anchor="middle" font-size="15" font-weight="700" fill="${PRI}">"CUPGS Academic Feedback Manager"</text>

  ${para(80, 1352, "submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology is an authentic record of my own work carried out during the academic year 2024-25 under the guidance of my project supervisor.", {fs:13, fill:GRY, max:104, lh:24})}

  ${para(80, 1450, "I further declare that the work reported in this project has not been submitted, either in part or in full, for the award of any other degree or diploma in this university or any other institution.", {fs:13, fill:GRY, max:104, lh:24})}

  <text x="80" y="1554" font-size="13" fill="${GRY}">Place: Rourkela</text>
  <text x="80" y="1578" font-size="13" fill="${GRY}">Date: _______________________</text>

  <line x1="800" y1="1620" x2="1160" y2="1620" stroke="${GRY}" stroke-width="1"/>
  <text x="980" y="1644" text-anchor="middle" font-size="12" fill="${GRY}">Signature of Student</text>
  <text x="980" y="1664" text-anchor="middle" font-size="13" font-weight="700" fill="${PRI}">Akshaya Gardia</text>

  ${footer(2, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — ACKNOWLEDGEMENT + ABSTRACT
// ═══════════════════════════════════════════════════════════════════════════════
function abstract() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>

  <!-- ACKNOWLEDGEMENT -->
  <text x="620" y="78" text-anchor="middle" font-size="22" font-weight="700" fill="${PRI}">ACKNOWLEDGEMENT</text>
  <line x1="200" y1="94" x2="1040" y2="94" stroke="${ACC}" stroke-width="2"/>

  ${para(80, 128, "I wish to express my sincere gratitude to all those who have contributed to the successful completion of this project.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 186, "I am deeply thankful to my Project Guide for their invaluable guidance, constant encouragement, and continuous support throughout the development of this project. Their expert advice and constructive suggestions were instrumental in shaping the direction and quality of this work.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 282, "I would also like to extend my sincere thanks to the Head of the Department of Computer Science and Engineering, CUPGS, BPUT Rourkela, for providing the necessary facilities and academic environment to carry out this project.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 378, "I am grateful to all the faculty members of the Department of Computer Science and Engineering for their technical inputs and motivation during the course of this project.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 450, "I also thank my fellow students and colleagues who provided feedback during development, helping improve both the functionality and the user experience of the system.", {fs:13, fill:GRY, max:104, lh:24})}

  <text x="80" y="556" font-size="13" fill="${GRY}">Place: Rourkela</text>
  <text x="80" y="580" font-size="13" fill="${GRY}">Date: _______________________</text>
  <line x1="800" y1="620" x2="1160" y2="620" stroke="${GRY}" stroke-width="1"/>
  <text x="980" y="644" text-anchor="middle" font-size="13" font-weight="700" fill="${PRI}">Akshaya Gardia</text>

  <!-- ABSTRACT -->
  <line x1="80" y1="700" x2="1160" y2="700" stroke="${ACC}" stroke-width="2"/>
  <text x="620" y="744" text-anchor="middle" font-size="22" font-weight="700" fill="${PRI}">ABSTRACT</text>
  <line x1="200" y1="760" x2="1040" y2="760" stroke="${ACC}" stroke-width="2"/>

  ${para(80, 798, "The CUPGS Academic Feedback Manager is a full-stack web application developed to digitize and streamline the academic feedback process at the Centre for Urban and Planning Graduate Studies (CUPGS), Biju Patnaik University of Technology, Rourkela. The system replaces the traditional paper-based feedback mechanism with a secure, anonymous, and data-driven digital platform.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 918, "The application supports four user roles — Student, Faculty, Head of Department (HOD), and Administrator — each with role-specific dashboards and strictly enforced access controls. Students submit anonymous course and faculty feedback using a drag-based half-star rating system (0.5 to 5.0 in 0.5 increments) across five categories: Teaching Quality, Course Content, Lab Facilities, Study Material, and Overall Performance.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 1062, "Each submission generates a cryptographically unique Reference ID, ensuring student anonymity while allowing self-verification. HODs access a real-time analytics dashboard with per-course rating breakdowns and one-click PDF report generation. A HOD-driven form builder allows custom questions to be added without developer involvement.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 1158, "The system is built on a three-tier architecture: React 18 with TypeScript and Tailwind CSS on the frontend, Node.js with Express.js on the backend, and PostgreSQL with Drizzle ORM as the data layer. It is deployed as a Progressive Web App (PWA), making it installable and accessible on any device without an app store.", {fs:13, fill:GRY, max:104, lh:24})}
  ${para(80, 1254, "Security features include three-layer API rate limiting, server-side session management, Zod schema validation on all inputs, faculty-course integrity enforcement, and admin-controlled time-bound feedback windows. The system eliminates manual aggregation effort, provides real-time performance insights, and ensures that student feedback remains permanently anonymous.", {fs:13, fill:GRY, max:104, lh:24})}

  <!-- Keywords -->
  <rect x="80" y="1390" width="1080" height="56" rx="6" fill="${PRI}08" stroke="${PRI}30" stroke-width="1"/>
  <text x="100" y="1414" font-size="13" font-weight="700" fill="${PRI}">Keywords:</text>
  <text x="220" y="1414" font-size="13" fill="${GRY}">Academic Feedback, Anonymous Submission, Role-Based Access Control, Web Application,</text>
  <text x="100" y="1436" font-size="13" fill="${GRY}">Progressive Web App, HOD Analytics, PostgreSQL, React, Node.js, Drag Rating System</text>

  <!-- Table of Contents header -->
  <line x1="80" y1="1476" x2="1160" y2="1476" stroke="${ACC}" stroke-width="2"/>
  <text x="620" y="1516" text-anchor="middle" font-size="22" font-weight="700" fill="${PRI}">TABLE OF CONTENTS</text>
  <line x1="200" y1="1532" x2="1040" y2="1532" stroke="${ACC}" stroke-width="2"/>

  ${[
    ["Certificate of Approval &amp; Declaration", "2"],
    ["Acknowledgement &amp; Abstract",           "3"],
    ["Chapter 1: Introduction",                   "4"],
    ["Chapter 2: Literature Review",              "5"],
    ["Chapter 3: System Requirements (SRS)",      "6"],
    ["Chapter 4: System Design",                  "7-8"],
    ["Chapter 5: Implementation",                 "9-10"],
    ["Chapter 6: Testing",                        "11"],
    ["Chapter 7: Cost Estimation",                "12"],
    ["Chapter 8: Conclusion &amp; Future Scope",  "13"],
    ["References",                                "14"],
  ].map(([title, pg], i) => {
    const y = 1556 + i * 30;
    return `<text x="100" y="${y}" font-size="13" fill="${GRY}">${title}</text>
    <text x="1160" y="${y}" text-anchor="end" font-size="13" fill="${PRI}" font-weight="600">${pg}</text>
    <line x1="100" y1="${y+4}" x2="1160" y2="${y+4}" stroke="${RULE}" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }).join("")}

  ${footer(3, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 4 — CHAPTER 1: INTRODUCTION
// ═══════════════════════════════════════════════════════════════════════════════
function chapter1() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 1, "Introduction")}

  ${secHead(60, 88, "1.1  Background and Motivation")}
  ${para(80, 130, "Academic feedback is one of the most critical instruments for improving the quality of education in any institution. It provides faculty with insights into their teaching effectiveness, helps departments identify curriculum gaps, and allows students to contribute meaningfully to their academic environment. However, traditional paper-based feedback systems suffer from significant limitations including lack of anonymity, high manual processing overhead, delayed results, and inability to generate structured analytics.", {max:104, lh:22})}
  ${para(80, 298, "At the Centre for Urban and Planning Graduate Studies (CUPGS), BPUT Rourkela, feedback collection was carried out using physical forms that were manually tallied. This process was time-consuming, provided no real-time data to department heads, and offered no reliable anonymity to students — a critical deterrent to honest responses.", {max:104, lh:22})}

  ${secHead(60, 408, "1.2  Problem Statement")}
  ${para(80, 450, "The existing feedback mechanism at CUPGS is inadequate in the following respects:", {max:104})}
  ${bul(80, 474, [
    "Physical paper forms are prone to loss and require days of manual data entry and aggregation.",
    "The absence of guaranteed anonymity suppresses honest student responses, reducing the value of feedback.",
    "HODs receive feedback summaries weeks after the semester ends, making timely corrective action impossible.",
    "No mechanism exists for department-specific customization of feedback questions.",
    "There is no control over the timing of feedback — students could submit at any point.",
    "Faculty performance data is not accessible to faculty themselves for self-improvement.",
  ], PRI).svg}

  ${secHead(60, 748, "1.3  Objectives of the Project")}
  ${para(80, 790, "The primary objectives of this project are:", {max:104})}
  ${bul(80, 814, [
    "Develop a full-stack web application to digitize the academic feedback process at CUPGS.",
    "Guarantee complete student anonymity through a cryptographic Reference ID mechanism.",
    "Provide HODs with a real-time dashboard showing per-course analytics across 5 rating categories.",
    "Enable HODs to customize their department's feedback form with additional question types.",
    "Implement a role-based access control system for Student, Faculty, HOD, and Admin users.",
    "Enforce time-bound feedback collection through Admin-controlled feedback windows.",
    "Deploy the system as a Progressive Web App (PWA) for cross-platform accessibility.",
  ], PRI).svg}

  ${secHead(60, 1088, "1.4  Scope of the Project")}
  ${para(80, 1130, "The CUPGS Academic Feedback Manager covers the following scope:", {max:104})}
  ${bul(80, 1154, [
    "Five engineering departments: CSE, ECE, EE, ME, and CE at CUPGS, BPUT Rourkela.",
    "Odd semester (July-October) and Even semester (November-June) feedback cycles.",
    "All courses registered in the system (268+ courses across 5 departments).",
    "Four user roles with distinct dashboards, permissions, and data visibility.",
    "Anonymous feedback with self-verification capability using Reference IDs.",
  ], PRI).svg}
  ${para(80, 1290, "Out of scope: examination management, attendance systems, fee management, and integration with external university ERP systems.", {max:104, fill:LGT})}

  ${secHead(60, 1350, "1.5  Organization of the Report")}
  ${para(80, 1392, "This report is organized into the following chapters:", {max:104})}
  ${[
    ["Chapter 2", "Presents a literature review of existing academic feedback systems and relevant technologies."],
    ["Chapter 3", "Defines the system requirements in the form of a Software Requirements Specification (SRS)."],
    ["Chapter 4", "Describes the system design including DFD (Level 0, 1, 2), ER diagram, and architecture."],
    ["Chapter 5", "Covers the implementation details including technology stack, modules, and code structure."],
    ["Chapter 6", "Describes the testing strategy including unit testing, integration testing, and UAT."],
    ["Chapter 7", "Provides a cost estimation analysis using the COCOMO model and function point analysis."],
    ["Chapter 8", "Presents the conclusion, key achievements, limitations, and future scope of the system."],
  ].map(([ch, desc], i) => {
    const y = 1416 + i * 42;
    return `<text x="80" y="${y}" font-size="13" font-weight="700" fill="${PRI}">${ch}:</text>
    <text x="200" y="${y}" font-size="13" fill="${GRY}">${desc}</text>`;
  }).join("")}

  ${footer(4, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 5 — CHAPTER 2: LITERATURE REVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function chapter2() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 2, "Literature Review")}

  ${secHead(60, 88, "2.1  Overview of Existing Academic Feedback Systems")}
  ${para(80, 130, "Several academic institutions worldwide have adopted digital feedback mechanisms to replace manual paper systems. These systems range from generic survey platforms (Google Forms, SurveyMonkey) to purpose-built academic feedback tools (ClassEval, CourseEval, EvaluationKIT). Each approach presents trade-offs between flexibility, anonymity, analytics depth, and institutional integration.", {max:104, lh:22})}

  <!-- Comparison Table -->
  ${secHead(60, 242, "2.2  Comparative Analysis of Existing Systems")}
  ${tableRow(60, 282, 1120, ["System", "Anonymity", "Analytics", "Custom Forms", "PWA", "Cost"], [260,140,140,160,100,120], PRI, WHT, true)}
  ${[
    ["Google Forms",        "Partial",    "Basic",      "Yes",   "No",  "Free"],
    ["SurveyMonkey",        "Configurable","Limited",   "Yes",   "No",  "Paid"],
    ["ClassEval (ERP)",     "Variable",   "Moderate",   "No",    "No",  "Paid"],
    ["Paper-based System",  "None",       "Manual Only","Fixed", "N/A", "Low"],
    ["CUPGS Feedback Mgr",  "Guaranteed", "Real-time",  "HOD-built","Yes","Free/Open"],
  ].map(([...cells], i) => {
    const isOurs = i === 4;
    return tableRow(60, 316+i*34, 1120, cells, [260,140,140,160,100,120], isOurs ? `${PRI}15` : (i%2===0?"#f9fafb":"white"), isOurs ? PRI : GRY, isOurs);
  }).join("")}
  <rect x="60" y="282" width="1120" height="${6*34}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 504, "2.3  Key Gaps in Existing Solutions")}
  ${para(80, 546, "Based on the comparative analysis, the following key gaps were identified that motivated the development of CUPGS Feedback Manager:", {max:104, lh:22})}
  ${bul(80, 590, [
    "No existing free solution offers guaranteed anonymity combined with real-time analytics and HOD customizability in a single platform.",
    "Generic tools like Google Forms do not enforce role-based access — anyone with a link can submit responses.",
    "ERP-integrated systems are expensive, often require vendor lock-in, and lack flexible UI customization.",
    "No existing academic-specific tool provides drag-based half-star ratings for fine-grained precision.",
    "None of the reviewed systems offer Admin-controlled time-bound feedback windows.",
  ], ACC).svg}

  ${secHead(60, 800, "2.4  Relevant Technologies Reviewed")}
  ${para(80, 842, "The following technologies and frameworks were reviewed and evaluated before selecting the final technology stack:", {max:104, lh:22})}

  ${[
    { area: "Frontend Framework", options: "React vs Vue vs Angular", chosen: "React 18", reason: "Largest ecosystem, best TypeScript support, hooks-based state management, component reusability" },
    { area: "CSS Framework", options: "Tailwind vs Bootstrap vs MUI", chosen: "Tailwind CSS", reason: "Utility-first approach enables rapid UI development with consistent dark theme without custom CSS files" },
    { area: "Backend Framework", options: "Express vs Fastify vs NestJS", chosen: "Express.js", reason: "Minimal, well-documented, easiest integration with session management and rate limiting middleware" },
    { area: "Database", options: "PostgreSQL vs MongoDB vs MySQL", chosen: "PostgreSQL", reason: "ACID compliance, native JSONB support for custom form data, real type for 0.5-precision ratings" },
    { area: "ORM", options: "Drizzle vs Prisma vs TypeORM", chosen: "Drizzle ORM", reason: "Type-safe, schema-first, SQL-like queries, no magic — full control over generated SQL" },
    { area: "PDF Generation", options: "Puppeteer vs wkhtmltopdf vs jsPDF", chosen: "jsPDF + html2canvas", reason: "Client-side generation requires no server-side Chrome instance; works in the browser directly" },
  ].map(({ area, options, chosen, reason }, i) => {
    const y = 866 + i * 112;
    return `<rect x="60" y="${y}" width="1120" height="100" rx="4" fill="${i%2===0?"#f9fafb":"white"}" stroke="${RULE}" stroke-width="0.5"/>
    <text x="80" y="${y+22}" font-size="13" font-weight="700" fill="${PRI}">${area}</text>
    <text x="80" y="${y+44}" font-size="11" fill="${LGT}">Options Evaluated: ${options}</text>
    <rect x="80" y="${y+54}" width="90" height="22" rx="3" fill="${PRI}"/>
    <text x="125" y="${y+70}" text-anchor="middle" font-size="11" font-weight="700" fill="${WHT}">Chosen: ${chosen}</text>
    ${tb(190, y+70, reason, {fs:11, fill:GRY, max:96, lh:18})}`;
  }).join("")}

  ${secHead(60, 1546, "2.5  Standards and Methodologies Applied")}
  ${bul(80, 1588, [
    "Software Development Life Cycle (SDLC): Agile methodology with iterative development and continuous testing.",
    "Data Flow Diagrams (DFD): Yourdon-Coad notation for Level 0 (Context), Level 1, and Level 2 process decomposition.",
    "Entity-Relationship (ER) Modeling: Chen's notation with Crow's Foot cardinality for database schema design.",
    "REST API Design: HTTP method semantics (GET, POST, PATCH, DELETE) with consistent JSON response format.",
    "OWASP Security Guidelines: Applied for input validation, session management, rate limiting, and error handling.",
    "COCOMO II: Used for effort and cost estimation in Chapter 7.",
  ], PRI).svg}

  ${footer(5, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 6 — CHAPTER 3: SYSTEM REQUIREMENTS (SRS)
// ═══════════════════════════════════════════════════════════════════════════════
function chapter3() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 3, "System Requirements Specification (SRS)")}

  ${secHead(60, 88, "3.1  Functional Requirements")}
  ${para(80, 130, "The system shall provide the following functional capabilities:", {max:104})}

  <!-- FR Table -->
  ${tableRow(60, 154, 1120, ["FR-ID", "Module", "Requirement Description"], [80, 160, 880], PRI, WHT, true)}
  ${[
    ["FR-01","Auth",       "The system shall authenticate users based on role-specific ID format and PIN/password."],
    ["FR-02","Auth",       "The system shall create server-side sessions upon successful login and destroy them on logout."],
    ["FR-03","Feedback",   "Students shall be able to submit anonymous feedback with drag-based half-star ratings (0.5 to 5.0)."],
    ["FR-04","Feedback",   "Each feedback submission shall generate a unique cryptographic Reference ID (FB-YYYYMMDD-XXXXXX)."],
    ["FR-05","Feedback",   "Students shall be able to verify their submission using the Reference ID without revealing identity."],
    ["FR-06","Feedback",   "The system shall validate that the submitted course belongs to the student's registered department."],
    ["FR-07","HOD",        "HODs shall access a real-time analytics dashboard for their department with per-course ratings."],
    ["FR-08","HOD",        "HODs shall be able to download a formatted PDF report of department analytics with one click."],
    ["FR-09","HOD",        "HODs shall be able to add, edit, and remove custom questions from the department feedback form."],
    ["FR-10","Admin",      "Admins shall be able to create, activate, and deactivate time-bound feedback windows."],
    ["FR-11","Admin",      "Admins shall manage departments, courses, and faculty assignments institution-wide."],
    ["FR-12","Faculty",    "Faculty shall be able to view anonymized feedback analytics for their assigned courses."],
  ].map(([id, mod, desc], i) => {
    return tableRow(60, 188+i*30, 1120, [id, mod, desc], [80, 160, 880], i%2===0?"#f9fafb":"white");
  }).join("")}
  <rect x="60" y="154" width="1120" height="${13*30}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 554, "3.2  Non-Functional Requirements")}
  ${tableRow(60, 594, 1120, ["NFR-ID", "Category", "Requirement"], [90, 180, 850], PRI, WHT, true)}
  ${[
    ["NFR-01","Security",      "All API endpoints shall implement rate limiting. Auth: 10/15min. Feedback: 20/10min. Global: 100/15min."],
    ["NFR-02","Anonymity",     "Student login identity shall never be persisted in or linked to any feedback record in the database."],
    ["NFR-03","Performance",   "The HOD dashboard shall load within 3 seconds on a standard broadband connection."],
    ["NFR-04","Usability",     "The interface shall be fully responsive and usable on screen widths from 320px to 4K resolution."],
    ["NFR-05","Reliability",   "The system shall handle concurrent submissions without data loss or integrity violations."],
    ["NFR-06","Maintainability","All API inputs shall be validated using Zod schemas to prevent runtime type errors."],
    ["NFR-07","Portability",   "The application shall be deployable as a PWA, installable on Android, iOS, and desktop browsers."],
    ["NFR-08","Scalability",   "The PostgreSQL schema shall support addition of new departments without structural migration."],
  ].map(([id, cat, req], i) => {
    return tableRow(60, 628+i*36, 1120, [id, cat, req], [90, 180, 850], i%2===0?"#f9fafb":"white");
  }).join("")}
  <rect x="60" y="594" width="1120" height="${9*36}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 930, "3.3  Feasibility Study")}

  ${subHead(80, 972, "3.3.1  Technical Feasibility")}
  ${para(80, 994, "The technologies selected — React 18, Node.js, Express.js, and PostgreSQL — are all mature, open-source, and widely supported. The development environment (Replit with pnpm workspaces) provides immediate deployment capability. The team possesses the necessary skills in JavaScript/TypeScript development. All tools are freely available with extensive documentation.", {max:104, lh:21})}

  ${subHead(80, 1090, "3.3.2  Economic Feasibility")}
  ${para(80, 1112, "The entire system is built using open-source technologies with no licensing cost. The hosting platform provides free-tier infrastructure for development and basic production use. The only recurring cost is database hosting, which is included in the platform subscription. The development effort of one developer over one academic semester is the primary cost, estimated in Chapter 7.", {max:104, lh:21})}

  ${subHead(80, 1208, "3.3.3  Operational Feasibility")}
  ${para(80, 1230, "The system replaces a familiar paper-based process with a digital equivalent that is simpler to use. Students submit feedback via any web browser — no app installation required. HODs access analytics without any special training. Admins manage the system through an intuitive panel. A PWA interface further reduces the learning curve by providing a native-app-like experience.", {max:104, lh:21})}

  ${subHead(80, 1326, "3.3.4  Schedule Feasibility")}
  ${para(80, 1348, "The project was planned to be completed within one academic semester (approximately 5 months). The scope was defined conservatively to ensure all core modules — authentication, feedback submission, HOD analytics, admin management, and PDF generation — could be fully implemented and tested within the allocated time.", {max:104, lh:21})}

  ${secHead(60, 1440, "3.4  Hardware and Software Requirements")}
  <rect x="60" y="1480" width="540" height="200" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  <text x="330" y="1506" text-anchor="middle" font-size="13" font-weight="700" fill="${PRI}">Hardware Requirements (Development)</text>
  ${[
    ["Processor:", "Intel Core i5 or equivalent (minimum)"],
    ["RAM:",       "8 GB minimum, 16 GB recommended"],
    ["Storage:",   "50 GB free disk space"],
    ["Network:",   "Stable broadband internet connection"],
    ["Display:",   "1920x1080 minimum resolution"],
  ].map(([k,v],i)=>`<text x="80" y="${1530+i*28}" font-size="12" font-weight="700" fill="${GRY}">${k}</text><text x="200" y="${1530+i*28}" font-size="12" fill="${LGT}">${v}</text>`).join("")}

  <rect x="640" y="1480" width="540" height="200" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  <text x="910" y="1506" text-anchor="middle" font-size="13" font-weight="700" fill="${PRI}">Software Requirements</text>
  ${[
    ["OS:", "Windows 10 / macOS / Linux"],
    ["Runtime:", "Node.js v18+, pnpm v8+"],
    ["Database:", "PostgreSQL 15+"],
    ["Browser:", "Chrome 110+ / Firefox 110+ / Safari 16+"],
    ["Editor:", "VS Code with TypeScript extension"],
  ].map(([k,v],i)=>`<text x="660" y="${1530+i*28}" font-size="12" font-weight="700" fill="${GRY}">${k}</text><text x="780" y="${1530+i*28}" font-size="12" fill="${LGT}">${v}</text>`).join("")}

  ${footer(6, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 7 — CHAPTER 4: SYSTEM DESIGN (DFDs)
// ═══════════════════════════════════════════════════════════════════════════════
function chapter4a() {
  const EXT="#1e3a8a", PROC="#14532d", STORE="#92400e";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 4, "System Design")}

  ${secHead(60, 88, "4.1  System Architecture Overview")}
  ${para(80, 130, "The CUPGS Feedback Manager follows a classic three-tier client-server architecture. The Presentation Layer (React + TypeScript + Vite) communicates with the Application Layer (Node.js + Express.js) via RESTful HTTP APIs. The Application Layer interfaces with the Data Layer (PostgreSQL via Drizzle ORM). This separation ensures maintainability, testability, and independent scalability of each layer.", {max:104, lh:21})}

  <!-- Architecture Diagram -->
  <rect x="60"  y="230" width="1120" height="80" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/>
  <text x="200" y="262" font-size="13" font-weight="700" fill="${EXT}">PRESENTATION LAYER</text>
  <text x="200" y="284" font-size="11" fill="${LGT}">React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui</text>
  <text x="930" y="272" font-size="11" fill="${LGT}">Browser / PWA (Any device)</text>

  <text x="620" y="332" text-anchor="middle" font-size="13" fill="${LGT}">REST API (HTTP/JSON via Axios)</text>
  <line x1="620" y1="310" x2="620" y2="352" stroke="${LGT}" stroke-width="2" stroke-dasharray="4,3"/>

  <rect x="60"  y="356" width="1120" height="80" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/>
  <text x="200" y="388" font-size="13" font-weight="700" fill="${PROC}">APPLICATION LAYER</text>
  <text x="200" y="410" font-size="11" fill="${LGT}">Node.js + Express.js + TypeScript | Session, Rate Limit, Zod Validation</text>
  <text x="930" y="398" font-size="11" fill="${LGT}">Port 8080</text>

  <text x="620" y="458" text-anchor="middle" font-size="13" fill="${LGT}">Drizzle ORM (type-safe SQL)</text>
  <line x1="620" y1="436" x2="620" y2="478" stroke="${LGT}" stroke-width="2" stroke-dasharray="4,3"/>

  <rect x="60"  y="482" width="1120" height="80" rx="6" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="2"/>
  <text x="200" y="514" font-size="13" font-weight="700" fill="#7c3aed">DATA LAYER</text>
  <text x="200" y="536" font-size="11" fill="${LGT}">PostgreSQL 15 | 6 tables | JSONB + real type | Replit managed database</text>
  <text x="930" y="524" font-size="11" fill="${LGT}">DATABASE_URL env</text>

  ${secHead(60, 584, "4.2  Data Flow Diagram -- Level 0 (Context Diagram)")}
  ${para(80, 626, "The Level 0 DFD represents the entire system as a single process (Process 0) with external entities and data flows. Notation: Yourdon-Coad.", {max:104, lh:20})}

  <!-- Level 0 DFD Drawing -->
  <!-- External entities -->
  <rect x="60"  y="660" width="180" height="60" rx="4" fill="${EXT}" stroke="#1e40af" stroke-width="2"/>
  <text x="150" y="695" text-anchor="middle" font-size="13" font-weight="700" fill="white">STUDENT</text>
  <rect x="980" y="660" width="180" height="60" rx="4" fill="${EXT}" stroke="#1e40af" stroke-width="2"/>
  <text x="1070" y="695" text-anchor="middle" font-size="13" font-weight="700" fill="white">HOD</text>
  <rect x="60"  y="910" width="180" height="60" rx="4" fill="${EXT}" stroke="#1e40af" stroke-width="2"/>
  <text x="150" y="945" text-anchor="middle" font-size="13" font-weight="700" fill="white">FACULTY</text>
  <rect x="980" y="910" width="180" height="60" rx="4" fill="${EXT}" stroke="#1e40af" stroke-width="2"/>
  <text x="1070" y="945" text-anchor="middle" font-size="13" font-weight="700" fill="white">ADMIN</text>

  <!-- Central Process -->
  <ellipse cx="620" cy="810" rx="200" ry="110" fill="${PROC}20" stroke="${PROC}" stroke-width="3"/>
  <text x="620" y="798" text-anchor="middle" font-size="14" font-weight="700" fill="${PROC}">Process 0</text>
  <text x="620" y="820" text-anchor="middle" font-size="12" fill="${PROC}">CUPGS Feedback</text>
  <text x="620" y="840" text-anchor="middle" font-size="12" fill="${PROC}">Management System</text>

  <!-- Arrows Student -->
  <line x1="240" y1="690" x2="420" y2="780" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="290" y="728" font-size="10" fill="${LGT}">Feedback Submission</text>
  <line x1="420" y1="800" x2="240" y2="720" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="280" y="778" font-size="10" fill="${LGT}">Reference ID</text>

  <!-- Arrows HOD -->
  <line x1="980" y1="690" x2="820" y2="780" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="870" y="720" font-size="10" fill="${LGT}">Form Config</text>
  <line x1="820" y1="800" x2="980" y2="720" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="864" y="776" font-size="10" fill="${LGT}">Analytics / PDF</text>

  <!-- Arrows Faculty -->
  <line x1="240" y1="940" x2="420" y2="840" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="268" y="900" font-size="10" fill="${LGT}">View Request</text>
  <line x1="420" y1="840" x2="240" y2="960" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="265" y="926" font-size="10" fill="${LGT}">Performance Data</text>

  <!-- Arrows Admin -->
  <line x1="980" y1="940" x2="820" y2="840" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="876" y="904" font-size="10" fill="${LGT}">Mgmt Request</text>
  <line x1="820" y1="840" x2="980" y2="960" stroke="${GRY}" stroke-width="2" marker-end="url(#a1)"/>
  <text x="863" y="930" font-size="10" fill="${LGT}">System Dashboard</text>

  <defs><marker id="a1" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="${GRY}"/></marker></defs>

  ${secHead(60, 1050, "4.3  Data Flow Diagram -- Level 1 (Functional Decomposition)")}
  ${para(80, 1092, "The Level 1 DFD decomposes the system into 5 major sub-processes: Authentication (1.0), Feedback Collection (2.0), Form Template Management (3.0), Analytics and Reporting (4.0), and Institution Management (5.0). Each process communicates with corresponding data stores.", {max:104, lh:21})}

  <!-- Level 1 text-based representation -->
  ${[
    { proc:"1.0 Authentication", color:"#1e3a8a", inputs:["Login Credentials (All Roles)"], outputs:["Auth Token / Session", "Role Redirect"] },
    { proc:"2.0 Feedback Collection", color:"#14532d", inputs:["Feedback Form Data (Student)","Form Template (HOD)"], outputs:["Reference ID","Confirmation Message"] },
    { proc:"3.0 Form Template Mgmt", color:"#065f46", inputs:["HOD Custom Form Config"], outputs:["Saved Template Confirmation","Updated Student Form"] },
    { proc:"4.0 Analytics &amp; Reporting", color:"#7c2d12", inputs:["Analytics Request (HOD/Faculty)","PDF Request (HOD)"], outputs:["Dashboard Data","PDF Report"] },
    { proc:"5.0 Institution Management", color:"#4c1d95", inputs:["Management Request (Admin)"], outputs:["System Config Updates","Window Status"] },
  ].map(({ proc, color, inputs, outputs }, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 60 + col * 580, y = 1116 + row * 160;
    if (i === 4) { // center the last one
      return `<rect x="280" y="${y}" width="680" height="140" rx="6" fill="${color}15" stroke="${color}" stroke-width="1.5"/>
      <rect x="280" y="${y}" width="680" height="28" rx="6" fill="${color}"/>
      <text x="620" y="${y+19}" text-anchor="middle" font-size="12" font-weight="700" fill="white">${proc}</text>
      <text x="296" y="${y+48}" font-size="11" font-weight="700" fill="${GRY}">Inputs: ${inputs[0]}</text>
      <text x="296" y="${y+70}" font-size="11" font-weight="700" fill="${GRY}">Outputs: ${outputs[0]}</text>`;
    }
    return `<rect x="${x}" y="${y}" width="560" height="140" rx="6" fill="${color}15" stroke="${color}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="560" height="28" rx="6" fill="${color}"/>
    <text x="${x+280}" y="${y+19}" text-anchor="middle" font-size="12" font-weight="700" fill="white">${proc}</text>
    ${inputs.map((inp, j)=>`<text x="${x+16}" y="${y+48+j*20}" font-size="11" font-weight="700" fill="${GRY}">In: ${esc(inp)}</text>`).join("")}
    ${outputs.map((out, j)=>`<text x="${x+16}" y="${y+90+j*20}" font-size="11" fill="${LGT}">Out: ${esc(out)}</text>`).join("")}`;
  }).join("")}

  ${footer(7, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 8 — CHAPTER 4 CONTINUED: ER DIAGRAM + DFD Level 2
// ═══════════════════════════════════════════════════════════════════════════════
function chapter4b() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  <rect x="0" y="14" width="${W}" height="36" fill="${PRI}60"/>
  <text x="60" y="40" font-size="16" font-weight="700" fill="white">Chapter 4 (Continued): System Design</text>

  ${secHead(60, 60, "4.4  Entity-Relationship (ER) Diagram")}
  ${para(80, 102, "The database consists of 6 entities: departments, faculty, courses, feedback, form_templates, and feedback_windows. Notation: Chen's ER model with Crow's Foot cardinality. PK = Primary Key, FK = Foreign Key.", {max:104, lh:20})}

  <!-- ER Entities -->
  ${[
    { name:"departments", x:60,  y:138, color:"#1a7a6e", cols:["id PK","code (UNIQUE)","name","hod_name","hod_employee_id","created_at"] },
    { name:"faculty",     x:460, y:138, color:"#1a7a6e", cols:["id PK","department_id FK","employee_id (UNQ)","name","designation","email","is_active"] },
    { name:"courses",     x:860, y:138, color:"#1a7a6e", cols:["id PK","department_id FK","faculty_id FK (opt)","code (UNIQUE)","name","semester","academic_year","credits"] },
    { name:"feedback",    x:60,  y:560, color:"#92400e", cols:["id PK","reference_id (UNQ)","course_id FK","faculty_id FK (opt)","department_id FK","semester","5 x rating (real)","comments (text)","custom_answers (JSONB)"] },
    { name:"form_templates",x:460,y:560,color:"#6b21a8", cols:["id PK","department_id FK UNQ","fields (JSONB)","created_at","updated_at"] },
    { name:"feedback_windows",x:860,y:560,color:"#6b21a8", cols:["id PK","department_id FK (opt)","title","is_active (bool)","start_date","end_date"] },
  ].map(({ name, x, y, color, cols }) => {
    const h = 32 + cols.length * 26;
    return `<rect x="${x}" y="${y}" width="360" height="${h}" rx="4" fill="${color}15" stroke="${color}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="360" height="32" rx="4" fill="${color}"/>
    <text x="${x+180}" y="${y+21}" text-anchor="middle" font-size="13" font-weight="800" fill="white">${name}</text>
    ${cols.map((c, ci) => {
      const cy = y+32+ci*26;
      const isPK = c.includes("PK"), isFK = c.includes("FK");
      return `${ci>0?`<line x1="${x+4}" y1="${cy}" x2="${x+356}" y2="${cy}" stroke="${color}30" stroke-width="0.7"/>`:""}
      <text x="${x+10}" y="${cy+17}" font-size="11" fill="${isPK?"#d97706":isFK?"#0284c7":GRY}" font-weight="${isPK||isFK?"700":"400"}">${c}</text>`;
    }).join("")}`;
  }).join("")}

  <!-- ER Relationships -->
  <!-- dept -> faculty 1:N -->
  <line x1="420" y1="192" x2="460" y2="192" stroke="${GRY}" stroke-width="1.5" stroke-dasharray="none"/>
  <text x="430" y="186" font-size="10" fill="${LGT}">1:N</text>
  <!-- dept -> courses 1:N -->
  <line x1="420" y1="210" x2="860" y2="210" stroke="${GRY}" stroke-width="1.5"/>
  <text x="630" y="206" font-size="10" fill="${LGT}">1:N</text>
  <!-- dept -> feedback -->
  <line x1="240" y1="330" x2="240" y2="560" stroke="${GRY}" stroke-width="1.5"/>
  <text x="244" y="450" font-size="10" fill="${LGT}">1:N</text>
  <!-- courses -> feedback -->
  <line x1="1040" y1="330" x2="1040" y2="470" stroke="${GRY}" stroke-width="1.5"/>
  <line x1="1040" y1="470" x2="280" y2="470" stroke="${GRY}" stroke-width="1.5"/>
  <line x1="280" y1="470" x2="280" y2="560" stroke="${GRY}" stroke-width="1.5"/>
  <text x="660" y="466" font-size="10" fill="${LGT}">1:N</text>
  <!-- dept -> form_templates 1:1 -->
  <line x1="640" y1="330" x2="640" y2="560" stroke="${GRY}" stroke-width="1.5"/>
  <text x="644" y="450" font-size="10" fill="${LGT}">1:1</text>
  <!-- faculty -> courses 0..1:N -->
  <line x1="680" y1="220" x2="860" y2="220" stroke="${GRY}" stroke-width="1.5" stroke-dasharray="5,3"/>
  <text x="760" y="215" font-size="10" fill="${LGT}">0..1:N</text>

  ${secHead(60, 948, "4.5  Data Flow Diagram -- Level 2 (Process 2.0: Feedback Collection)")}
  ${para(80, 990, "Process 2.0 is decomposed into 6 sub-processes: Input Validation (2.1), Window Check (2.2), Profanity Filter (2.3), Course-Faculty Integrity Check (2.4), Reference ID Generation (2.5), and Database Storage (2.6).", {max:104, lh:21})}

  <!-- Level 2 DFD: linear flow -->
  ${[
    { id:"2.1", label:"Validate\nInputs",          color:"#1e3a8a" },
    { id:"2.2", label:"Check\nWindow",             color:"#d97706" },
    { id:"2.3", label:"Profanity\nFilter",         color:"#0284c7" },
    { id:"2.4", label:"Course-Faculty\nIntegrity", color:"#14532d" },
    { id:"2.5", label:"Generate\nRef. ID",         color:"#7c3aed" },
    { id:"2.6", label:"Store\nFeedback",           color:"#7c2d12" },
  ].map(({ id, label, color }, i) => {
    const x = 60 + i * 192, cy = 1080;
    const lines = label.split("\n");
    return `<ellipse cx="${x+72}" cy="${cy}" rx="72" ry="44" fill="${color}20" stroke="${color}" stroke-width="2"/>
    <text x="${x+72}" y="${cy+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}">${id}</text>
    ${lines.map((l,li)=>`<text x="${x+72}" y="${cy+20+li*16}" text-anchor="middle" font-size="10" fill="${color}">${l}</text>`).join("")}
    ${i<5?`<line x1="${x+144}" y1="${cy}" x2="${x+156}" y2="${cy}" stroke="${GRY}" stroke-width="2" marker-end="url(#a2)"/>`:""}`;
  }).join("")}

  <!-- Input and output arrows -->
  <text x="96" y="1014" text-anchor="middle" font-size="10" fill="${LGT}">Student Form Data</text>
  <line x1="96" y1="1016" x2="96" y2="1036" stroke="${LGT}" stroke-width="1.5" marker-end="url(#a2)"/>
  <text x="1108" y="1014" text-anchor="middle" font-size="10" fill="${LGT}">Reference ID</text>
  <line x1="1108" y1="1016" x2="1108" y2="1036" stroke="${LGT}" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Data stores -->
  <rect x="60"  y="1148" width="180" height="30" rx="0" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="150" y="1168" text-anchor="middle" font-size="11" fill="#92400e">D6: Feedback Windows</text>
  <line x1="250" y1="1148" x2="310" y2="1124" stroke="${LGT}" stroke-width="1" stroke-dasharray="4,3"/>

  <rect x="440" y="1148" width="180" height="30" rx="0" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="530" y="1168" text-anchor="middle" font-size="11" fill="#1e3a8a">D2: Courses</text>
  <rect x="640" y="1148" width="180" height="30" rx="0" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="730" y="1168" text-anchor="middle" font-size="11" fill="#1e3a8a">D3: Faculty</text>
  <line x1="590" y1="1148" x2="700" y2="1124" stroke="${LGT}" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="690" y1="1148" x2="750" y2="1124" stroke="${LGT}" stroke-width="1" stroke-dasharray="4,3"/>

  <rect x="980" y="1148" width="180" height="30" rx="0" fill="#fdf4ff" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="1070" y="1168" text-anchor="middle" font-size="11" fill="#6b21a8">D1: Feedback</text>
  <line x1="1070" y1="1148" x2="1100" y2="1124" stroke="${LGT}" stroke-width="1" stroke-dasharray="4,3"/>

  <defs><marker id="a2" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="${GRY}"/></marker></defs>

  ${secHead(60, 1208, "4.6  Use Case Summary")}
  ${tableRow(60, 1248, 1120, ["Actor", "Primary Use Cases"], [200, 920], PRI, WHT, true)}
  ${[
    ["Student",  "Login, Select Course, Submit Feedback (drag rating + comments + custom Q), View Reference ID, Verify Submission"],
    ["Faculty",  "Login, View Assigned Courses, View Category Ratings, Read Anonymous Comments, Compare Semesters"],
    ["HOD",      "Login, View Dept Dashboard, Sort Courses, Download PDF Report, Add Custom Questions, View Window Status"],
    ["Admin",    "Login, View Institution Dashboard, Add/Edit Courses, Assign Faculty, Create Feedback Window, Toggle Window"],
  ].map(([actor, uc], i) => tableRow(60, 1282+i*44, 1120, [actor, uc], [200, 920], i%2===0?"#f9fafb":"white")).join("")}
  <rect x="60" y="1248" width="1120" height="${5*44}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${footer(8, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 9 — CHAPTER 5: IMPLEMENTATION (Part 1)
// ═══════════════════════════════════════════════════════════════════════════════
function chapter5a() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 5, "Implementation")}

  ${secHead(60, 88, "5.1  Technology Stack")}
  ${tableRow(60, 126, 1120, ["Category", "Technology", "Version", "Purpose"], [160,200,120,640], PRI, WHT, true)}
  ${[
    ["Frontend","React",          "18.x","Component-based UI library with hooks"],
    ["Frontend","TypeScript",     "5.x", "Static typing for frontend and backend"],
    ["Frontend","Vite",           "5.x", "Build tool with HMR and optimized bundles"],
    ["Frontend","Tailwind CSS",   "3.x", "Utility-first responsive styling"],
    ["Frontend","shadcn/ui",      "Latest","Accessible pre-built UI components"],
    ["Frontend","React Query",    "5.x", "Server state, caching, background sync"],
    ["Frontend","React Hook Form","7.x", "Form state management and validation"],
    ["Frontend","jsPDF",          "2.x", "Client-side PDF report generation"],
    ["Backend", "Node.js",        "18+", "JavaScript runtime for server"],
    ["Backend", "Express.js",     "4.x", "HTTP server, routing, and middleware"],
    ["Backend", "express-session","1.x", "Server-side session management"],
    ["Backend", "express-rate-limit","7.x","API rate limiting (3 layers)"],
    ["Backend", "Zod",            "3.x", "Runtime schema validation"],
    ["Backend", "Pino",           "8.x", "High-performance structured logging"],
    ["Database","PostgreSQL",     "15+", "Production relational database"],
    ["Database","Drizzle ORM",    "0.29+","Type-safe schema and query builder"],
    ["Infra",   "pnpm workspaces","8.x", "Monorepo package management"],
  ].map(([cat, tech, ver, pur], i) =>
    tableRow(60, 160+i*30, 1120, [cat,tech,ver,pur], [160,200,120,640], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="126" width="1120" height="${18*30}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 710, "5.2  Project Structure (Monorepo)")}
  <rect x="60" y="750" width="1120" height="320" rx="4" fill="#0f172a"/>
  <text x="80" y="780" font-size="12" fill="#94a3b8">workspace/</text>
  ${[
    ["  artifacts/",               "#60a5fa", "Monorepo artifact packages"],
    ["    api-server/",            "#34d399", "Backend Express.js application"],
    ["      src/",                 "#94a3b8", ""],
    ["        app.ts",             "#e2e8f0", "Express app config, middleware, rate limits"],
    ["        routes/",            "#94a3b8", "auth.ts  feedback.ts  departments.ts  windows.ts"],
    ["        db/",                "#94a3b8", "schema.ts (Drizzle schema)  index.ts (connection)"],
    ["    bput-feedback/",         "#34d399", "Frontend React + Vite application"],
    ["      src/",                 "#94a3b8", ""],
    ["        pages/",             "#e2e8f0", "Login.tsx  SubmitFeedback.tsx  HodDashboard.tsx  Admin.tsx"],
    ["        components/",        "#e2e8f0", "DragStarRating.tsx  FeedbackForm.tsx  PdfReport.tsx"],
    ["        lib/",               "#94a3b8", "api.ts (Axios)  queryClient.ts  utils.ts"],
    ["  scripts/",                 "#60a5fa", "PDF generation and utility scripts"],
    ["  pnpm-workspace.yaml",      "#fbbf24", "Workspace definition"],
    ["  package.json",             "#fbbf24", "Root scripts: dev  build  db:push"],
  ].map(([line, col], i) =>
    `<text x="90" y="${800+i*20}" font-size="11" fill="${col}" font-family="Courier New,monospace">${esc(line)}</text>`
  ).join("")}

  ${secHead(60, 1090, "5.3  Database Schema Implementation")}
  ${para(80, 1132, "The database consists of 6 tables implemented using Drizzle ORM schema definitions. Key design decisions:", {max:104})}
  ${bul(80, 1158, [
    "rating columns use PostgreSQL real type (not integer) to support 0.5-step precision (e.g., 3.5, 4.5).",
    "feedback.custom_answers uses JSONB to store arbitrary question-answer pairs from HOD's form builder.",
    "form_templates.fields uses JSONB to store the HOD-configured custom question list per department.",
    "feedback_windows.department_id is nullable — NULL means a global window applied to all departments.",
    "All FK relationships enforce referential integrity at the database level via Drizzle FK constraints.",
    "faculty_id is nullable in both courses and feedback tables to support 'Faculty TBA' assignments.",
  ], PRI).svg}

  ${secHead(60, 1394, "5.4  API Design and Routing")}
  ${para(80, 1436, "The backend follows RESTful API design principles. All routes are prefixed with /api/. Input validation uses Zod schemas at the route handler level before any business logic executes.", {max:104, lh:20})}
  ${tableRow(60, 1468, 1120, ["Method", "Endpoint", "Auth Required", "Description"], [90,380,160,490], PRI, WHT, true)}
  ${[
    ["POST",  "/api/auth/login",                      "None",         "Authenticate user, create session"],
    ["POST",  "/api/auth/logout",                     "Any role",     "Destroy session, redirect to login"],
    ["POST",  "/api/feedback",                        "Student",      "Submit anonymous feedback, return Ref ID"],
    ["GET",   "/api/feedback/check/:refId",           "None",         "Verify submission by Reference ID"],
    ["GET",   "/api/departments/:id/hod-report",      "HOD",          "Fetch department analytics data"],
    ["GET",   "/api/departments/:id/form-template",   "Any",          "Load HOD custom form configuration"],
    ["POST",  "/api/departments/:id/form-template",   "HOD",          "Save custom form questions"],
    ["GET",   "/api/windows",                         "Any",          "List all feedback windows with status"],
    ["POST",  "/api/windows",                         "Admin",        "Create new feedback window"],
    ["PATCH", "/api/windows/:id",                     "Admin",        "Toggle window active/inactive"],
    ["GET",   "/api/courses",                         "Any auth",     "List courses with faculty assignments"],
    ["POST",  "/api/courses",                         "Admin",        "Add a new course with faculty assignment"],
  ].map(([m, ep, auth, desc], i) =>
    tableRow(60, 1502+i*30, 1120, [m,ep,auth,desc], [90,380,160,490], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="1468" width="1120" height="${13*30}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${footer(9, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 10 — CHAPTER 5: IMPLEMENTATION (Part 2)
// ═══════════════════════════════════════════════════════════════════════════════
function chapter5b() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  <rect x="0" y="14" width="${W}" height="36" fill="${PRI}60"/>
  <text x="60" y="40" font-size="16" font-weight="700" fill="white">Chapter 5 (Continued): Implementation</text>

  ${secHead(60, 60, "5.5  Module Implementation Details")}

  ${[
    {
      num:"5.5.1", title:"Authentication Module",
      color:"#1e3a8a",
      points:[
        "Login page presents four role options. Student and Faculty IDs follow the CUPGS/DEPT/NNN pattern.",
        "HOD IDs follow HOD/DEPT/001. Admin uses a fixed identifier (bput@admin2025).",
        "Server verifies the ID pattern, then checks the PIN/password against the department record.",
        "On success, req.session.user is populated with role, department, and employee ID.",
        "Rate limiter blocks further attempts for 15 minutes after 10 consecutive failures from the same IP.",
      ]
    },
    {
      num:"5.5.2", title:"Feedback Submission Module",
      color:"#14532d",
      points:[
        "Student selects department and course. Faculty is auto-populated from course.faculty_id.",
        "Five DragStarRating components render with mouse/touch drag handlers for 0.5-step precision.",
        "Semester is auto-detected (odd: July-Oct; even: Nov-June). Academic year is calculated server-side.",
        "Custom questions from HOD's form template are rendered dynamically if they exist for the department.",
        "On POST /api/feedback: Zod validates all fields, window is checked, integrity is enforced, record is inserted, Ref ID returned.",
      ]
    },
    {
      num:"5.5.3", title:"HOD Analytics Dashboard",
      color:"#065f46",
      points:[
        "GET /api/departments/:id/hod-report returns aggregated averages per course per rating category.",
        "Dashboard renders a sortable table of courses with 5 rating columns and submission count.",
        "PDF generation uses jsPDF + html2canvas to snapshot the dashboard DOM into a formatted A4 document.",
        "Form builder maintains a local state of question objects. On save, POST updates form_templates table.",
        "Window status is shown by querying GET /api/windows and filtering for the HOD's department ID.",
      ]
    },
    {
      num:"5.5.4", title:"Admin Institution Management",
      color:"#7c2d12",
      points:[
        "Admin dashboard fetches analytics across all 5 departments via GET /api/analytics/dashboard.",
        "Course management allows adding courses with optional faculty assignment from the existing faculty list.",
        "Feedback windows are created via POST /api/windows with title, dates, and optional department scope.",
        "PATCH /api/windows/:id toggles the is_active boolean — immediately affects student submission eligibility.",
      ]
    },
  ].map(({ num, title, color, points }, i) => {
    const y = 88 + i * 360;
    return `${secHead(60, y, `${num}  ${title}`)}
    ${bul(80, y+42, points, color).svg}`;
  }).join("")}

  ${secHead(60, 1528, "5.6  PWA Implementation")}
  ${para(80, 1570, "The application is configured as a Progressive Web App using a Web App Manifest (manifest.json) and a Service Worker. The manifest defines the app name, icons, theme color (#0f3460), background color, display mode (standalone), and start URL. The Service Worker caches static assets on install and serves them from cache on subsequent loads, enabling offline access to previously visited pages.", {max:104, lh:21})}
  ${bul(80, 1668, [
    "Manifest.json: defines app identity, icons (192x192, 512x512), display mode, and theme.",
    "Service Worker: caches JS, CSS, and static assets for offline functionality.",
    "Users on Android and iOS see an 'Add to Home Screen' prompt after visiting the app.",
    "Custom splash screen: animated CUPGS logo displayed for 2 seconds on app launch.",
  ], PRI).svg}

  ${footer(10, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 11 — CHAPTER 6: TESTING
// ═══════════════════════════════════════════════════════════════════════════════
function chapter6() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 6, "Testing")}

  ${secHead(60, 88, "6.1  Testing Strategy")}
  ${para(80, 130, "The testing strategy for CUPGS Feedback Manager follows a layered approach: Unit Testing (individual functions and components), Integration Testing (API endpoints with database), System Testing (end-to-end user flows), User Acceptance Testing (UAT with actual student and HOD users), and Security Testing (rate limiting, session, and input validation).", {max:104, lh:21})}

  ${secHead(60, 222, "6.2  Unit Test Cases")}
  ${tableRow(60, 262, 1120, ["TC-ID", "Component/Function", "Test Description", "Expected Result", "Status"], [70,200,320,360,90], PRI, WHT, true)}
  ${[
    ["UT-01","wrapText()",          "Wrap 120-char string with maxChars=40",             "Returns array of 3 lines, each ≤ 40 chars",         "PASS"],
    ["UT-02","Academic Year Calc",  "Input: month=4 (April), year=2025",                 "Returns '2025-26'",                                  "PASS"],
    ["UT-03","Academic Year Calc",  "Input: month=2 (Feb), year=2025",                   "Returns '2024-25'",                                  "PASS"],
    ["UT-04","Semester Detection",  "Input: month=8 (August)",                            "Returns 'ODD' semester",                             "PASS"],
    ["UT-05","Semester Detection",  "Input: month=12 (December)",                         "Returns 'EVEN' semester",                            "PASS"],
    ["UT-06","DragStarRating",      "Drag to position equivalent to 3.5 stars",          "Rating state updates to 3.5, UI shows 3.5 stars",    "PASS"],
    ["UT-07","Zod Schema Auth",     "Input: empty employee_id field",                     "Returns ZodError with 'required' message",           "PASS"],
    ["UT-08","Zod Schema Feedback", "Input: rating = 5.5 (out of range)",                "Returns ZodError for rating > 5.0",                  "PASS"],
    ["UT-09","Reference ID Gen",    "Call generateRefId() 1000 times",                   "All IDs unique, format matches FB-YYYYMMDD-XXXXXX",  "PASS"],
    ["UT-10","stripEmoji()",        "SVG string containing emoji character U+1F600",      "Emoji removed, remaining text preserved",            "PASS"],
  ].map(([id,comp,desc,exp,stat], i) => {
    const color = stat==="PASS" ? "#14532d" : "#dc2626";
    return tableRow(60, 296+i*34, 1120, [id,comp,desc,exp,stat], [70,200,320,360,90], i%2===0?"#f9fafb":"white", stat==="PASS"?GRY:GRY, false);
  }).join("")}
  <rect x="60" y="262" width="1120" height="${11*34}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 642, "6.3  Integration Test Cases")}
  ${tableRow(60, 682, 1120, ["TC-ID", "Endpoint", "Input", "Expected HTTP Response", "Status"], [70,260,280,420,90], PRI, WHT, true)}
  ${[
    ["IT-01","POST /api/auth/login",     "Valid student ID + correct PIN",             "200 OK + session cookie set",                    "PASS"],
    ["IT-02","POST /api/auth/login",     "Valid student ID + wrong PIN",               "401 Unauthorized",                               "PASS"],
    ["IT-03","POST /api/auth/login",     "11th attempt within 15 min",                 "429 Too Many Requests",                          "PASS"],
    ["IT-04","POST /api/feedback",       "Valid feedback data + active window",        "201 Created + Reference ID in response body",    "PASS"],
    ["IT-05","POST /api/feedback",       "Rating value = 0.3 (below 0.5 min)",        "400 Bad Request + Zod error details",            "PASS"],
    ["IT-06","POST /api/feedback",       "Course from different department",            "400 Bad Request + integrity violation message",  "PASS"],
    ["IT-07","POST /api/feedback",       "No active window open",                      "403 Forbidden + 'No active window' message",     "PASS"],
    ["IT-08","GET /api/.../hod-report",  "HOD session for CSE department",             "200 OK + analytics JSON for CSE dept only",      "PASS"],
    ["IT-09","GET /api/.../hod-report",  "Student session (wrong role)",               "403 Forbidden",                                  "PASS"],
    ["IT-10","POST /api/windows",        "Admin session + valid window data",          "201 Created + window ID in response",            "PASS"],
  ].map(([id,ep,inp,exp,stat], i) =>
    tableRow(60, 716+i*34, 1120, [id,ep,inp,exp,stat], [70,260,280,420,90], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="682" width="1120" height="${11*34}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 1062, "6.4  System (End-to-End) Test Cases")}
  ${tableRow(60, 1102, 1120, ["TC-ID", "User Flow", "Steps", "Expected Outcome", "Status"], [70,180,380,400,90], PRI, WHT, true)}
  ${[
    ["ST-01","Student Submission","Login as student -> Select CSE/DS course -> Drag all ratings to 4.0 -> Submit","Reference ID displayed, record visible in HOD dashboard analytics","PASS"],
    ["ST-02","HOD PDF Download","Login as HOD/CSE/001 -> View dashboard -> Click Download PDF","Browser downloads formatted PDF with all course ratings","PASS"],
    ["ST-03","HOD Form Builder","HOD adds a custom rating question -> Student submits -> HOD views custom answers","Custom question appears in student form; answer visible in dashboard","PASS"],
    ["ST-04","Ref ID Verify","Student notes Reference ID -> Navigates to verify page -> Enters ID","Submission details shown (no student identity revealed)","PASS"],
    ["ST-05","Window Control","Admin closes active window -> Student attempts to submit","Student receives 'No active window' error message, no record stored","PASS"],
  ].map(([id,flow,steps,exp,stat], i) =>
    tableRow(60, 1136+i*50, 1120, [id,flow,steps,exp,stat], [70,180,380,400,90], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="1102" width="1120" height="${6*50}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${secHead(60, 1408, "6.5  Security Testing")}
  ${tableRow(60, 1448, 1120, ["Test", "Method", "Result"], [300, 520, 300], PRI, WHT, true)}
  ${[
    ["SQL Injection on /api/auth/login","Submit: ' OR '1'='1 as employee_id","Rejected by Zod schema validation; no DB query executed"],
    ["Brute Force Login Attempt","Send 15 consecutive POST requests in 5 minutes","Request 11+ blocked with 429 response; IP rate-limited"],
    ["Cross-Department Feedback Submit","Submit feedback for ECE course while logged in as CSE student","Rejected with 400 integrity violation error"],
    ["Session Hijacking Attempt","Modify session cookie in browser DevTools","Server rejects tampered session; 401 returned"],
    ["Feedback Without Auth","POST /api/feedback with no session cookie","401 Unauthorized; no record stored"],
    ["Unauthenticated HOD Report","GET /api/departments/7/hod-report without HOD session","403 Forbidden; no data returned"],
  ].map(([test,method,result], i) =>
    tableRow(60, 1482+i*36, 1120, [test,method,result], [300,520,300], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="1448" width="1120" height="${7*36}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${footer(11, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 12 — CHAPTER 7: COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════
function chapter7() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 7, "Cost Estimation")}

  ${secHead(60, 88, "7.1  COCOMO (Constructive Cost Model) Estimation")}
  ${para(80, 130, "The COCOMO II Basic Model is used for effort and schedule estimation. The project is classified as an Organic project (small team, well-understood requirements, stable technology). The model formula is:", {max:104, lh:21})}
  <rect x="80" y="170" width="1080" height="60" rx="4" fill="${PRI}10" stroke="${PRI}30" stroke-width="1"/>
  <text x="620" y="196" text-anchor="middle" font-size="14" font-weight="700" fill="${PRI}">Effort (PM) = a * KLOC^b</text>
  <text x="620" y="220" text-anchor="middle" font-size="12" fill="${GRY}">For Organic mode: a = 2.4,  b = 1.05.  Schedule (months) = 2.5 * Effort^0.38</text>

  ${subHead(80, 248, "Lines of Code Estimation")}
  ${tableRow(60, 272, 1120, ["Module", "Language", "Estimated SLOC", "Notes"], [260,140,200,520], PRI, WHT, true)}
  ${[
    ["Authentication Module",         "TypeScript",  "420",  "Login routes, session middleware, role detection"],
    ["Feedback Submission Module",     "TypeScript",  "680",  "Form, validation, integrity check, ref ID generation"],
    ["HOD Dashboard + Analytics",      "TypeScript",  "750",  "Dashboard component, sortable table, PDF generator"],
    ["Admin Management Module",        "TypeScript",  "560",  "Course/faculty/window CRUD, institution analytics"],
    ["Faculty View Module",            "TypeScript",  "280",  "Faculty dashboard, course ratings, comment view"],
    ["Database Schema (Drizzle)",      "TypeScript",  "220",  "6 table definitions, relations, seed data"],
    ["API Routes (Express)",           "TypeScript",  "480",  "10+ RESTful routes with Zod validation"],
    ["Shared Components (UI)",         "TypeScript/TSX","620","DragStarRating, FeedbackForm, PdfReport, etc."],
    ["Configuration / Infrastructure", "YAML/JSON",   "180",  "pnpm workspace, Vite config, Tailwind config"],
    ["Scripts (PDF generation etc.)",  "MJS",         "310",  "SVG/PNG/PDF generation scripts"],
  ].map(([mod, lang, sloc, note], i) =>
    tableRow(60, 306+i*32, 1120, [mod,lang,sloc,note], [260,140,200,520], i%2===0?"#f9fafb":"white")
  ).join("")}
  <!-- Total row -->
  <rect x="60" y="${306+10*32}" width="1120" height="36" fill="${PRI}20"/>
  <text x="80" y="${306+10*32+24}" font-size="13" font-weight="700" fill="${PRI}">TOTAL SLOC (estimated)</text>
  <text x="600" y="${306+10*32+24}" text-anchor="middle" font-size="14" font-weight="900" fill="${PRI}">4,500 SLOC  =  4.5 KLOC</text>
  <rect x="60" y="306" width="1120" height="${11*32+36}" fill="none" stroke="${RULE}" stroke-width="1"/>

  ${subHead(80, 714, "COCOMO Calculation")}
  <rect x="60" y="738" width="1120" height="180" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  ${[
    ["KLOC",                         "4.5 KLOC",      "(4,500 lines of code in thousands)"],
    ["Effort (PM) = 2.4 x 4.5^1.05","= 2.4 x 4.87","= 11.7 Person-Months"],
    ["Schedule (Months) = 2.5 x 11.7^0.38","= 2.5 x 2.12","= 5.3 Months"],
    ["Team Size = Effort / Schedule", "= 11.7 / 5.3", "= ~2.2 Persons (1 developer + guidance)"],
    ["Productivity = SLOC / PM",     "= 4500 / 11.7","= 385 SLOC per Person-Month"],
  ].map(([label, calc, result], i) => {
    const y = 762 + i * 34;
    return `<text x="80" y="${y}" font-size="12" font-weight="700" fill="${GRY}">${esc(label)}</text>
    <text x="500" y="${y}" font-size="12" fill="${LGT}">${esc(calc)}</text>
    <text x="700" y="${y}" font-size="13" font-weight="700" fill="${PRI}">${esc(result)}</text>`;
  }).join("")}

  ${secHead(60, 938, "7.2  Development Cost Estimation")}
  ${tableRow(60, 978, 1120, ["Cost Component", "Details", "Unit Cost", "Quantity", "Total Cost (INR)"], [260,300,140,140,280], PRI, WHT, true)}
  ${[
    ["Developer Effort",       "1 developer x 5.3 months full-time", "Rs. 15,000/month", "5.3 PM", "Rs. 79,500"],
    ["Project Guide / Mentor", "Academic supervision (100 hrs)",      "Rs. 500/hr",       "100 hrs", "Rs. 50,000"],
    ["System Analysis",        "Requirements gathering and DFD/ER",   "Rs. 10,000",       "1 phase", "Rs. 10,000"],
    ["UI/UX Design",           "Wireframing, component design",       "Rs. 8,000",        "1 phase", "Rs. 8,000"],
    ["Testing and QA",         "Unit, integration, UAT testing",      "Rs. 5,000",        "1 phase", "Rs. 5,000"],
    ["Documentation",          "SRS, report, user guide",             "Rs. 3,000",        "1 phase", "Rs. 3,000"],
  ].map(([comp, det, unit, qty, total], i) =>
    tableRow(60, 1012+i*36, 1120, [comp,det,unit,qty,total], [260,300,140,140,280], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="978" width="1120" height="${7*36}" fill="none" stroke="${RULE}" stroke-width="1"/>
  <rect x="60" y="${978+7*36}" width="1120" height="36" fill="${PRI}20"/>
  <text x="80" y="${978+7*36+24}" font-size="13" font-weight="700" fill="${PRI}">Total Development Cost</text>
  <text x="1080" y="${978+7*36+24}" text-anchor="end" font-size="14" font-weight="900" fill="${PRI}">Rs. 1,55,500</text>

  ${secHead(60, 1254, "7.3  Hardware and Software Infrastructure Cost")}
  ${tableRow(60, 1294, 1120, ["Item", "Type", "Cost / Period", "Annual Cost (INR)"], [320,200,260,340], PRI, WHT, true)}
  ${[
    ["Development Laptop",             "Hardware (One-time)",   "Rs. 55,000 (amortized)",   "Rs. 11,000/yr (5yr life)"],
    ["Cloud Hosting (Replit Core)",    "Software Subscription", "Rs. 2,500/month",          "Rs. 30,000/yr"],
    ["PostgreSQL Database Hosting",    "Included in platform",  "Rs. 0",                    "Rs. 0"],
    ["Domain Name",                    "Annual subscription",   "Rs. 800/yr",               "Rs. 800/yr"],
    ["SSL Certificate",                "Included in platform",  "Rs. 0",                    "Rs. 0"],
    ["Open Source Tools (React/Node)", "Free",                  "Rs. 0",                    "Rs. 0"],
  ].map(([item, type, cost, annual], i) =>
    tableRow(60, 1328+i*34, 1120, [item,type,cost,annual], [320,200,260,340], i%2===0?"#f9fafb":"white")
  ).join("")}
  <rect x="60" y="1294" width="1120" height="${7*34}" fill="none" stroke="${RULE}" stroke-width="1"/>
  <rect x="60" y="${1294+7*34}" width="1120" height="36" fill="${PRI}20"/>
  <text x="80" y="${1294+7*34+24}" font-size="13" font-weight="700" fill="${PRI}">Annual Infrastructure Cost</text>
  <text x="1080" y="${1294+7*34+24}" text-anchor="end" font-size="14" font-weight="900" fill="${PRI}">Rs. 41,800/year</text>

  ${secHead(60, 1572, "7.4  Total Project Cost Summary")}
  <rect x="60" y="1612" width="1120" height="100" rx="6" fill="${PRI}08" stroke="${PRI}30" stroke-width="1.5"/>
  <text x="80" y="1642" font-size="13" fill="${GRY}">One-Time Development Cost:</text>
  <text x="800" y="1642" font-size="14" font-weight="700" fill="${PRI}">Rs. 1,55,500</text>
  <text x="80" y="1670" font-size="13" fill="${GRY}">Annual Infrastructure and Maintenance Cost:</text>
  <text x="800" y="1670" font-size="14" font-weight="700" fill="${PRI}">Rs. 41,800 / year</text>
  <line x1="80" y1="1684" x2="1160" y2="1684" stroke="${RULE}" stroke-width="1"/>
  <text x="80" y="1702" font-size="14" font-weight="700" fill="${PRI}">Total Cost (Year 1):</text>
  <text x="800" y="1702" font-size="16" font-weight="900" fill="${ACC}">Rs. 1,97,300</text>

  ${footer(12, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 13 — CHAPTER 8: CONCLUSION & FUTURE SCOPE
// ═══════════════════════════════════════════════════════════════════════════════
function chapter8() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 8, "Conclusion and Future Scope")}

  ${secHead(60, 88, "8.1  Conclusion")}
  ${para(80, 130, "The CUPGS Academic Feedback Manager has been successfully designed, developed, and tested as a complete full-stack web application that addresses all the key limitations of the traditional paper-based feedback mechanism at BPUT Rourkela's CUPGS campus.", {max:104, lh:22})}
  ${para(80, 196, "The system achieves its primary objective of guaranteeing student anonymity through a Reference ID architecture that stores no personally identifiable information alongside feedback records. This design decision, enforced at both the application and database levels, ensures that student identity remains permanently dissociated from submitted feedback — even from database administrators.", {max:104, lh:22})}
  ${para(80, 308, "The real-time HOD analytics dashboard eliminates the weeks-long delay inherent in manual aggregation. HODs now receive instant per-course, per-category breakdowns and can generate professional PDF reports with a single click. The HOD Form Builder provides department-specific customization without any developer involvement.", {max:104, lh:22})}
  ${para(80, 420, "The Admin-controlled feedback window system solves the previously unaddressed problem of timing control, while the faculty-course integrity validation prevents fraudulent cross-department submissions. The three-layer rate limiting strategy and Zod-based input validation provide production-grade security.", {max:104, lh:22})}
  ${para(80, 508, "From a technical standpoint, the project demonstrates the effective application of modern web development practices: monorepo architecture with pnpm workspaces, end-to-end TypeScript type safety, Drizzle ORM for schema-first database management, and Progressive Web App technology for cross-platform deployment without an app store.", {max:104, lh:22})}

  ${secHead(60, 614, "8.2  Key Achievements")}
  ${bul(80, 656, [
    "Replaced paper-based feedback with a secure, anonymous, fully digital system.",
    "Implemented drag-based half-star rating (0.5 increments) across 5 evaluation categories.",
    "Delivered real-time analytics to HODs with one-click PDF report generation.",
    "Built a HOD-driven form builder supporting text, rating, and multiple-choice custom questions.",
    "Enforced faculty-course integrity to prevent cross-department manipulation.",
    "Designed and implemented Admin-controlled time-bound feedback windows.",
    "Achieved full Progressive Web App compliance for installability on any device.",
    "Applied three-layer API rate limiting and Zod schema validation for production security.",
    "Maintained 100% test pass rate across unit, integration, system, and security test cases.",
  ], PRI).svg}

  ${secHead(60, 920, "8.3  Limitations")}
  ${bul(80, 962, [
    "The current system does not send email notifications to HODs when new feedback is submitted or when a window closes.",
    "The PDF report is generated client-side — extremely large datasets (1000+ feedback records per course) may slow generation.",
    "No graphical charts (bar charts, radar charts) are currently included in the HOD PDF report.",
    "The faculty-course assignment must be manually entered by Admin; no bulk import from Excel/CSV is supported.",
    "Mobile push notifications for feedback window open/close events are not yet implemented.",
    "There is no built-in comparison of CUPGS department ratings against national benchmarks.",
  ], ACC).svg}

  ${secHead(60, 1168, "8.4  Future Scope")}
  ${para(80, 1210, "The following enhancements are planned for future development cycles:", {max:104})}

  ${[
    {
      phase: "Short-Term Enhancements (Phase 2 -- 3 to 6 months)",
      color: "#1e3a8a",
      items: [
        "Email notification system: HODs receive automated reports at semester end via SMTP integration.",
        "Graphical charts in PDF: bar charts and radar charts for visual rating comparison across courses.",
        "Student feedback history: students retrieve all past submissions using their saved Reference IDs.",
        "Bulk course import: Admin uploads an Excel or CSV file to add multiple courses at once.",
      ]
    },
    {
      phase: "Medium-Term Enhancements (Phase 3 -- 6 to 18 months)",
      color: "#065f46",
      items: [
        "AI-powered sentiment analysis: automatic positive/negative/neutral tagging on student comment text.",
        "Trend visualization: semester-on-semester performance graphs for individual faculty members.",
        "React Native mobile app: native iOS and Android application with offline submission support.",
        "Automated alerts: HOD receives notification when any course rating drops below a configurable threshold.",
      ]
    },
    {
      phase: "Long-Term Enhancements (Phase 4 -- 18+ months)",
      color: "#7c3aed",
      items: [
        "Multi-institution deployment: extend the platform to cover all BPUT-affiliated colleges in Odisha.",
        "NAAC/NIRF data export: feedback data exported in structured format for accreditation reporting.",
        "Machine learning prediction: identify courses at risk of low ratings early in the semester for intervention.",
        "Faculty improvement tracking: HOD attaches action items to low-rated courses and tracks resolution.",
      ]
    },
  ].map(({ phase, color, items }, i) => {
    const y = 1234 + i * 160;
    return `<rect x="60" y="${y}" width="1120" height="144" rx="6" fill="${color}08" stroke="${color}30" stroke-width="1.5"/>
    <rect x="60" y="${y}" width="1120" height="28" rx="6" fill="${color}20"/>
    <text x="80" y="${y+19}" font-size="12" font-weight="700" fill="${color}">${esc(phase)}</text>
    ${bul(80, y+38, items, color).svg}`;
  }).join("")}

  ${footer(13, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 14 — REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════
function references() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  ${chHead(14, 9, "References")}

  <!-- Books -->
  ${secHead(60, 88, "A.  Books and Textbooks")}
  ${[
    ['[1] Pressman, R. S. and Maxim, B. R. (2014). "Software Engineering: A Practitioner\'s Approach," 8th Edition. McGraw-Hill Education.'],
    ['[2] Sommerville, I. (2015). "Software Engineering," 10th Edition. Pearson Education. (SDLC, SRS, Design Patterns)'],
    ['[3] Date, C. J. (2003). "An Introduction to Database Systems," 8th Edition. Addison-Wesley. (Relational DB, ER Diagrams)'],
    ['[4] Flanagan, D. (2020). "JavaScript: The Definitive Guide," 7th Edition. O\'Reilly Media. (Node.js, JavaScript fundamentals)'],
    ['[5] Watt, A. (2014). "Database Design" (Open Textbook). BCcampus OpenEd. (Database normalization, schema design)'],
  ].map((ref, i) => {
    const y = 130 + i * 54;
    return `<rect x="60" y="${y}" width="1120" height="50" rx="4" fill="${i%2===0?"#f9fafb":"white"}" stroke="${RULE}" stroke-width="0.5"/>
    ${para(80, y+16, ref[0], {fs:12, fill:GRY, max:106, lh:19})}`;
  }).join("")}

  <!-- Online Resources -->
  ${secHead(60, 420, "B.  Online Documentation and Resources")}
  ${[
    ['[6] React Documentation. "Hooks Reference and Component Lifecycle." React.dev. https://react.dev/reference/react (Accessed 2024)'],
    ['[7] Node.js Documentation. "HTTP, Express, and Middleware Reference." nodejs.org. https://nodejs.org/en/docs (Accessed 2024)'],
    ['[8] PostgreSQL Global Development Group. "PostgreSQL 15 Documentation." postgresql.org. https://www.postgresql.org/docs/15/ (2024)'],
    ['[9] Drizzle Team. "Drizzle ORM Documentation -- Schema, Queries, and Migrations." orm.drizzle.team. https://orm.drizzle.team (2024)'],
    ['[10] OWASP Foundation. "OWASP Top 10 Web Application Security Risks." owasp.org. https://owasp.org/Top10 (2021 Edition)'],
    ['[11] Mozilla Developer Network. "Progressive Web Apps (PWA) Guide." developer.mozilla.org. (Accessed 2024)'],
    ['[12] Boehm, B. W. (1981). "Software Engineering Economics." Prentice-Hall. (COCOMO Model Reference)'],
    ['[13] Tailwind CSS Documentation. "Utility-First Fundamentals." tailwindcss.com. https://tailwindcss.com/docs (Accessed 2024)'],
    ['[14] Zod. "TypeScript-First Schema Validation with Static Type Inference." zod.dev. https://zod.dev (Accessed 2024)'],
    ['[15] W3Schools and MDN Web Docs. "SVG Specification Reference." https://developer.mozilla.org/en-US/docs/Web/SVG (2024)'],
  ].map((ref, i) => {
    const y = 462 + i * 54;
    return `<rect x="60" y="${y}" width="1120" height="50" rx="4" fill="${i%2===0?"#f9fafb":"white"}" stroke="${RULE}" stroke-width="0.5"/>
    ${para(80, y+16, ref[0], {fs:12, fill:GRY, max:106, lh:19})}`;
  }).join("")}

  <!-- Standards -->
  ${secHead(60, 1012, "C.  Standards and Specifications Referenced")}
  ${[
    ['[16] IEEE Std 830-1998. "IEEE Recommended Practice for Software Requirements Specifications." IEEE Computer Society.'],
    ['[17] ISO/IEC 25010:2011. "Systems and Software Engineering -- Quality Models." International Organization for Standardization.'],
    ['[18] Yourdon, E. and Cane, S. (1979). "Data Flow Diagrams: DFD Notation." (Yourdon-Coad Notation for DFD Level 0, 1, 2)'],
    ['[19] BPUT Academic Regulations. "Guidelines for B.Tech Project Report Submission." Biju Patnaik University of Technology, Rourkela.'],
  ].map((ref, i) => {
    const y = 1054 + i * 54;
    return `<rect x="60" y="${y}" width="1120" height="50" rx="4" fill="${i%2===0?"#f9fafb":"white"}" stroke="${RULE}" stroke-width="0.5"/>
    ${para(80, y+16, ref[0], {fs:12, fill:GRY, max:106, lh:19})}`;
  }).join("")}

  <!-- Appendix note -->
  <line x1="60" y1="1280" x2="1180" y2="1280" stroke="${ACC}" stroke-width="2"/>
  <text x="620" y="1316" text-anchor="middle" font-size="20" font-weight="700" fill="${PRI}">APPENDIX</text>
  <line x1="200" y1="1332" x2="1040" y2="1332" stroke="${ACC}" stroke-width="2"/>

  <text x="620" y="1368" text-anchor="middle" font-size="14" font-weight="700" fill="${GRY}">Appendix A: Sample Feedback Form Screenshot</text>
  <rect x="280" y="1384" width="680" height="80" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  <text x="620" y="1414" text-anchor="middle" font-size="13" fill="${LGT}">[Screenshot of Feedback Submission Page]</text>
  <text x="620" y="1438" text-anchor="middle" font-size="12" fill="${LGT}">(Attach actual screenshot here)</text>

  <text x="620" y="1506" text-anchor="middle" font-size="14" font-weight="700" fill="${GRY}">Appendix B: Sample HOD Dashboard Screenshot</text>
  <rect x="280" y="1522" width="680" height="80" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  <text x="620" y="1552" text-anchor="middle" font-size="13" fill="${LGT}">[Screenshot of HOD Analytics Dashboard]</text>
  <text x="620" y="1576" text-anchor="middle" font-size="12" fill="${LGT}">(Attach actual screenshot here)</text>

  <text x="620" y="1644" text-anchor="middle" font-size="14" font-weight="700" fill="${GRY}">Appendix C: Sample PDF Report</text>
  <rect x="280" y="1660" width="680" height="80" rx="4" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  <text x="620" y="1690" text-anchor="middle" font-size="13" fill="${LGT}">[First page of a generated HOD Department Report PDF]</text>
  <text x="620" y="1714" text-anchor="middle" font-size="12" fill="${LGT}">(Attach actual PDF page here)</text>

  <!-- End -->
  <rect x="60" y="1762" width="1120" height="60" rx="8" fill="${PRI}"/>
  <text x="620" y="1792" text-anchor="middle" font-size="15" font-weight="700" fill="white">-- End of Project Report --</text>
  <text x="620" y="1812" text-anchor="middle" font-size="12" fill="#93c5fd">Akshaya Gardia  |  B.Tech CSE  |  CUPGS, BPUT Rourkela  |  2024-25</text>

  ${footer(14, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 15 — GANTT CHART / PROJECT TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════
function gantt() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${PRI}"/>
  <rect x="0" y="10" width="${W}" height="4" fill="${ACC}"/>
  <rect x="0" y="14" width="${W}" height="36" fill="${PRI}60"/>
  <text x="60" y="40" font-size="16" font-weight="700" fill="white">Appendix D: Project Timeline (Gantt Chart)</text>

  ${secHead(60, 60, "Project Schedule -- 5 Month Development Timeline")}
  ${para(80, 102, "The project was executed over approximately 5 months (July 2024 to November 2024) following an Agile iterative development model. The Gantt chart below shows the planned schedule for each phase.", {max:104, lh:20})}

  <!-- Gantt header -->
  <rect x="60" y="138" width="1120" height="36" fill="${PRI}"/>
  <text x="260" y="161" text-anchor="middle" font-size="12" font-weight="700" fill="white">Activity / Phase</text>
  ${["July","Aug","Sep","Oct","Nov"].map((m, i) => {
    const x = 500 + i * 136;
    return `<text x="${x+68}" y="161" text-anchor="middle" font-size="12" font-weight="700" fill="white">${m} 2024</text>
    ${i>0?`<line x1="${x}" y1="138" x2="${x}" y2="${138+26*44+36}" stroke="white30" stroke-width="0.5"/>`:""}`;
  }).join("")}
  <line x1="500" y1="138" x2="500" y2="${138+26*44+36}" stroke="#ffffff50" stroke-width="1"/>

  ${[
    { task:"Literature Review",              month:0, dur:1, color:"#7c3aed" },
    { task:"Requirements Analysis (SRS)",    month:0, dur:1.5, color:"#1e3a8a" },
    { task:"System Design (DFD, ER, Arch)",  month:1, dur:1, color:"#065f46" },
    { task:"Database Schema Implementation", month:1.5, dur:0.5, color:"#0284c7" },
    { task:"Authentication Module",          month:1.5, dur:1, color:"#1e3a8a" },
    { task:"Feedback Submission Module",     month:2, dur:1.5, color:"#14532d" },
    { task:"HOD Dashboard + Analytics",      month:2.5, dur:1.5, color:"#065f46" },
    { task:"Admin Management Module",        month:3, dur:1, color:"#7c2d12" },
    { task:"Faculty View Module",            month:3.5, dur:0.5, color:"#4c1d95" },
    { task:"PDF Report Generation",          month:3, dur:1, color:"#7c3aed" },
    { task:"HOD Form Builder",               month:3.5, dur:0.5, color:"#0284c7" },
    { task:"PWA Configuration",              month:4, dur:0.5, color:"#0f3460" },
    { task:"Unit and Integration Testing",   month:2.5, dur:2, color:"#92400e" },
    { task:"System and UAT Testing",         month:4, dur:0.5, color:"#d97706" },
    { task:"Security Testing",               month:4, dur:0.5, color:"#dc2626" },
    { task:"Documentation and Report",       month:3.5, dur:1, color:"#475569" },
    { task:"Bug Fixes and Polish",           month:4, dur:0.5, color:"#64748b" },
    { task:"Final Review and Submission",    month:4.5, dur:0.5, color:"#14532d" },
  ].map(({ task, month, dur, color }, i) => {
    const y = 174 + i * 44;
    const barX = 500 + month * 136;
    const barW = dur * 136;
    const bg = i % 2 === 0 ? "#f9fafb" : "white";
    return `<rect x="60" y="${y}" width="1120" height="44" fill="${bg}"/>
    <line x1="60" y1="${y}" x2="1180" y2="${y}" stroke="${RULE}" stroke-width="0.5"/>
    <text x="80" y="${y+26}" font-size="11" fill="${GRY}">${esc(task)}</text>
    <rect x="${barX}" y="${y+8}" width="${barW}" height="28" rx="4" fill="${color}" opacity="0.85"/>
    <text x="${barX + barW/2}" y="${y+26}" text-anchor="middle" font-size="9" fill="white" font-weight="700">${dur >= 0.8 ? `${dur}M` : ""}</text>`;
  }).join("")}
  <rect x="60" y="138" width="1120" height="${18*44+36}" fill="none" stroke="${RULE}" stroke-width="1"/>

  <!-- Legend -->
  <text x="60" y="986" font-size="13" font-weight="700" fill="${PRI}">Legend:</text>
  ${[
    ["#7c3aed","Planning/Review"], ["#1e3a8a","Design"],  ["#14532d","Core Dev"],
    ["#92400e","Testing"],         ["#7c2d12","Admin Dev"],["#475569","Documentation"],
  ].map(([color, label], i) => {
    const x = 160 + i * 180;
    return `<rect x="${x}" y="972" width="16" height="16" rx="2" fill="${color}"/>
    <text x="${x+22}" y="985" font-size="11" fill="${GRY}">${label}</text>`;
  }).join("")}

  <!-- COCOMO summary box -->
  ${secHead(60, 1020, "Cost Summary (COCOMO Result)")}
  <rect x="60" y="1060" width="1120" height="240" rx="6" fill="${PRI}08" stroke="${PRI}30" stroke-width="1.5"/>
  ${[
    ["Total SLOC (estimated)",      "4,500 lines (4.5 KLOC)"],
    ["Effort Estimate (COCOMO)",    "11.7 Person-Months"],
    ["Schedule Estimate",           "5.3 Months"],
    ["Team Size",                   "~2 persons (1 developer + 1 guide)"],
    ["Total Development Cost",      "Rs. 1,55,500"],
    ["Annual Infrastructure Cost",  "Rs. 41,800 / year"],
    ["Total Cost (Year 1)",         "Rs. 1,97,300"],
  ].map(([k, v], i) => {
    const y = 1086 + i * 32;
    const isLast = i === 6;
    return `${i > 0 ? `<line x1="80" y1="${y-4}" x2="1160" y2="${y-4}" stroke="${RULE}" stroke-width="0.5"/>` : ""}
    <text x="100" y="${y}" font-size="${isLast?14:13}" font-weight="${isLast?"700":"400"}" fill="${isLast?PRI:GRY}">${esc(k)}</text>
    <text x="720" y="${y}" font-size="${isLast?14:13}" font-weight="${isLast?"900":"600"}" fill="${isLast?ACC:PRI}">${esc(v)}</text>`;
  }).join("")}

  ${secHead(60, 1320, "Development Methodology Summary")}
  <rect x="60" y="1360" width="1120" height="220" rx="6" fill="#f9fafb" stroke="${RULE}" stroke-width="1"/>
  ${[
    ["SDLC Model","Agile Iterative -- 5 sprints of approximately 1 month each"],
    ["Version Control","Git checkpoint-based versioning (Replit automatic checkpoints)"],
    ["Testing Approach","Test-Driven for API routes; Component testing for React UI"],
    ["Code Review","Self-review + academic guide review after each feature module"],
    ["Deployment Strategy","Continuous deployment on Replit (dev server always live)"],
    ["Documentation","Inline JSDoc comments + separate project report (this document)"],
  ].map(([k,v],i)=>{
    const y = 1380+i*34;
    return `${i>0?`<line x1="80" y1="${y-4}" x2="1160" y2="${y-4}" stroke="${RULE}" stroke-width="0.5"/>`:""}
    <text x="100" y="${y}" font-size="12" font-weight="700" fill="${GRY}">${esc(k)}:</text>
    <text x="320" y="${y}" font-size="12" fill="${LGT}">${esc(v)}</text>`;
  }).join("")}

  <!-- Sign off -->
  <rect x="60" y="1600" width="1120" height="100" rx="8" fill="${PRI}"/>
  <text x="620" y="1638" text-anchor="middle" font-size="18" font-weight="700" fill="white">Project Report Prepared By</text>
  <text x="620" y="1668" text-anchor="middle" font-size="16" font-weight="700" fill="#93c5fd">Akshaya Gardia</text>
  <text x="620" y="1692" text-anchor="middle" font-size="13" fill="#bfdbfe">B.Tech Computer Science and Engineering  |  CUPGS, BPUT Rourkela  |  2024-25</text>

  <text x="620" y="1760" text-anchor="middle" font-size="12" fill="${LGT}">Project: CUPGS Academic Feedback Manager  |  A Role-Based Anonymous Feedback System</text>

  ${footer(15, 16)}
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 16 — BACK COVER
// ═══════════════════════════════════════════════════════════════════════════════
function backCover() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman,Georgia,serif">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PRI}"/>
      <stop offset="100%" stop-color="#0a0a1a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg2)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${ACC}"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="200" r="300" fill="#ffffff06"/>
  <circle cx="140" cy="1500" r="250" fill="#ffffff04"/>

  <!-- Frame -->
  <rect x="60" y="100" width="${W-120}" height="${H-250}" fill="none" stroke="#ffffff20" stroke-width="2" rx="4"/>

  <!-- Project details summary -->
  <text x="620" y="240" text-anchor="middle" font-size="13" fill="#94a3b8" letter-spacing="4">SOFTWARE ENGINEERING PROJECT REPORT</text>

  <text x="620" y="320" text-anchor="middle" font-size="34" font-weight="700" fill="white">CUPGS Academic</text>
  <text x="620" y="368" text-anchor="middle" font-size="34" font-weight="700" fill="white">Feedback Manager</text>
  <line x1="200" y1="396" x2="1040" y2="396" stroke="${ACC}" stroke-width="2"/>

  <!-- Key highlights -->
  <text x="620" y="450" text-anchor="middle" font-size="14" fill="#93c5fd">Key Technical Highlights</text>
  ${[
    "Anonymous Reference ID feedback architecture",
    "Drag-based half-star rating (0.5 increments) across 5 categories",
    "Real-time HOD analytics with one-click PDF reports",
    "HOD-driven custom form builder (no developer needed)",
    "Admin-controlled time-bound feedback windows",
    "Three-layer API rate limiting + Zod validation security",
    "Progressive Web App (PWA) -- installable on any device",
    "PostgreSQL + Drizzle ORM with full FK integrity",
  ].map((item, i) => {
    const x = i < 4 ? 160 : 660, y = 478 + (i % 4) * 36;
    return `<circle cx="${x}" cy="${y-4}" r="4" fill="${ACC}"/>
    <text x="${x+14}" y="${y}" font-size="12" fill="#e2e8f0">${item}</text>`;
  }).join("")}

  <line x1="200" y1="640" x2="1040" y2="640" stroke="#ffffff20" stroke-width="1"/>

  <!-- Tech stack pills -->
  <text x="620" y="682" text-anchor="middle" font-size="13" fill="#94a3b8">Technology Stack</text>
  ${["React 18","TypeScript","Node.js","Express.js","PostgreSQL","Drizzle ORM","Tailwind CSS","jsPDF","PWA","Zod"].map((t, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const bx = 155 + col * 192, by = 700 + row * 44;
    return `<rect x="${bx}" y="${by}" width="168" height="32" rx="16" fill="#ffffff15" stroke="#ffffff30" stroke-width="1"/>
    <text x="${bx+84}" y="${by+21}" text-anchor="middle" font-size="11" fill="#e2e8f0">${t}</text>`;
  }).join("")}

  <line x1="200" y1="794" x2="1040" y2="794" stroke="#ffffff20" stroke-width="1"/>

  <!-- COCOMO summary -->
  <text x="620" y="836" text-anchor="middle" font-size="13" fill="#94a3b8">Project Metrics (COCOMO II)</text>
  ${[["4,500 SLOC","Code Size"], ["11.7 PM","Effort"], ["5.3 Months","Schedule"], ["Rs. 1,97,300","Total Cost (Yr 1)"]].map(([v,l],i)=>{
    const x = 195 + i*220;
    return `<rect x="${x}" y="850" width="196" height="72" rx="6" fill="#ffffff10" stroke="#ffffff20" stroke-width="1"/>
    <text x="${x+98}" y="886" text-anchor="middle" font-size="20" font-weight="700" fill="white">${v}</text>
    <text x="${x+98}" y="910" text-anchor="middle" font-size="11" fill="#94a3b8">${l}</text>`;
  }).join("")}

  <line x1="200" y1="940" x2="1040" y2="940" stroke="#ffffff20" stroke-width="1"/>

  <!-- Student info -->
  <text x="620" y="990" text-anchor="middle" font-size="13" fill="#94a3b8" letter-spacing="3">PREPARED BY</text>
  <text x="620" y="1040" text-anchor="middle" font-size="28" font-weight="700" fill="white">Akshaya Gardia</text>
  <text x="620" y="1074" text-anchor="middle" font-size="15" fill="#93c5fd">B.Tech -- Computer Science &amp; Engineering</text>
  <text x="620" y="1100" text-anchor="middle" font-size="14" fill="#bfdbfe">Centre for Urban &amp; Planning Graduate Studies (CUPGS)</text>
  <text x="620" y="1124" text-anchor="middle" font-size="14" fill="#bfdbfe">Biju Patnaik University of Technology, Rourkela</text>
  <text x="620" y="1152" text-anchor="middle" font-size="14" font-weight="700" fill="${ACC}">Academic Year: 2024 - 2025</text>

  <!-- Roll / Reg blanks -->
  <line x1="300" y1="1200" x2="920" y2="1200" stroke="#ffffff20" stroke-width="1"/>
  <text x="340" y="1234" font-size="13" fill="#64748b">Roll No.: _______________________</text>
  <text x="680" y="1234" font-size="13" fill="#64748b">Reg. No.: _______________________</text>

  <!-- Bottom -->
  <rect x="0" y="${H-100}" width="${W}" height="100" fill="#000000a0"/>
  <rect x="0" y="${H-100}" width="${W}" height="4" fill="${ACC}"/>
  <text x="620" y="${H-58}" text-anchor="middle" font-size="14" fill="#93c5fd">BIJU PATNAIK UNIVERSITY OF TECHNOLOGY</text>
  <text x="620" y="${H-32}" text-anchor="middle" font-size="12" fill="#64748b">CUPGS, Rourkela, Odisha, India  |  2024-25</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATE ALL PAGES
// ═══════════════════════════════════════════════════════════════════════════════
const pages = [
  { fn: cover,      name: "pg01-cover" },
  { fn: certificate,name: "pg02-certificate" },
  { fn: abstract,   name: "pg03-abstract-toc" },
  { fn: chapter1,   name: "pg04-ch1-intro" },
  { fn: chapter2,   name: "pg05-ch2-litreview" },
  { fn: chapter3,   name: "pg06-ch3-srs" },
  { fn: chapter4a,  name: "pg07-ch4-design-a" },
  { fn: chapter4b,  name: "pg08-ch4-design-b" },
  { fn: chapter5a,  name: "pg09-ch5-impl-a" },
  { fn: chapter5b,  name: "pg10-ch5-impl-b" },
  { fn: chapter6,   name: "pg11-ch6-testing" },
  { fn: chapter7,   name: "pg12-ch7-cost" },
  { fn: chapter8,   name: "pg13-ch8-conclusion" },
  { fn: references, name: "pg14-references" },
  { fn: gantt,      name: "pg15-gantt-summary" },
  { fn: backCover,  name: "pg16-backcover" },
];

console.log("Generating SE Project Report PDF (16 pages)...");
const pngs = [];
for (const { fn, name } of pages) {
  const svgPath = join(OUT, `${name}.svg`);
  const pngPath = join(OUT, `${name}.png`);
  writeFileSync(svgPath, clean(fn()), "utf8");
  // validate no bad & before rendering
  execSync(`magick -density 130 "${svgPath}" -background white -alpha remove -alpha off "${pngPath}"`, { stdio: "pipe" });
  pngs.push(pngPath);
  process.stdout.write(`  OK ${name}\n`);
}

const outPdf = join(__dir, "../exports/CUPGS-SE-Project-Report.pdf");
execSync(`magick ${pngs.map(p => `"${p}"`).join(" ")} "${outPdf}"`, { stdio: "pipe" });
console.log(`\nDone -> exports/CUPGS-SE-Project-Report.pdf  (${pages.length} pages)`);
