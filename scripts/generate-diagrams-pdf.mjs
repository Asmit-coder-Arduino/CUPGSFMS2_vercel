import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../exports");
mkdirSync(OUT, { recursive: true });

// ═══════════════════════════════════════════════════════════════════════════════
// SVG 1 — DFD Level 0 Context Diagram
// ═══════════════════════════════════════════════════════════════════════════════
const svg0 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900" font-family="Arial,Helvetica,sans-serif">
  <!-- Background -->
  <defs>
    <linearGradient id="bg0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f4ff"/>
      <stop offset="100%" stop-color="#e8eef8"/>
    </linearGradient>
    <marker id="arr" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto">
      <polygon points="0 0,12 4.5,0 9" fill="#4b5563"/>
    </marker>
    <filter id="sh">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000022"/>
    </filter>
  </defs>
  <rect width="1400" height="900" fill="url(#bg0)"/>

  <!-- Header Bar -->
  <rect x="0" y="0" width="1400" height="56" fill="#1e3a8a" rx="0"/>
  <text x="700" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="white">DFD Level 0 — Context Diagram</text>
  <text x="700" y="42" text-anchor="middle" font-size="12" fill="#93c5fd">CUPGS Academic Feedback Management System · Yourdon-Coad Notation</text>
  <text x="1380" y="36" text-anchor="end" font-size="10" fill="#60a5fa">Page 1 of 4</text>

  <!-- ─── External Entities ─── -->
  <!-- STUDENT (top) -->
  <rect x="530" y="100" width="200" height="70" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" filter="url(#sh)"/>
  <text x="630" y="128" text-anchor="middle" font-size="15" font-weight="800" fill="white">STUDENT</text>
  <text x="630" y="148" text-anchor="middle" font-size="11" fill="#93c5fd">External Entity</text>

  <!-- HOD (right) -->
  <rect x="1150" y="370" width="180" height="70" rx="6" fill="#065f46" stroke="#059669" stroke-width="2" filter="url(#sh)"/>
  <text x="1240" y="398" text-anchor="middle" font-size="15" font-weight="800" fill="white">HOD</text>
  <text x="1240" y="418" text-anchor="middle" font-size="11" fill="#6ee7b7">External Entity</text>

  <!-- ADMIN (bottom) -->
  <rect x="530" y="720" width="200" height="70" rx="6" fill="#7c2d12" stroke="#ea580c" stroke-width="2" filter="url(#sh)"/>
  <text x="630" y="748" text-anchor="middle" font-size="15" font-weight="800" fill="white">ADMIN</text>
  <text x="630" y="768" text-anchor="middle" font-size="11" fill="#fdba74">External Entity</text>

  <!-- FACULTY (left) -->
  <rect x="70" y="370" width="180" height="70" rx="6" fill="#4c1d95" stroke="#7c3aed" stroke-width="2" filter="url(#sh)"/>
  <text x="160" y="398" text-anchor="middle" font-size="15" font-weight="800" fill="white">FACULTY</text>
  <text x="160" y="418" text-anchor="middle" font-size="11" fill="#c4b5fd">External Entity</text>

  <!-- ─── Central Process ─── -->
  <circle cx="700" cy="430" r="150" fill="#14532d" stroke="#16a34a" stroke-width="3" filter="url(#sh)"/>
  <circle cx="700" cy="430" r="145" fill="none" stroke="#4ade8044" stroke-width="1"/>
  <text x="700" y="408" text-anchor="middle" font-size="16" font-weight="900" fill="#86efac">Process 0.</text>
  <text x="700" y="432" text-anchor="middle" font-size="15" font-weight="700" fill="white">CUPGS Feedback</text>
  <text x="700" y="454" text-anchor="middle" font-size="14" fill="#bbf7d0">Management System</text>

  <!-- ─── Flow Arrows ─── -->
  <!-- Student → System (Feedback) -->
  <line x1="640" y1="170" x2="640" y2="280" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="452" y="208" width="180" height="22" rx="4" fill="white" stroke="#93c5fd" stroke-width="1"/>
  <text x="542" y="223" text-anchor="middle" font-size="11" fill="#1e3a8a" font-weight="600">Feedback Submission</text>

  <!-- System → Student (Confirm) -->
  <line x1="670" y1="280" x2="670" y2="170" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="676" y="208" width="170" height="22" rx="4" fill="white" stroke="#93c5fd" stroke-width="1"/>
  <text x="761" y="223" text-anchor="middle" font-size="11" fill="#1e3a8a" font-weight="600">Submission Confirm</text>

  <!-- HOD → System (Config) -->
  <line x1="1150" y1="390" x2="850" y2="390" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="958" y="368" width="176" height="22" rx="4" fill="white" stroke="#6ee7b7" stroke-width="1"/>
  <text x="1046" y="383" text-anchor="middle" font-size="11" fill="#065f46" font-weight="600">Form Template Config</text>

  <!-- System → HOD (Analytics) -->
  <line x1="850" y1="420" x2="1150" y2="420" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="960" y="422" width="172" height="22" rx="4" fill="white" stroke="#6ee7b7" stroke-width="1"/>
  <text x="1046" y="437" text-anchor="middle" font-size="11" fill="#065f46" font-weight="600">Analytics Report / PDF</text>

  <!-- Admin → System (Config) -->
  <line x1="640" y1="720" x2="640" y2="580" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="452" y="636" width="180" height="22" rx="4" fill="white" stroke="#fdba74" stroke-width="1"/>
  <text x="542" y="651" text-anchor="middle" font-size="11" fill="#7c2d12" font-weight="600">Dept / Course Config</text>

  <!-- System → Admin (Dashboard) -->
  <line x1="670" y1="580" x2="670" y2="720" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="678" y="636" width="178" height="22" rx="4" fill="white" stroke="#fdba74" stroke-width="1"/>
  <text x="767" y="651" text-anchor="middle" font-size="11" fill="#7c2d12" font-weight="600">Institution Dashboard</text>

  <!-- Faculty → System (Request) -->
  <line x1="250" y1="390" x2="550" y2="400" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="270" y="370" width="166" height="22" rx="4" fill="white" stroke="#c4b5fd" stroke-width="1"/>
  <text x="353" y="385" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="600">View Request / Login</text>

  <!-- System → Faculty (Analytics) -->
  <line x1="550" y1="425" x2="250" y2="432" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="270" y="432" width="176" height="22" rx="4" fill="white" stroke="#c4b5fd" stroke-width="1"/>
  <text x="358" y="447" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="600">Performance Analytics</text>

  <!-- ─── Legend ─── -->
  <rect x="20" y="820" width="420" height="66" rx="8" fill="white" stroke="#d1d5db" stroke-width="1.5" filter="url(#sh)"/>
  <text x="34" y="840" font-size="11" font-weight="700" fill="#1e293b">LEGEND — Yourdon-Coad Notation</text>
  <rect x="34" y="848" width="20" height="14" rx="3" fill="#1e3a8a"/>
  <text x="60" y="859" font-size="10" fill="#374151">External Entity (Rectangle)</text>
  <circle cx="185" cy="855" r="12" fill="#14532d" stroke="#16a34a" stroke-width="1.5"/>
  <text x="202" y="859" font-size="10" fill="#374151">Process (Circle)</text>
  <line x1="290" y1="855" x2="334" y2="855" stroke="#4b5563" stroke-width="2" marker-end="url(#arr)"/>
  <text x="340" y="859" font-size="10" fill="#374151">Data Flow</text>
  <text x="34" y="876" font-size="10" fill="#6b7280">Arrows show direction of data movement between entities and the central system process.</text>
</svg>`;

// ═══════════════════════════════════════════════════════════════════════════════
// SVG 2 — DFD Level 1 Functional Decomposition
// ═══════════════════════════════════════════════════════════════════════════════
const svg1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1100" viewBox="0 0 1800 1100" font-family="Arial,Helvetica,sans-serif">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f4ff"/>
      <stop offset="100%" stop-color="#e8eef8"/>
    </linearGradient>
    <marker id="arr1" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto">
      <polygon points="0 0,12 4.5,0 9" fill="#4b5563"/>
    </marker>
    <filter id="sh1"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000022"/></filter>
  </defs>
  <rect width="1800" height="1100" fill="url(#bg1)"/>

  <!-- Header -->
  <rect x="0" y="0" width="1800" height="56" fill="#1e3a8a"/>
  <text x="900" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="white">DFD Level 1 — Functional Decomposition</text>
  <text x="900" y="42" text-anchor="middle" font-size="12" fill="#93c5fd">All Sub-Systems with Data Stores &amp; Flows · Yourdon-Coad + Gane-Sarson Notation</text>
  <text x="1780" y="36" text-anchor="end" font-size="10" fill="#60a5fa">Page 2 of 4</text>

  <!-- ── External Entities (corners) ── -->
  <rect x="20" y="170" width="150" height="60" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" filter="url(#sh1)"/>
  <text x="95" y="196" text-anchor="middle" font-size="13" font-weight="700" fill="white">STUDENT</text>
  <text x="95" y="213" text-anchor="middle" font-size="9" fill="#93c5fd">External Entity</text>

  <rect x="20" y="530" width="150" height="60" rx="6" fill="#4c1d95" stroke="#7c3aed" stroke-width="2" filter="url(#sh1)"/>
  <text x="95" y="556" text-anchor="middle" font-size="13" font-weight="700" fill="white">FACULTY</text>
  <text x="95" y="573" text-anchor="middle" font-size="9" fill="#c4b5fd">External Entity</text>

  <rect x="1630" y="170" width="150" height="60" rx="6" fill="#065f46" stroke="#059669" stroke-width="2" filter="url(#sh1)"/>
  <text x="1705" y="196" text-anchor="middle" font-size="13" font-weight="700" fill="white">HOD</text>
  <text x="1705" y="213" text-anchor="middle" font-size="9" fill="#6ee7b7">External Entity</text>

  <rect x="1630" y="530" width="150" height="60" rx="6" fill="#7c2d12" stroke="#ea580c" stroke-width="2" filter="url(#sh1)"/>
  <text x="1705" y="556" text-anchor="middle" font-size="13" font-weight="700" fill="white">ADMIN</text>
  <text x="1705" y="573" text-anchor="middle" font-size="9" fill="#fdba74">External Entity</text>

  <!-- ── Processes ── -->
  <!-- P1.0 Authentication (top-left) -->
  <circle cx="420" cy="220" r="90" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh1)"/>
  <text x="420" y="205" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">1.0</text>
  <text x="420" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="white">Authentication</text>
  <text x="420" y="243" text-anchor="middle" font-size="11" fill="#bbf7d0">&amp; Session</text>

  <!-- P2.0 Feedback Collection (center-left) -->
  <circle cx="420" cy="560" r="90" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh1)"/>
  <text x="420" y="545" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.0</text>
  <text x="420" y="564" text-anchor="middle" font-size="13" font-weight="700" fill="white">Feedback</text>
  <text x="420" y="583" text-anchor="middle" font-size="11" fill="#bbf7d0">Collection</text>

  <!-- P3.0 Form Template (top-right) -->
  <circle cx="1380" cy="220" r="90" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh1)"/>
  <text x="1380" y="205" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">3.0</text>
  <text x="1380" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="white">Form Template</text>
  <text x="1380" y="243" text-anchor="middle" font-size="11" fill="#bbf7d0">Management</text>

  <!-- P4.0 Analytics (center-right) -->
  <circle cx="1380" cy="560" r="90" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh1)"/>
  <text x="1380" y="545" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">4.0</text>
  <text x="1380" y="564" text-anchor="middle" font-size="13" font-weight="700" fill="white">Analytics &amp;</text>
  <text x="1380" y="583" text-anchor="middle" font-size="11" fill="#bbf7d0">Reporting</text>

  <!-- P5.0 Institution Management (center) -->
  <circle cx="900" cy="390" r="90" fill="#7c2d12" stroke="#ea580c" stroke-width="2.5" filter="url(#sh1)"/>
  <text x="900" y="375" text-anchor="middle" font-size="11" font-weight="900" fill="#fed7aa">5.0</text>
  <text x="900" y="394" text-anchor="middle" font-size="13" font-weight="700" fill="white">Institution</text>
  <text x="900" y="413" text-anchor="middle" font-size="11" fill="#fdba74">Management</text>

  <!-- ── Data Stores (Gane-Sarson) ── -->
  <!-- DS bottom row -->
  <rect x="80" y="810" width="220" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="80" y="810" width="36" height="36" fill="#d97706"/>
  <text x="98" y="832" text-anchor="middle" font-size="11" font-weight="800" fill="white">D1</text>
  <text x="80+36+92" y="833" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Feedback</text>

  <rect x="340" y="810" width="220" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="340" y="810" width="36" height="36" fill="#d97706"/>
  <text x="358" y="832" text-anchor="middle" font-size="11" font-weight="800" fill="white">D2</text>
  <text x="340+36+92" y="833" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Courses</text>

  <rect x="600" y="810" width="220" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="600" y="810" width="36" height="36" fill="#d97706"/>
  <text x="618" y="832" text-anchor="middle" font-size="11" font-weight="800" fill="white">D3</text>
  <text x="600+36+92" y="833" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Faculty</text>

  <rect x="860" y="810" width="240" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="860" y="810" width="36" height="36" fill="#d97706"/>
  <text x="878" y="832" text-anchor="middle" font-size="11" font-weight="800" fill="white">D4</text>
  <text x="860+36+102" y="833" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Departments</text>

  <rect x="1140" y="810" width="240" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="1140" y="810" width="36" height="36" fill="#d97706"/>
  <text x="1158" y="832" text-anchor="middle" font-size="11" font-weight="800" fill="white">D5</text>
  <text x="1140+36+102" y="833" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Form Templates</text>

  <rect x="860" y="130" width="240" height="36" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="860" y="130" width="36" height="36" fill="#d97706"/>
  <text x="878" y="152" text-anchor="middle" font-size="11" font-weight="800" fill="white">D6</text>
  <text x="860+36+102" y="153" text-anchor="middle" font-size="12" font-weight="600" fill="#78350f">Feedback Windows</text>

  <!-- ── Flow Lines ── (key ones with labels) -->
  <!-- Student ↔ P1 Auth -->
  <line x1="170" y1="195" x2="330" y2="213" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="178" y="183" width="142" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="249" y="196" text-anchor="middle" font-size="10" fill="#1e3a8a">Login Credentials</text>
  <line x1="332" y1="230" x2="170" y2="218" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="178" y="218" width="130" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="243" y="231" text-anchor="middle" font-size="10" fill="#1e3a8a">Auth Token</text>

  <!-- Student ↔ P2 Feedback -->
  <line x1="170" y1="548" x2="330" y2="548" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="176" y="528" width="148" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="250" y="541" text-anchor="middle" font-size="10" fill="#1e3a8a">Feedback Submission</text>
  <line x1="330" y1="567" x2="170" y2="575" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="176" y="568" width="144" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="248" y="581" text-anchor="middle" font-size="10" fill="#1e3a8a">Ref ID / Confirm</text>

  <!-- HOD ↔ P3 Form Template -->
  <line x1="1630" y1="195" x2="1470" y2="207" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="1480" y="182" width="144" height="20" rx="3" fill="white" stroke="#6ee7b7" stroke-width="0.8"/>
  <text x="1552" y="195" text-anchor="middle" font-size="10" fill="#065f46">Form Config Request</text>
  <line x1="1470" y1="222" x2="1630" y2="218" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="1480" y="218" width="136" height="20" rx="3" fill="white" stroke="#6ee7b7" stroke-width="0.8"/>
  <text x="1548" y="231" text-anchor="middle" font-size="10" fill="#065f46">Template Saved OK</text>

  <!-- HOD ← P4 Analytics -->
  <line x1="1470" y1="546" x2="1630" y2="546" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="1478" y="526" width="146" height="20" rx="3" fill="white" stroke="#6ee7b7" stroke-width="0.8"/>
  <text x="1551" y="539" text-anchor="middle" font-size="10" fill="#065f46">Analytics / PDF Report</text>

  <!-- Admin ↔ P5 Institution -->
  <line x1="1630" y1="548" x2="990" y2="420" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="1310" y="476" width="136" height="20" rx="3" fill="white" stroke="#fdba74" stroke-width="0.8"/>
  <text x="1378" y="489" text-anchor="middle" font-size="10" fill="#7c2d12">Mgmt Request</text>
  <line x1="990" y1="430" x2="1630" y2="572" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="1316" y="512" width="142" height="20" rx="3" fill="white" stroke="#fdba74" stroke-width="0.8"/>
  <text x="1387" y="525" text-anchor="middle" font-size="10" fill="#7c2d12">System Dashboard</text>

  <!-- P1 → P2 (auth validated) -->
  <line x1="420" y1="310" x2="420" y2="470" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr1)"/>
  <rect x="428" y="378" width="118" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="487" y="391" text-anchor="middle" font-size="10" fill="#14532d">Auth Validated</text>

  <!-- P2 ↔ D1 Feedback store -->
  <line x1="380" y1="648" x2="240" y2="810" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="272" y="718" width="108" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="326" y="731" text-anchor="middle" font-size="10" fill="#78350f">Store Feedback</text>
  <line x1="220" y1="810" x2="360" y2="648" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="166" y="720" width="118" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="225" y="733" text-anchor="middle" font-size="10" fill="#78350f">Feedback Records</text>

  <!-- P2 → D2 Courses -->
  <line x1="430" y1="648" x2="460" y2="810" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="442" y="718" width="100" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="492" y="731" text-anchor="middle" font-size="10" fill="#78350f">Course Lookup</text>

  <!-- P3 ↔ D5 Form Templates -->
  <line x1="1380" y1="310" x2="1260" y2="810" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="1286" y="548" width="112" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="1342" y="561" text-anchor="middle" font-size="10" fill="#78350f">Save Template</text>
  <line x1="1246" y1="810" x2="1366" y2="310" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="1174" y="568" width="110" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="1229" y="581" text-anchor="middle" font-size="10" fill="#78350f">Load Template</text>

  <!-- P2 ↔ D6 Feedback Windows -->
  <line x1="900" y1="166" x2="506" y2="490" stroke="#4b5563" stroke-width="1.6" stroke-dasharray="6,3" marker-end="url(#arr1)"/>
  <rect x="680" y="288" width="136" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="748" y="301" text-anchor="middle" font-size="10" fill="#78350f">Window Status Check</text>

  <!-- P4 read D1 -->
  <line x1="1280" y1="630" x2="300" y2="810" stroke="#4b5563" stroke-width="1.6" stroke-dasharray="6,3" marker-end="url(#arr1)"/>
  <rect x="750" y="720" width="126" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="813" y="733" text-anchor="middle" font-size="10" fill="#78350f">Read All Feedback</text>

  <!-- P5 → D4 Departments -->
  <line x1="900" y1="480" x2="980" y2="810" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr1)"/>
  <rect x="900" y="638" width="110" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="955" y="651" text-anchor="middle" font-size="10" fill="#78350f">Manage Depts</text>

  <!-- ── Legend ── -->
  <rect x="20" y="1020" width="560" height="66" rx="8" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="36" y="1040" font-size="11" font-weight="700" fill="#1e293b">LEGEND</text>
  <rect x="36" y="1048" width="20" height="14" rx="2" fill="#1e3a8a"/>
  <text x="62" y="1060" font-size="10" fill="#374151">External Entity</text>
  <circle cx="154" cy="1055" r="10" fill="#14532d" stroke="#16a34a" stroke-width="1"/>
  <text x="170" y="1059" font-size="10" fill="#374151">Process (Circle)</text>
  <rect x="268" y="1048" width="24" height="14" fill="#d97706"/>
  <rect x="292" y="1048" width="70" height="14" fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
  <text x="370" y="1059" font-size="10" fill="#374151">Data Store (Gane-Sarson)</text>
  <line x1="506" y1="1055" x2="546" y2="1055" stroke="#4b5563" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="554" y="1059" font-size="10" fill="#374151">DB Read</text>
</svg>`;

// ═══════════════════════════════════════════════════════════════════════════════
// SVG 3 — DFD Level 2 Process 2.0 Explosion
// ═══════════════════════════════════════════════════════════════════════════════
const svg2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="950" viewBox="0 0 1400 950" font-family="Arial,Helvetica,sans-serif">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <marker id="arr2" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto">
      <polygon points="0 0,12 4.5,0 9" fill="#4b5563"/>
    </marker>
    <filter id="sh2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000022"/></filter>
  </defs>
  <rect width="1400" height="950" fill="url(#bg2)"/>

  <!-- Header -->
  <rect x="0" y="0" width="1400" height="56" fill="#0c4a6e"/>
  <text x="700" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="white">DFD Level 2 — Process 2.0 Explosion</text>
  <text x="700" y="42" text-anchor="middle" font-size="12" fill="#7dd3fc">Feedback Collection Sub-Processes · Yourdon-Coad Notation</text>
  <text x="1380" y="36" text-anchor="end" font-size="10" fill="#7dd3fc">Page 3 of 4</text>

  <!-- Explosion boundary box -->
  <rect x="60" y="80" width="1280" height="650" rx="12" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="12,5"/>
  <rect x="60" y="80" width="360" height="28" rx="5" fill="#0284c7"/>
  <text x="78" y="98" font-size="11" fill="white" font-weight="700">Process 2.0 — Feedback Collection (Exploded View)</text>

  <!-- External Interfaces -->
  <rect x="6" y="270" width="120" height="56" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2" filter="url(#sh2)"/>
  <text x="66" y="294" text-anchor="middle" font-size="12" font-weight="700" fill="white">STUDENT</text>
  <text x="66" y="311" text-anchor="middle" font-size="9" fill="#93c5fd">input source</text>

  <rect x="6" y="430" width="120" height="56" rx="5" fill="#065f46" stroke="#059669" stroke-width="2" filter="url(#sh2)"/>
  <text x="66" y="452" text-anchor="middle" font-size="11" font-weight="700" fill="white">HOD FORM</text>
  <text x="66" y="470" text-anchor="middle" font-size="9" fill="#6ee7b7">template source</text>

  <!-- Sub-Processes in 2-row layout -->
  <!-- Row 1: 2.1 → 2.3 → 2.4 -->
  <circle cx="300" cy="220" r="78" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="300" y="205" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.1</text>
  <text x="300" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="white">Validate</text>
  <text x="300" y="243" text-anchor="middle" font-size="11" fill="#a7f3d0">Inputs</text>

  <circle cx="700" cy="220" r="78" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="700" y="205" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.3</text>
  <text x="700" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="white">Profanity</text>
  <text x="700" y="243" text-anchor="middle" font-size="11" fill="#a7f3d0">Filter</text>

  <circle cx="1100" cy="220" r="78" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="1100" y="205" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.4</text>
  <text x="1100" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="white">Course-Faculty</text>
  <text x="1100" y="243" text-anchor="middle" font-size="11" fill="#a7f3d0">Integrity Check</text>

  <!-- Row 2: 2.2 → center → 2.5 → 2.6 -->
  <circle cx="300" cy="490" r="78" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="300" y="475" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.2</text>
  <text x="300" y="494" text-anchor="middle" font-size="13" font-weight="700" fill="white">Check Window</text>
  <text x="300" y="513" text-anchor="middle" font-size="11" fill="#a7f3d0">Availability</text>

  <circle cx="700" cy="490" r="78" fill="#14532d" stroke="#16a34a" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="700" y="475" text-anchor="middle" font-size="11" font-weight="900" fill="#86efac">2.5</text>
  <text x="700" y="494" text-anchor="middle" font-size="13" font-weight="700" fill="white">Generate</text>
  <text x="700" y="513" text-anchor="middle" font-size="11" fill="#a7f3d0">Reference ID</text>

  <circle cx="1100" cy="490" r="78" fill="#0f4c81" stroke="#2563eb" stroke-width="2.5" filter="url(#sh2)"/>
  <text x="1100" y="475" text-anchor="middle" font-size="11" font-weight="900" fill="#bfdbfe">2.6</text>
  <text x="1100" y="494" text-anchor="middle" font-size="13" font-weight="700" fill="white">Store</text>
  <text x="1100" y="513" text-anchor="middle" font-size="11" fill="#93c5fd">Feedback Record</text>

  <!-- Data Stores at bottom -->
  <rect x="80" y="790" width="200" height="34" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="80" y="790" width="34" height="34" fill="#d97706"/>
  <text x="97" y="811" text-anchor="middle" font-size="10" font-weight="800" fill="white">D1</text>
  <text x="80+34+83" y="812" text-anchor="middle" font-size="11" font-weight="600" fill="#78350f">Feedback</text>

  <rect x="320" y="790" width="200" height="34" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="320" y="790" width="34" height="34" fill="#d97706"/>
  <text x="337" y="811" text-anchor="middle" font-size="10" font-weight="800" fill="white">D2</text>
  <text x="320+34+83" y="812" text-anchor="middle" font-size="11" font-weight="600" fill="#78350f">Courses</text>

  <rect x="560" y="790" width="200" height="34" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="560" y="790" width="34" height="34" fill="#d97706"/>
  <text x="577" y="811" text-anchor="middle" font-size="10" font-weight="800" fill="white">D3</text>
  <text x="560+34+83" y="812" text-anchor="middle" font-size="11" font-weight="600" fill="#78350f">Faculty</text>

  <rect x="800" y="790" width="230" height="34" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="800" y="790" width="34" height="34" fill="#d97706"/>
  <text x="817" y="811" text-anchor="middle" font-size="10" font-weight="800" fill="white">D6</text>
  <text x="800+34+98" y="812" text-anchor="middle" font-size="11" font-weight="600" fill="#78350f">Feedback Windows</text>

  <!-- ── Flow Arrows ── -->
  <!-- Student → 2.1 -->
  <line x1="126" y1="285" x2="222" y2="237" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="136" y="246" width="138" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="205" y="259" text-anchor="middle" font-size="10" fill="#1e3a8a">Raw Feedback Data</text>

  <!-- HOD Form → 2.1 -->
  <line x1="126" y1="458" x2="222" y2="405" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="130" y="425" width="112" height="20" rx="3" fill="white" stroke="#6ee7b7" stroke-width="0.8"/>
  <text x="186" y="438" text-anchor="middle" font-size="10" fill="#065f46">Form Template</text>

  <!-- 2.1 → 2.3 -->
  <line x1="378" y1="220" x2="622" y2="220" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="437" y="200" width="128" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="501" y="213" text-anchor="middle" font-size="10" fill="#14532d">Validated Fields</text>

  <!-- 2.3 → 2.4 -->
  <line x1="778" y1="220" x2="1022" y2="220" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="842" y="200" width="116" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="900" y="213" text-anchor="middle" font-size="10" fill="#14532d">Filtered Content</text>

  <!-- 2.1 ↔ 2.2 (window check) -->
  <line x1="300" y1="298" x2="300" y2="412" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="308" y="345" width="108" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="362" y="358" text-anchor="middle" font-size="10" fill="#14532d">Window Query</text>
  <line x1="280" y1="412" x2="280" y2="298" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="188" y="348" width="108" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="242" y="361" text-anchor="middle" font-size="10" fill="#14532d">Window Status</text>

  <!-- 2.4 → 2.5 -->
  <line x1="1100" y1="298" x2="1100" y2="412" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="1108" y="342" width="126" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="1171" y="355" text-anchor="middle" font-size="10" fill="#14532d">Integrity Passed</text>

  <!-- 2.2 → 2.5 -->
  <line x1="378" y1="490" x2="622" y2="490" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="440" y="470" width="118" height="20" rx="3" fill="white" stroke="#86efac" stroke-width="0.8"/>
  <text x="499" y="483" text-anchor="middle" font-size="10" fill="#14532d">Validation OK</text>

  <!-- 2.5 → 2.6 -->
  <line x1="778" y1="490" x2="1022" y2="490" stroke="#4b5563" stroke-width="1.8" marker-end="url(#arr2)"/>
  <rect x="842" y="470" width="118" height="20" rx="3" fill="white" stroke="#2563eb" stroke-width="0.8"/>
  <text x="901" y="483" text-anchor="middle" font-size="10" fill="#0f4c81">Reference ID</text>

  <!-- 2.6 → D1 Feedback -->
  <line x1="1100" y1="568" x2="250" y2="790" stroke="#4b5563" stroke-width="1.6" marker-end="url(#arr2)"/>
  <rect x="630" y="672" width="136" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="698" y="685" text-anchor="middle" font-size="10" fill="#78350f">Store Feedback Record</text>

  <!-- 2.4 ← D2/D3 Course/Faculty -->
  <line x1="420" y1="790" x2="1060" y2="298" stroke="#4b5563" stroke-width="1.4" stroke-dasharray="6,3" marker-end="url(#arr2)"/>
  <rect x="700" y="548" width="120" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="760" y="561" text-anchor="middle" font-size="10" fill="#78350f">Course Record</text>

  <line x1="660" y1="790" x2="1080" y2="298" stroke="#4b5563" stroke-width="1.4" stroke-dasharray="6,3" marker-end="url(#arr2)"/>
  <rect x="832" y="540" width="118" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="891" y="553" text-anchor="middle" font-size="10" fill="#78350f">Faculty Record</text>

  <!-- 2.2 ↔ D6 Windows -->
  <line x1="900" y1="790" x2="376" y2="550" stroke="#4b5563" stroke-width="1.4" stroke-dasharray="6,3" marker-end="url(#arr2)"/>
  <rect x="572" y="680" width="140" height="20" rx="3" fill="white" stroke="#d97706" stroke-width="0.8"/>
  <text x="642" y="693" text-anchor="middle" font-size="10" fill="#78350f">Window Record</text>

  <!-- Confirm back to Student -->
  <path d="M1022,490 C860,360 500,310 378,298" stroke="#4b5563" stroke-width="1.8" fill="none" marker-end="url(#arr2)"/>
  <path d="M376,298 C280,290 220,290 126,300" stroke="#4b5563" stroke-width="1.8" fill="none" marker-end="url(#arr2)"/>
  <rect x="490" y="316" width="154" height="20" rx="3" fill="white" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="567" y="329" text-anchor="middle" font-size="10" fill="#1e3a8a">Confirmed + Ref ID</text>

  <!-- Legend -->
  <rect x="20" y="870" width="440" height="66" rx="8" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="36" y="890" font-size="11" font-weight="700" fill="#1e293b">LEGEND</text>
  <circle cx="46" cy="910" r="10" fill="#14532d" stroke="#16a34a" stroke-width="1"/>
  <text x="62" y="914" font-size="10" fill="#374151">Sub-Process (Circle)</text>
  <line x1="174" y1="910" x2="214" y2="910" stroke="#4b5563" stroke-width="2"/>
  <text x="220" y="914" font-size="10" fill="#374151">Data Flow (solid)</text>
  <line x1="330" y1="910" x2="370" y2="910" stroke="#4b5563" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="376" y="914" font-size="10" fill="#374151">DB Lookup (dashed)</text>
  <rect x="36" y="924" width="20" height="12" fill="#d97706"/>
  <rect x="56" y="924" width="60" height="12" fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
  <text x="122" y="934" font-size="10" fill="#374151">Data Store</text>
  <rect x="228" y="920" width="110" height="22" rx="4" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="283" y="934" text-anchor="middle" font-size="10" fill="#0284c7">Explosion Boundary</text>
</svg>`;

// ═══════════════════════════════════════════════════════════════════════════════
// SVG 4 — ER Diagram (Professional Crow's Foot / Chen style like reference)
// ═══════════════════════════════════════════════════════════════════════════════
const svg3 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1100" viewBox="0 0 1800 1100" font-family="Arial,Helvetica,sans-serif">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eef2f7"/>
      <stop offset="100%" stop-color="#dde6f0"/>
    </linearGradient>
    <marker id="rel" markerWidth="10" markerHeight="8" refX="0" refY="4" orient="auto">
      <line x1="0" y1="4" x2="10" y2="0" stroke="#64748b" stroke-width="1.2"/>
      <line x1="0" y1="4" x2="10" y2="8" stroke="#64748b" stroke-width="1.2"/>
    </marker>
    <filter id="sh3"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#00000025"/></filter>
  </defs>
  <rect width="1800" height="1100" fill="url(#bg3)"/>

  <!-- Header -->
  <rect x="0" y="0" width="1800" height="56" fill="#1e3a5f"/>
  <text x="900" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="white">CUPGS FMS · ER Diagram · All Entities — Relationship Map</text>
  <text x="900" y="42" text-anchor="middle" font-size="11" fill="#93c5fd">All 6 database entities with primary keys and foreign key links · Crow's Foot / Chen Notation</text>
  <text x="1780" y="26" text-anchor="end" font-size="10" fill="#93c5fd">Page 4 of 4</text>
  <text x="1780" y="42" text-anchor="end" font-size="10" fill="#93c5fd">26/3/2025</text>

  <!-- ════════════════════════════════════════════
       ENTITY HELPER MACRO — repeated per entity
       Each entity: header (colored), PK row (orange bg), FK rows (green badge), attr rows
       ════════════════════════════════════════════ -->

  <!-- ── ENTITY: DEPARTMENTS (center-top) ── -->
  <!-- Header -->
  <rect x="680" y="90" width="260" height="32" rx="5" fill="#1a7a6e"/>
  <rect x="680" y="116" width="260" height="8" fill="#1a7a6e"/>
  <text x="810" y="111" text-anchor="middle" font-size="13" font-weight="800" fill="white">departments</text>
  <!-- Body -->
  <rect x="680" y="122" width="260" height="196" rx="0" fill="white" stroke="#1a7a6e" stroke-width="1.5"/>
  <rect x="680" y="90" width="260" height="32" rx="5" fill="#1a7a6e"/>
  <!-- PK row -->
  <rect x="680" y="122" width="260" height="24" fill="#fff7ed"/>
  <rect x="684" y="126" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="698" y="138" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="720" y="138" font-size="10" fill="#1e293b">id</text>
  <text x="930" y="138" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- Fields -->
  <line x1="682" y1="146" x2="938" y2="146" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="160" font-size="10" fill="#1e293b">code</text><text x="934" y="160" text-anchor="end" font-size="9" fill="#6b7280">varchar · UNIQUE</text>
  <line x1="682" y1="165" x2="938" y2="165" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="180" font-size="10" fill="#1e293b">name</text><text x="934" y="180" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="682" y1="184" x2="938" y2="184" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="199" font-size="10" fill="#1e293b">hod_name</text><text x="934" y="199" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="682" y1="203" x2="938" y2="203" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="218" font-size="10" fill="#1e293b">hod_employee_id</text><text x="934" y="218" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="682" y1="222" x2="938" y2="222" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="237" font-size="10" fill="#1e293b">created_at</text><text x="934" y="237" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="682" y1="241" x2="938" y2="241" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="256" font-size="10" fill="#1e293b">updated_at</text><text x="934" y="256" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="682" y1="260" x2="938" y2="260" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="694" y="275" font-size="10" fill="#1e293b">updated_by</text><text x="934" y="275" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <!-- Entity border full -->
  <rect x="680" y="90" width="260" height="228" rx="5" fill="none" stroke="#1a7a6e" stroke-width="2"/>

  <!-- ── ENTITY: FACULTY (left-top) ── -->
  <rect x="70" y="90" width="260" height="32" rx="5" fill="#1a7a6e"/>
  <rect x="70" y="116" width="260" height="8" fill="#1a7a6e"/>
  <text x="200" y="111" text-anchor="middle" font-size="13" font-weight="800" fill="white">faculty</text>
  <rect x="70" y="122" width="260" height="196" fill="white"/>
  <!-- PK -->
  <rect x="70" y="122" width="260" height="24" fill="#fff7ed"/>
  <rect x="74" y="126" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="88" y="138" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="110" y="138" font-size="10" fill="#1e293b">id</text>
  <text x="324" y="138" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- FK: department_id -->
  <line x1="72" y1="146" x2="328" y2="146" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="74" y="149" width="28" height="16" rx="3" fill="#0f766e"/>
  <text x="88" y="161" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="110" y="161" font-size="10" fill="#1e293b">department_id</text>
  <text x="324" y="161" text-anchor="end" font-size="9" fill="#6b7280">↑ departments</text>
  <!-- Other fields -->
  <line x1="72" y1="165" x2="328" y2="165" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="180" font-size="10" fill="#1e293b">employee_id</text><text x="324" y="180" text-anchor="end" font-size="9" fill="#6b7280">varchar · UNIQUE</text>
  <line x1="72" y1="184" x2="328" y2="184" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="199" font-size="10" fill="#1e293b">name</text><text x="324" y="199" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="72" y1="203" x2="328" y2="203" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="218" font-size="10" fill="#1e293b">designation</text><text x="324" y="218" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="72" y1="222" x2="328" y2="222" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="237" font-size="10" fill="#1e293b">email</text><text x="324" y="237" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="72" y1="241" x2="328" y2="241" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="256" font-size="10" fill="#1e293b">phone</text><text x="324" y="256" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="72" y1="260" x2="328" y2="260" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="275" font-size="10" fill="#1e293b">is_active</text><text x="324" y="275" text-anchor="end" font-size="9" fill="#6b7280">boolean</text>
  <rect x="70" y="90" width="260" height="228" rx="5" fill="none" stroke="#1a7a6e" stroke-width="2"/>

  <!-- ── ENTITY: COURSES (right-top) ── -->
  <rect x="1290" y="90" width="280" height="32" rx="5" fill="#1a7a6e"/>
  <rect x="1290" y="116" width="280" height="8" fill="#1a7a6e"/>
  <text x="1430" y="111" text-anchor="middle" font-size="13" font-weight="800" fill="white">courses</text>
  <rect x="1290" y="122" width="280" height="210" fill="white"/>
  <!-- PK -->
  <rect x="1290" y="122" width="280" height="24" fill="#fff7ed"/>
  <rect x="1294" y="126" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="1308" y="138" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="1330" y="138" font-size="10" fill="#1e293b">id</text>
  <text x="1564" y="138" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- FK: department_id -->
  <line x1="1292" y1="146" x2="1568" y2="146" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="1294" y="149" width="28" height="16" rx="3" fill="#0f766e"/>
  <text x="1308" y="161" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="1330" y="161" font-size="10" fill="#1e293b">department_id</text>
  <text x="1564" y="161" text-anchor="end" font-size="9" fill="#6b7280">↑ departments</text>
  <!-- FK: faculty_id optional -->
  <line x1="1292" y1="165" x2="1568" y2="165" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="1294" y="168" width="28" height="16" rx="3" fill="#0f766e" opacity="0.6"/>
  <text x="1308" y="180" text-anchor="middle" font-size="9" font-weight="700" fill="white">FK?</text>
  <text x="1330" y="180" font-size="10" fill="#64748b">faculty_id</text>
  <text x="1564" y="180" text-anchor="end" font-size="9" fill="#94a3b8">↑ faculty (nullable)</text>
  <!-- Fields -->
  <line x1="1292" y1="184" x2="1568" y2="184" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="199" font-size="10" fill="#1e293b">code</text><text x="1564" y="199" text-anchor="end" font-size="9" fill="#6b7280">varchar · UNIQUE</text>
  <line x1="1292" y1="203" x2="1568" y2="203" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="218" font-size="10" fill="#1e293b">name</text><text x="1564" y="218" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="1292" y1="222" x2="1568" y2="222" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="237" font-size="10" fill="#1e293b">semester</text><text x="1564" y="237" text-anchor="end" font-size="9" fill="#6b7280">int</text>
  <line x1="1292" y1="241" x2="1568" y2="241" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="256" font-size="10" fill="#1e293b">academic_year</text><text x="1564" y="256" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="1292" y1="260" x2="1568" y2="260" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="275" font-size="10" fill="#1e293b">credits</text><text x="1564" y="275" text-anchor="end" font-size="9" fill="#6b7280">int</text>
  <line x1="1292" y1="279" x2="1568" y2="279" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="294" font-size="10" fill="#1e293b">is_active</text><text x="1564" y="294" text-anchor="end" font-size="9" fill="#6b7280">boolean</text>
  <rect x="1290" y="90" width="280" height="244" rx="5" fill="none" stroke="#1a7a6e" stroke-width="2"/>

  <!-- ── ENTITY: FEEDBACK (center, large, brown) ── -->
  <rect x="650" y="510" width="340" height="32" rx="5" fill="#92400e"/>
  <rect x="650" y="536" width="340" height="8" fill="#92400e"/>
  <text x="820" y="531" text-anchor="middle" font-size="13" font-weight="800" fill="white">feedback</text>
  <rect x="650" y="542" width="340" height="426" fill="white"/>
  <!-- PK -->
  <rect x="650" y="542" width="340" height="24" fill="#fff7ed"/>
  <rect x="654" y="546" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="668" y="558" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="690" y="558" font-size="10" fill="#1e293b">id</text>
  <text x="984" y="558" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- reference_id -->
  <line x1="652" y1="566" x2="988" y2="566" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="581" font-size="10" fill="#1e293b">reference_id</text><text x="984" y="581" text-anchor="end" font-size="9" fill="#6b7280">varchar · UNIQUE</text>
  <!-- FK: course_id -->
  <line x1="652" y1="585" x2="988" y2="585" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="654" y="588" width="28" height="16" rx="3" fill="#0f766e"/>
  <text x="668" y="600" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="690" y="600" font-size="10" fill="#1e293b">course_id</text><text x="984" y="600" text-anchor="end" font-size="9" fill="#6b7280">↑ courses</text>
  <!-- FK: faculty_id optional -->
  <line x1="652" y1="604" x2="988" y2="604" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="654" y="607" width="28" height="16" rx="3" fill="#0f766e" opacity="0.6"/>
  <text x="668" y="619" text-anchor="middle" font-size="9" font-weight="700" fill="white">FK?</text>
  <text x="690" y="619" font-size="10" fill="#64748b">faculty_id</text><text x="984" y="619" text-anchor="end" font-size="9" fill="#94a3b8">↑ faculty (nullable)</text>
  <!-- FK: department_id -->
  <line x1="652" y1="623" x2="988" y2="623" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="654" y="626" width="28" height="16" rx="3" fill="#0f766e"/>
  <text x="668" y="638" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="690" y="638" font-size="10" fill="#1e293b">department_id</text><text x="984" y="638" text-anchor="end" font-size="9" fill="#6b7280">↑ departments</text>
  <!-- Rest of fields -->
  <line x1="652" y1="642" x2="988" y2="642" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="657" font-size="10" fill="#1e293b">semester</text><text x="984" y="657" text-anchor="end" font-size="9" fill="#6b7280">int</text>
  <line x1="652" y1="661" x2="988" y2="661" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="676" font-size="10" fill="#1e293b">academic_year</text><text x="984" y="676" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="652" y1="680" x2="988" y2="680" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="695" font-size="10" fill="#1e293b">student_year · section</text><text x="984" y="695" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="652" y1="699" x2="988" y2="699" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="714" font-size="10" fill="#1e293b">feedback_type</text><text x="984" y="714" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="652" y1="718" x2="988" y2="718" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="733" font-size="10" fill="#1e293b">rating_teaching_quality</text><text x="984" y="733" text-anchor="end" font-size="9" fill="#6b7280">real</text>
  <line x1="652" y1="737" x2="988" y2="737" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="752" font-size="10" fill="#1e293b">rating_course_content</text><text x="984" y="752" text-anchor="end" font-size="9" fill="#6b7280">real</text>
  <line x1="652" y1="756" x2="988" y2="756" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="771" font-size="10" fill="#1e293b">rating_lab_facilities</text><text x="984" y="771" text-anchor="end" font-size="9" fill="#6b7280">real</text>
  <line x1="652" y1="775" x2="988" y2="775" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="790" font-size="10" fill="#1e293b">rating_overall</text><text x="984" y="790" text-anchor="end" font-size="9" fill="#6b7280">real</text>
  <line x1="652" y1="794" x2="988" y2="794" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="809" font-size="10" fill="#1e293b">comments</text><text x="984" y="809" text-anchor="end" font-size="9" fill="#6b7280">text</text>
  <line x1="652" y1="813" x2="988" y2="813" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="828" font-size="10" fill="#1e293b">is_anonymous</text><text x="984" y="828" text-anchor="end" font-size="9" fill="#6b7280">boolean</text>
  <line x1="652" y1="832" x2="988" y2="832" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="847" font-size="10" fill="#1e293b">custom_answers</text><text x="984" y="847" text-anchor="end" font-size="9" fill="#6b7280">jsonb</text>
  <line x1="652" y1="851" x2="988" y2="851" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="664" y="866" font-size="10" fill="#1e293b">submitted_at</text><text x="984" y="866" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <rect x="650" y="510" width="340" height="458" rx="5" fill="none" stroke="#92400e" stroke-width="2.5"/>

  <!-- ── ENTITY: FORM_TEMPLATES (right-bottom) ── -->
  <rect x="1290" y="510" width="280" height="32" rx="5" fill="#6b21a8"/>
  <rect x="1290" y="536" width="280" height="8" fill="#6b21a8"/>
  <text x="1430" y="531" text-anchor="middle" font-size="13" font-weight="800" fill="white">form_templates</text>
  <rect x="1290" y="542" width="280" height="130" fill="white"/>
  <!-- PK -->
  <rect x="1290" y="542" width="280" height="24" fill="#fff7ed"/>
  <rect x="1294" y="546" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="1308" y="558" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="1330" y="558" font-size="10" fill="#1e293b">id</text>
  <text x="1564" y="558" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- FK: department_id -->
  <line x1="1292" y1="566" x2="1568" y2="566" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="1294" y="569" width="28" height="16" rx="3" fill="#0f766e"/>
  <text x="1308" y="581" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="1330" y="581" font-size="10" fill="#1e293b">department_id</text>
  <text x="1564" y="581" text-anchor="end" font-size="9" fill="#6b7280">↑ departments · UNIQUE</text>
  <!-- fields -->
  <line x1="1292" y1="585" x2="1568" y2="585" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="600" font-size="10" fill="#1e293b">fields</text><text x="1564" y="600" text-anchor="end" font-size="9" fill="#6b7280">jsonb</text>
  <line x1="1292" y1="604" x2="1568" y2="604" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="619" font-size="10" fill="#1e293b">created_at</text><text x="1564" y="619" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="1292" y1="623" x2="1568" y2="623" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="638" font-size="10" fill="#1e293b">updated_at</text><text x="1564" y="638" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="1292" y1="642" x2="1568" y2="642" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="1304" y="657" font-size="10" fill="#1e293b">updated_by</text><text x="1564" y="657" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <rect x="1290" y="510" width="280" height="162" rx="5" fill="none" stroke="#6b21a8" stroke-width="2"/>

  <!-- ── ENTITY: FEEDBACK_WINDOWS (left-bottom) ── -->
  <rect x="70" y="510" width="280" height="32" rx="5" fill="#6b21a8"/>
  <rect x="70" y="536" width="280" height="8" fill="#6b21a8"/>
  <text x="210" y="531" text-anchor="middle" font-size="13" font-weight="800" fill="white">feedback_windows</text>
  <rect x="70" y="542" width="280" height="156" fill="white"/>
  <!-- PK -->
  <rect x="70" y="542" width="280" height="24" fill="#fff7ed"/>
  <rect x="74" y="546" width="28" height="16" rx="3" fill="#ea580c"/>
  <text x="88" y="558" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="110" y="558" font-size="10" fill="#1e293b">id</text>
  <text x="344" y="558" text-anchor="end" font-size="9" fill="#6b7280">serial</text>
  <!-- FK: department_id optional -->
  <line x1="72" y1="566" x2="348" y2="566" stroke="#e5e7eb" stroke-width="0.8"/>
  <rect x="74" y="569" width="28" height="16" rx="3" fill="#0f766e" opacity="0.6"/>
  <text x="88" y="581" text-anchor="middle" font-size="9" font-weight="700" fill="white">FK?</text>
  <text x="110" y="581" font-size="10" fill="#64748b">department_id</text>
  <text x="344" y="581" text-anchor="end" font-size="9" fill="#94a3b8">↑ departments (nullable)</text>
  <!-- fields -->
  <line x1="72" y1="585" x2="348" y2="585" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="600" font-size="10" fill="#1e293b">title</text><text x="344" y="600" text-anchor="end" font-size="9" fill="#6b7280">varchar</text>
  <line x1="72" y1="604" x2="348" y2="604" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="619" font-size="10" fill="#1e293b">is_active</text><text x="344" y="619" text-anchor="end" font-size="9" fill="#6b7280">boolean</text>
  <line x1="72" y1="623" x2="348" y2="623" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="638" font-size="10" fill="#1e293b">start_date</text><text x="344" y="638" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="72" y1="642" x2="348" y2="642" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="657" font-size="10" fill="#1e293b">end_date</text><text x="344" y="657" text-anchor="end" font-size="9" fill="#6b7280">timestamptz</text>
  <line x1="72" y1="661" x2="348" y2="661" stroke="#e5e7eb" stroke-width="0.8"/>
  <text x="84" y="676" font-size="10" fill="#1e293b">description</text><text x="344" y="676" text-anchor="end" font-size="9" fill="#6b7280">text</text>
  <rect x="70" y="510" width="280" height="198" rx="5" fill="none" stroke="#6b21a8" stroke-width="2"/>

  <!-- ════════════════════════════════════════════
       RELATIONSHIP LINES (dashed) with 1:N badges
       ════════════════════════════════════════════ -->

  <!-- DEPARTMENTS 1 → N FACULTY -->
  <line x1="330" y1="200" x2="680" y2="200" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <!-- Cardinality badges -->
  <rect x="332" y="188" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="347" y="202" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="650" y="188" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="665" y="202" text-anchor="middle" font-size="10" font-weight="800" fill="white">N</text>

  <!-- DEPARTMENTS 1 → N COURSES -->
  <line x1="940" y1="200" x2="1290" y2="200" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <rect x="942" y="188" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="957" y="202" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="1260" y="188" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="1275" y="202" text-anchor="middle" font-size="10" font-weight="800" fill="white">N</text>

  <!-- DEPARTMENTS 1 → N FEEDBACK (via vertical line from dept bottom → feedback top) -->
  <line x1="810" y1="318" x2="810" y2="510" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <rect x="796" y="320" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="811" y="334" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="796" y="490" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="811" y="504" text-anchor="middle" font-size="10" font-weight="800" fill="white">N</text>

  <!-- DEPARTMENTS 1 → 1 FORM_TEMPLATES -->
  <line x1="940" y1="600" x2="1290" y2="600" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <rect x="942" y="588" width="30" height="20" rx="4" fill="#9333ea"/>
  <text x="957" y="602" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="1260" y="588" width="30" height="20" rx="4" fill="#9333ea"/>
  <text x="1275" y="602" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <line x1="940" y1="310" x2="1290" y2="540" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5,4"/>
  <!-- Connector: Dept right edge → through → form_templates -->

  <!-- COURSES 1 → N FEEDBACK -->
  <line x1="1430" y1="334" x2="1430" y2="460" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <line x1="1430" y1="460" x2="990" y2="580" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <rect x="1418" y="335" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="1433" y="349" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="970" y="572" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="985" y="586" text-anchor="middle" font-size="10" font-weight="800" fill="white">N</text>

  <!-- FACULTY 0..1 → N FEEDBACK (optional) -->
  <line x1="200" y1="318" x2="200" y2="460" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <line x1="200" y1="460" x2="650" y2="612" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="186" y="320" width="32" height="20" rx="4" fill="#0f766e"/>
  <text x="202" y="334" text-anchor="middle" font-size="9" font-weight="800" fill="white">0..1</text>
  <rect x="624" y="604" width="28" height="20" rx="4" fill="#ea580c"/>
  <text x="638" y="618" text-anchor="middle" font-size="10" font-weight="800" fill="white">N</text>

  <!-- DEPARTMENTS 1 → 0..N FEEDBACK_WINDOWS -->
  <line x1="680" y1="580" x2="350" y2="580" stroke="#64748b" stroke-width="1.8" stroke-dasharray="8,4"/>
  <rect x="652" y="568" width="30" height="20" rx="4" fill="#ea580c"/>
  <text x="667" y="582" text-anchor="middle" font-size="10" font-weight="800" fill="white">1</text>
  <rect x="320" y="568" width="36" height="20" rx="4" fill="#ea580c"/>
  <text x="338" y="582" text-anchor="middle" font-size="10" font-weight="800" fill="white">0..N</text>

  <!-- ════════════════════════════════════════════
       LEGEND (bottom-right, matching reference)
       ════════════════════════════════════════════ -->
  <rect x="1480" y="870" width="300" height="178" rx="8" fill="#1e3a5f" filter="url(#sh3)"/>
  <text x="1630" y="892" text-anchor="middle" font-size="12" font-weight="800" fill="white">LEGEND</text>
  <!-- PK badge -->
  <rect x="1500" y="904" width="28" height="18" rx="3" fill="#ea580c"/>
  <text x="1514" y="917" text-anchor="middle" font-size="9" font-weight="800" fill="white">PK</text>
  <text x="1536" y="917" font-size="10" fill="#e2e8f0">Primary Key</text>
  <!-- FK badge -->
  <rect x="1500" y="928" width="28" height="18" rx="3" fill="#0f766e"/>
  <text x="1514" y="941" text-anchor="middle" font-size="9" font-weight="800" fill="white">FK</text>
  <text x="1536" y="941" font-size="10" fill="#e2e8f0">Foreign Key</text>
  <!-- FK? badge -->
  <rect x="1500" y="952" width="28" height="18" rx="3" fill="#0f766e" opacity="0.6"/>
  <text x="1514" y="965" text-anchor="middle" font-size="9" font-weight="700" fill="white">FK?</text>
  <text x="1536" y="965" font-size="10" fill="#e2e8f0">Optional FK (nullable)</text>
  <!-- Relationship line -->
  <line x1="1500" y1="985" x2="1548" y2="985" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="8,4"/>
  <text x="1556" y="989" font-size="10" fill="#e2e8f0">Relationship (dashed)</text>
  <!-- Cardinality badge -->
  <rect x="1500" y="1000" width="28" height="18" rx="4" fill="#ea580c"/>
  <text x="1514" y="1013" text-anchor="middle" font-size="10" font-weight="800" fill="white">1:N</text>
  <text x="1536" y="1013" font-size="10" fill="#e2e8f0">Cardinality Badge</text>
  <!-- Columns label -->
  <text x="1500" y="1036" font-size="9" fill="#93c5fd">Columns: KEY | Field Name | Data Type</text>
</svg>`;

// ═══════════════════════════════════════════════════════════════════════════════
// Generate PNGs and merge into PDF
// ═══════════════════════════════════════════════════════════════════════════════
const diagrams = [
  { name: "dfd0-context",  svg: svg0, w: 1400, h: 900  },
  { name: "dfd1-level1",   svg: svg1, w: 1800, h: 1100 },
  { name: "dfd2-level2",   svg: svg2, w: 1400, h: 950  },
  { name: "er-diagram",    svg: svg3, w: 1800, h: 1100 },
];

console.log("🔧 Generating diagram PNGs...");
const pngs = [];
for (const { name, svg } of diagrams) {
  const svgPath = join(OUT, `${name}.svg`);
  const pngPath = join(OUT, `${name}.png`);
  writeFileSync(svgPath, svg, "utf8");

  execSync(
    `convert -density 180 -background white -alpha remove -alpha off "${svgPath}" "${pngPath}"`,
    { stdio: "pipe" }
  );
  pngs.push(pngPath);
  console.log(`  ✓ ${name}.png`);
}

// Merge all into single PDF
const outPdf = join(OUT, "CUPGS-SE-Diagrams.pdf");
const pngList = pngs.map(p => `"${p}"`).join(" ");
execSync(`convert ${pngList} "${outPdf}"`, { stdio: "pipe" });

console.log(`\n✅ PDF ready: exports/CUPGS-SE-Diagrams.pdf  (${pngs.length} pages)`);
