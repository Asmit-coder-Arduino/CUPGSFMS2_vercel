import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../exports");
mkdirSync(OUT, { recursive: true });

// ─── SVG 1 ─ DFD Level 0 Context Diagram ───────────────────────────────────
const svg0 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="620" viewBox="0 0 1100 620" font-family="Arial,sans-serif">
  <rect width="1100" height="620" fill="white"/>
  <!-- Title -->
  <rect x="0" y="0" width="1100" height="42" fill="#1e3a8a"/>
  <text x="550" y="26" text-anchor="middle" font-size="15" font-weight="800" fill="white">DFD Level 0 — Context Diagram · CUPGS Academic Feedback Management System (Yourdon-Coad)</text>

  <!-- Entities -->
  <rect x="415" y="70" width="270" height="58" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="550" y="94" text-anchor="middle" font-size="13" font-weight="700" fill="white">STUDENT</text>
  <text x="550" y="112" text-anchor="middle" font-size="10" fill="#93c5fd">External Entity</text>

  <rect x="900" y="210" width="165" height="58" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="982" y="234" text-anchor="middle" font-size="13" font-weight="700" fill="white">HOD</text>
  <text x="982" y="252" text-anchor="middle" font-size="10" fill="#93c5fd">External Entity</text>

  <rect x="415" y="490" width="270" height="58" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="550" y="514" text-anchor="middle" font-size="13" font-weight="700" fill="white">ADMIN</text>
  <text x="550" y="532" text-anchor="middle" font-size="10" fill="#93c5fd">External Entity</text>

  <rect x="30" y="210" width="165" height="58" rx="5" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="112" y="234" text-anchor="middle" font-size="13" font-weight="700" fill="white">FACULTY</text>
  <text x="112" y="252" text-anchor="middle" font-size="10" fill="#93c5fd">External Entity</text>

  <!-- Central Process -->
  <circle cx="550" cy="290" r="118" fill="#14532d" stroke="#16a34a" stroke-width="2.5"/>
  <text x="550" y="272" text-anchor="middle" font-size="15" font-weight="900" fill="#86efac">0.</text>
  <text x="550" y="292" text-anchor="middle" font-size="13" font-weight="700" fill="white">CUPGS Feedback</text>
  <text x="550" y="310" text-anchor="middle" font-size="13" fill="#a7f3d0">Management System</text>

  <!-- Arrows & Labels -->
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
      <polygon points="0 0,10 4,0 8" fill="#475569"/>
    </marker>
  </defs>

  <!-- Student -> System -->
  <line x1="528" y1="128" x2="528" y2="172" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="352" y="133" width="172" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="438" y="143" text-anchor="middle" font-size="10" fill="#1e293b">Feedback Submission</text>

  <!-- System -> Student -->
  <line x1="572" y1="172" x2="572" y2="128" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="580" y="133" width="170" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="665" y="143" text-anchor="middle" font-size="10" fill="#1e293b">Submission Confirmation</text>

  <!-- HOD -> System -->
  <line x1="900" y1="234" x2="668" y2="262" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="762" y="232" width="152" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="838" y="242" text-anchor="middle" font-size="10" fill="#1e293b">Form Template Config</text>

  <!-- System -> HOD -->
  <line x1="668" y1="278" x2="900" y2="278" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="758" y="268" width="154" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="835" y="278" text-anchor="middle" font-size="10" fill="#1e293b">Analytics Report / PDF</text>

  <!-- Admin -> System -->
  <line x1="528" y1="490" x2="528" y2="408" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="352" y="432" width="160" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="432" y="442" text-anchor="middle" font-size="10" fill="#1e293b">Dept / Course Config</text>

  <!-- System -> Admin -->
  <line x1="572" y1="408" x2="572" y2="490" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="580" y="432" width="168" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="664" y="442" text-anchor="middle" font-size="10" fill="#1e293b">Institution Dashboard</text>

  <!-- Faculty -> System -->
  <line x1="195" y1="244" x2="432" y2="274" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="222" y="237" width="156" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="300" y="247" text-anchor="middle" font-size="10" fill="#1e293b">View Request / Login</text>

  <!-- System -> Faculty -->
  <line x1="432" y1="290" x2="195" y2="290" stroke="#475569" stroke-width="1.8" marker-end="url(#arr)"/>
  <rect x="222" y="281" width="162" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.8"/>
  <text x="303" y="291" text-anchor="middle" font-size="10" fill="#1e293b">Performance Analytics</text>

  <!-- Legend -->
  <rect x="16" y="570" width="340" height="40" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="28" y="584" font-size="9" font-weight="700" fill="#1e293b">LEGEND (Yourdon-Coad Notation)</text>
  <rect x="28" y="590" width="20" height="13" rx="2" fill="#1e3a8a"/>
  <text x="54" y="601" font-size="9" fill="#1e293b">External Entity (Rectangle)</text>
  <circle cx="180" cy="596" r="9" fill="#14532d" stroke="#16a34a" stroke-width="1"/>
  <text x="194" y="600" font-size="9" fill="#1e293b">Process (Circle)</text>
</svg>`;

// ─── SVG 2 ─ DFD Level 1 Functional Decomposition ──────────────────────────
const svg1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="960" viewBox="0 0 1560 960" font-family="Arial,sans-serif">
  <rect width="1560" height="960" fill="white"/>
  <rect x="0" y="0" width="1560" height="42" fill="#1e3a8a"/>
  <text x="780" y="26" text-anchor="middle" font-size="15" font-weight="800" fill="white">DFD Level 1 — Functional Decomposition · CUPGS Feedback System (Yourdon-Coad + Gane-Sarson Data Stores)</text>
  <defs>
    <marker id="a1" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
      <polygon points="0 0,10 4,0 8" fill="#475569"/>
    </marker>
  </defs>

  <!-- External Entities -->
  <rect x="20" y="165" width="135" height="56" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="87" y="188" text-anchor="middle" font-size="12" font-weight="700" fill="white">STUDENT</text>
  <text x="87" y="204" text-anchor="middle" font-size="9" fill="#93c5fd">External Entity</text>

  <rect x="20" y="500" width="135" height="56" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="87" y="523" text-anchor="middle" font-size="12" font-weight="700" fill="white">FACULTY</text>
  <text x="87" y="539" text-anchor="middle" font-size="9" fill="#93c5fd">External Entity</text>

  <rect x="1400" y="148" width="145" height="56" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="1472" y="171" text-anchor="middle" font-size="12" font-weight="700" fill="white">HOD</text>
  <text x="1472" y="187" text-anchor="middle" font-size="9" fill="#93c5fd">External Entity</text>

  <rect x="1400" y="496" width="145" height="56" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="1472" y="519" text-anchor="middle" font-size="12" font-weight="700" fill="white">ADMIN</text>
  <text x="1472" y="535" text-anchor="middle" font-size="9" fill="#93c5fd">External Entity</text>

  <!-- Processes -->
  <circle cx="380" cy="205" r="70" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="380" y="193" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">1.0</text>
  <text x="380" y="209" text-anchor="middle" font-size="12" font-weight="700" fill="white">Authentication</text>

  <circle cx="380" cy="510" r="70" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="380" y="497" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.0</text>
  <text x="380" y="513" text-anchor="middle" font-size="12" font-weight="700" fill="white">Feedback</text>
  <text x="380" y="529" text-anchor="middle" font-size="11" fill="#a7f3d0">Collection</text>

  <circle cx="720" cy="205" r="70" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="720" y="193" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">3.0</text>
  <text x="720" y="209" text-anchor="middle" font-size="12" font-weight="700" fill="white">Form Template</text>
  <text x="720" y="225" text-anchor="middle" font-size="11" fill="#a7f3d0">Management</text>

  <circle cx="720" cy="510" r="70" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="720" y="497" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">4.0</text>
  <text x="720" y="513" text-anchor="middle" font-size="12" font-weight="700" fill="white">Analytics &amp;</text>
  <text x="720" y="529" text-anchor="middle" font-size="11" fill="#a7f3d0">Reporting</text>

  <circle cx="1080" cy="358" r="70" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="1080" y="345" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">5.0</text>
  <text x="1080" y="362" text-anchor="middle" font-size="12" font-weight="700" fill="white">Institution</text>
  <text x="1080" y="378" text-anchor="middle" font-size="11" fill="#a7f3d0">Management</text>

  <!-- Data Stores (Gane-Sarson style) -->
  <rect x="60" y="740" width="210" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="60" y="740" width="34" height="32" fill="#92400e"/>
  <text x="77" y="757" text-anchor="middle" font-size="10" font-weight="800" fill="white">D1</text>
  <text x="60+34+88" y="757" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Feedback</text>

  <rect x="310" y="740" width="210" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="310" y="740" width="34" height="32" fill="#92400e"/>
  <text x="327" y="757" text-anchor="middle" font-size="10" font-weight="800" fill="white">D2</text>
  <text x="310+34+88" y="757" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Courses</text>

  <rect x="560" y="740" width="210" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="560" y="740" width="34" height="32" fill="#92400e"/>
  <text x="577" y="757" text-anchor="middle" font-size="10" font-weight="800" fill="white">D3</text>
  <text x="560+34+88" y="757" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Faculty</text>

  <rect x="810" y="740" width="220" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="810" y="740" width="34" height="32" fill="#92400e"/>
  <text x="827" y="757" text-anchor="middle" font-size="10" font-weight="800" fill="white">D4</text>
  <text x="810+34+93" y="757" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Departments</text>

  <rect x="580" y="80" width="235" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="580" y="80" width="34" height="32" fill="#92400e"/>
  <text x="597" y="97" text-anchor="middle" font-size="10" font-weight="800" fill="white">D5</text>
  <text x="580+34+100" y="97" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Form Templates</text>

  <rect x="60" y="370" width="230" height="32" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="60" y="370" width="34" height="32" fill="#92400e"/>
  <text x="77" y="387" text-anchor="middle" font-size="10" font-weight="800" fill="white">D6</text>
  <text x="60+34+98" y="387" text-anchor="middle" font-size="11" font-weight="600" fill="#fcd34d">Feedback Windows</text>

  <!-- Flow Labels helper: using small rounded rect + text -->
  <!-- Student <-> Auth -->
  <line x1="155" y1="180" x2="310" y2="205" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="168" y="178" width="130" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="233" y="188" text-anchor="middle" font-size="9" fill="#1e293b">Login Credentials</text>

  <line x1="312" y1="222" x2="155" y2="210" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="168" y="208" width="120" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="228" y="218" text-anchor="middle" font-size="9" fill="#1e293b">Auth Token</text>

  <!-- Student <-> Feedback -->
  <line x1="155" y1="525" x2="310" y2="518" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="168" y="510" width="140" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="238" y="520" text-anchor="middle" font-size="9" fill="#1e293b">Feedback Submission</text>

  <line x1="312" y1="535" x2="155" y2="545" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="168" y="538" width="130" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="233" y="548" text-anchor="middle" font-size="9" fill="#1e293b">Ref ID / Confirm</text>

  <!-- HOD <-> Form Template -->
  <line x1="1400" y1="170" x2="790" y2="195" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="1060" y="168" width="156" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1138" y="178" text-anchor="middle" font-size="9" fill="#1e293b">Form Config Request</text>

  <line x1="790" y1="214" x2="1400" y2="193" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="1060" y="198" width="140" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1130" y="208" text-anchor="middle" font-size="9" fill="#1e293b">Template Saved</text>

  <!-- HOD <- Analytics -->
  <line x1="790" y1="496" x2="1400" y2="506" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="1060" y="482" width="160" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1140" y="492" text-anchor="middle" font-size="9" fill="#1e293b">Dept Analytics / PDF</text>

  <!-- Admin <-> Institution -->
  <line x1="1400" y1="520" x2="1150" y2="398" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="1260" y="440" width="132" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1326" y="450" text-anchor="middle" font-size="9" fill="#1e293b">Mgmt Request</text>

  <line x1="1148" y1="406" x2="1400" y2="533" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="1258" y="462" width="148" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1332" y="472" text-anchor="middle" font-size="9" fill="#1e293b">System Dashboard</text>

  <!-- Process Links -->
  <line x1="380" y1="275" x2="380" y2="440" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="390" y="348" width="108" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="444" y="358" text-anchor="middle" font-size="9" fill="#1e293b">Auth Validated</text>

  <line x1="450" y1="205" x2="650" y2="205" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="510" y="194" width="100" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="560" y="204" text-anchor="middle" font-size="9" fill="#1e293b">Auth Check</text>

  <line x1="450" y1="510" x2="650" y2="510" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="508" y="498" width="112" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="564" y="508" text-anchor="middle" font-size="9" fill="#1e293b">Form Applied</text>

  <line x1="720" y1="275" x2="720" y2="440" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="728" y="348" width="106" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="781" y="358" text-anchor="middle" font-size="9" fill="#1e293b">Form Config</text>

  <line x1="790" y1="510" x2="1010" y2="400" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="872" y="448" width="126" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="935" y="458" text-anchor="middle" font-size="9" fill="#1e293b">Aggregated Data</text>

  <!-- Data Store flows -->
  <line x1="350" y1="578" x2="218" y2="740" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="248" y="648" width="118" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="307" y="658" text-anchor="middle" font-size="9" fill="#1e293b">Store Feedback</text>

  <line x1="216" y1="740" x2="348" y2="580" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="146" y="660" width="128" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="210" y="670" text-anchor="middle" font-size="9" fill="#1e293b">Feedback Records</text>

  <line x1="720" y1="96" x2="720" y2="135" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="728" y="106" width="116" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="786" y="116" text-anchor="middle" font-size="9" fill="#1e293b">Save Template</text>

  <line x1="736" y1="135" x2="736" y2="96" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="744" y="108" width="116" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="802" y="118" text-anchor="middle" font-size="9" fill="#1e293b">Load Template</text>

  <line x1="362" y1="466" x2="290" y2="402" stroke="#475569" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="292" y="424" width="112" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="348" y="434" text-anchor="middle" font-size="9" fill="#1e293b">Check Window</text>

  <!-- Legend -->
  <rect x="20" y="910" width="460" height="40" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="924" font-size="9" font-weight="700" fill="#1e293b">LEGEND</text>
  <rect x="34" y="932" width="20" height="12" rx="2" fill="#1e3a8a"/>
  <text x="60" y="942" font-size="9" fill="#1e293b">External Entity</text>
  <circle cx="150" cy="938" r="8" fill="#14532d" stroke="#16a34a" stroke-width="1"/>
  <text x="164" y="942" font-size="9" fill="#1e293b">Process (Circle)</text>
  <rect x="256" y="932" width="22" height="12" fill="#92400e"/>
  <rect x="278" y="932" width="62" height="12" fill="#451a03"/>
  <text x="346" y="942" font-size="9" fill="#1e293b">Data Store (Gane-Sarson)</text>
</svg>`;

// ─── SVG 3 ─ DFD Level 2 — Process 2.0 Explosion ───────────────────────────
const svg2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="820" viewBox="0 0 1260 820" font-family="Arial,sans-serif">
  <rect width="1260" height="820" fill="white"/>
  <rect x="0" y="0" width="1260" height="42" fill="#1e3a8a"/>
  <text x="630" y="26" text-anchor="middle" font-size="15" font-weight="800" fill="white">DFD Level 2 — Process 2.0 Explosion: Feedback Collection · CUPGS System (Yourdon-Coad)</text>
  <defs>
    <marker id="a2" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
      <polygon points="0 0,10 4,0 8" fill="#475569"/>
    </marker>
  </defs>

  <!-- Explosion boundary -->
  <rect x="70" y="80" width="1100" height="540" rx="12" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="10,5"/>
  <text x="88" y="100" font-size="11" fill="#16a34a" font-weight="700">Process 2.0 — Feedback Collection (Expanded)</text>

  <!-- External Entities -->
  <rect x="6" y="248" width="110" height="52" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="61" y="275" text-anchor="middle" font-size="12" font-weight="700" fill="white">STUDENT</text>

  <rect x="6" y="420" width="110" height="52" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="61" y="441" text-anchor="middle" font-size="11" font-weight="700" fill="white">HOD FORM</text>
  <text x="61" y="457" text-anchor="middle" font-size="9" fill="#93c5fd">Template</text>

  <!-- Processes -->
  <circle cx="290" cy="198" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="290" y="186" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.1</text>
  <text x="290" y="202" text-anchor="middle" font-size="12" font-weight="700" fill="white">Validate</text>
  <text x="290" y="218" text-anchor="middle" font-size="11" fill="#a7f3d0">Inputs</text>

  <circle cx="290" cy="432" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="290" y="420" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.2</text>
  <text x="290" y="436" text-anchor="middle" font-size="12" font-weight="700" fill="white">Check</text>
  <text x="290" y="452" text-anchor="middle" font-size="11" fill="#a7f3d0">Feedback Win.</text>

  <circle cx="550" cy="315" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="550" y="303" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.3</text>
  <text x="550" y="319" text-anchor="middle" font-size="12" font-weight="700" fill="white">Profanity</text>
  <text x="550" y="335" text-anchor="middle" font-size="11" fill="#a7f3d0">Filter</text>

  <circle cx="810" cy="198" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="810" y="186" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.4</text>
  <text x="810" y="202" text-anchor="middle" font-size="12" font-weight="700" fill="white">Course-Faculty</text>
  <text x="810" y="218" text-anchor="middle" font-size="11" fill="#a7f3d0">Integrity</text>

  <circle cx="810" cy="432" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="810" y="420" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.5</text>
  <text x="810" y="436" text-anchor="middle" font-size="12" font-weight="700" fill="white">Generate</text>
  <text x="810" y="452" text-anchor="middle" font-size="11" fill="#a7f3d0">Reference ID</text>

  <circle cx="1080" cy="315" r="66" fill="#14532d" stroke="#16a34a" stroke-width="2"/>
  <text x="1080" y="303" text-anchor="middle" font-size="10" font-weight="800" fill="#86efac">2.6</text>
  <text x="1080" y="319" text-anchor="middle" font-size="12" font-weight="700" fill="white">Store</text>
  <text x="1080" y="335" text-anchor="middle" font-size="11" fill="#a7f3d0">Feedback</text>

  <!-- Data Stores -->
  <rect x="170" y="670" width="190" height="30" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="170" y="670" width="30" height="30" fill="#92400e"/>
  <text x="185" y="686" text-anchor="middle" font-size="9" font-weight="800" fill="white">D2</text>
  <text x="170+30+80" y="686" text-anchor="middle" font-size="10" font-weight="600" fill="#fcd34d">Courses</text>

  <rect x="400" y="670" width="195" height="30" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="400" y="670" width="30" height="30" fill="#92400e"/>
  <text x="415" y="686" text-anchor="middle" font-size="9" font-weight="800" fill="white">D3</text>
  <text x="400+30+82" y="686" text-anchor="middle" font-size="10" font-weight="600" fill="#fcd34d">Faculty</text>

  <rect x="640" y="670" width="215" height="30" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="640" y="670" width="30" height="30" fill="#92400e"/>
  <text x="655" y="686" text-anchor="middle" font-size="9" font-weight="800" fill="white">D6</text>
  <text x="640+30+92" y="686" text-anchor="middle" font-size="10" font-weight="600" fill="#fcd34d">Feedback Windows</text>

  <rect x="900" y="670" width="190" height="30" fill="#451a03" stroke="#92400e" stroke-width="1.5"/>
  <rect x="900" y="670" width="30" height="30" fill="#92400e"/>
  <text x="915" y="686" text-anchor="middle" font-size="9" font-weight="800" fill="white">D1</text>
  <text x="900+30+80" y="686" text-anchor="middle" font-size="10" font-weight="600" fill="#fcd34d">Feedback</text>

  <!-- Data Flows -->
  <line x1="116" y1="265" x2="226" y2="213" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="136" y="222" width="140" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="206" y="232" text-anchor="middle" font-size="9" fill="#1e293b">Raw Feedback Data</text>

  <line x1="116" y1="443" x2="226" y2="430" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="130" y="428" width="120" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="190" y="438" text-anchor="middle" font-size="9" fill="#1e293b">Form Template</text>

  <line x1="356" y1="210" x2="486" y2="286" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="392" y="238" width="120" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="452" y="248" text-anchor="middle" font-size="9" fill="#1e293b">Validated Fields</text>

  <line x1="290" y1="366" x2="290" y2="264" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="298" y="308" width="106" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="351" y="318" text-anchor="middle" font-size="9" fill="#1e293b">Window Open</text>

  <line x1="614" y1="286" x2="746" y2="212" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="654" y="236" width="122" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="715" y="246" text-anchor="middle" font-size="9" fill="#1e293b">Filtered Content</text>

  <line x1="614" y1="342" x2="746" y2="415" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="654" y="370" width="110" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="709" y="380" text-anchor="middle" font-size="9" fill="#1e293b">Text Fields OK</text>

  <line x1="876" y1="212" x2="1016" y2="281" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="916" y="232" width="126" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="979" y="242" text-anchor="middle" font-size="9" fill="#1e293b">Integrity Passed</text>

  <line x1="876" y1="418" x2="1016" y2="348" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="916" y="374" width="120" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="976" y="384" text-anchor="middle" font-size="9" fill="#1e293b">Reference ID</text>

  <line x1="1080" y1="381" x2="1010" y2="670" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>
  <rect x="1052" y="522" width="126" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="1115" y="532" text-anchor="middle" font-size="9" fill="#1e293b">Feedback Record</text>

  <!-- Course/Faculty store flows -->
  <line x1="270" y1="670" x2="756" y2="264" stroke="#475569" stroke-width="1.3" marker-end="url(#a2)" stroke-dasharray="5,3"/>
  <rect x="430" y="440" width="120" height="16" rx="3" fill="#fffbeb" stroke="#fbbf24" stroke-width="0.6"/>
  <text x="490" y="450" text-anchor="middle" font-size="9" fill="#92400e">Course Record</text>

  <line x1="530" y1="670" x2="766" y2="264" stroke="#475569" stroke-width="1.3" marker-end="url(#a2)" stroke-dasharray="5,3"/>
  <rect x="600" y="484" width="120" height="16" rx="3" fill="#fffbeb" stroke="#fbbf24" stroke-width="0.6"/>
  <text x="660" y="494" text-anchor="middle" font-size="9" fill="#92400e">Faculty Record</text>

  <!-- Window check flows -->
  <line x1="750" y1="670" x2="322" y2="495" stroke="#475569" stroke-width="1.3" marker-end="url(#a2)" stroke-dasharray="5,3"/>
  <rect x="490" y="590" width="126" height="16" rx="3" fill="#fffbeb" stroke="#fbbf24" stroke-width="0.6"/>
  <text x="553" y="600" text-anchor="middle" font-size="9" fill="#92400e">Window Status</text>

  <line x1="300" y1="495" x2="752" y2="670" stroke="#475569" stroke-width="1.3" marker-end="url(#a2)" stroke-dasharray="5,3"/>
  <rect x="490" y="620" width="126" height="16" rx="3" fill="#fffbeb" stroke="#fbbf24" stroke-width="0.6"/>
  <text x="553" y="630" text-anchor="middle" font-size="9" fill="#92400e">Window Query</text>

  <!-- Confirm back to student -->
  <path d="M1016,300 C820,224 500,212 290,212" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#a2)"/>
  <rect x="576" y="196" width="150" height="16" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="0.6"/>
  <text x="651" y="206" text-anchor="middle" font-size="9" fill="#1e293b">Confirmed + Ref ID</text>
  <line x1="290" y1="220" x2="116" y2="273" stroke="#475569" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Legend -->
  <rect x="20" y="768" width="420" height="40" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="34" y="782" font-size="9" font-weight="700" fill="#1e293b">LEGEND</text>
  <circle cx="44" cy="796" r="8" fill="#14532d" stroke="#16a34a" stroke-width="1"/>
  <text x="58" y="800" font-size="9" fill="#1e293b">Sub-Process</text>
  <line x1="130" y1="796" x2="170" y2="796" stroke="#475569" stroke-width="1.5"/>
  <text x="182" y="800" font-size="9" fill="#1e293b">Data Flow</text>
  <line x1="262" y1="796" x2="302" y2="796" stroke="#475569" stroke-width="1.3" stroke-dasharray="5,3"/>
  <text x="314" y="800" font-size="9" fill="#1e293b">DB Lookup</text>
</svg>`;

// ─── SVG 4 ─ ER Diagram ─────────────────────────────────────────────────────
const svg3 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="1000" viewBox="0 0 1560 1000" font-family="Arial,sans-serif">
  <rect width="1560" height="1000" fill="#0f172a"/>
  <rect x="0" y="0" width="1560" height="42" fill="#1e40af"/>
  <text x="780" y="26" text-anchor="middle" font-size="15" font-weight="800" fill="white">ER Diagram — Entity Relationship Diagram · CUPGS Feedback System (Chen Notation)</text>
  <defs>
    <marker id="ae" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
      <polygon points="0 0,10 4,0 8" fill="#64748b"/>
    </marker>
  </defs>

  <!-- Entity: DEPARTMENTS -->
  <rect x="580" y="90" width="220" height="148" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="580" y="90" width="220" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="580" y="116" width="220" height="6" fill="#1d4ed8"/>
  <text x="690" y="110" text-anchor="middle" font-size="13" font-weight="800" fill="white">DEPARTMENTS</text>
  <text x="592" y="136" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="584" y1="144" x2="796" y2="144" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="592" y="156" font-size="9" fill="#e2e8f0">code (varchar) UNIQUE</text>
  <text x="592" y="168" font-size="9" fill="#e2e8f0">name (varchar)</text>
  <text x="592" y="180" font-size="9" fill="#e2e8f0">hod_name (varchar)</text>
  <text x="592" y="192" font-size="9" fill="#e2e8f0">hod_employee_id (varchar)</text>
  <text x="592" y="204" font-size="9" fill="#e2e8f0">created_at (timestamptz)</text>
  <text x="592" y="216" font-size="9" fill="#e2e8f0">updated_at (timestamptz)</text>
  <text x="592" y="228" font-size="9" fill="#e2e8f0">updated_by (varchar)</text>

  <!-- Entity: COURSES -->
  <rect x="1090" y="80" width="215" height="162" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="1090" y="80" width="215" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="1090" y="106" width="215" height="6" fill="#1d4ed8"/>
  <text x="1198" y="100" text-anchor="middle" font-size="13" font-weight="800" fill="white">COURSES</text>
  <text x="1102" y="126" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="1094" y1="134" x2="1301" y2="134" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="1102" y="146" font-size="9" fill="#e2e8f0">code (varchar) UNIQUE</text>
  <text x="1102" y="158" font-size="9" fill="#e2e8f0">name (varchar)</text>
  <text x="1102" y="170" font-size="9" fill="#e2e8f0">department_id (FK)</text>
  <text x="1102" y="182" font-size="9" fill="#93c5fd">faculty_id (FK nullable)</text>
  <text x="1102" y="194" font-size="9" fill="#e2e8f0">semester (int)</text>
  <text x="1102" y="206" font-size="9" fill="#e2e8f0">academic_year (varchar)</text>
  <text x="1102" y="218" font-size="9" fill="#e2e8f0">credits (int)</text>
  <text x="1102" y="230" font-size="9" fill="#e2e8f0">is_active (boolean)</text>

  <!-- Entity: FACULTY -->
  <rect x="56" y="80" width="220" height="148" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="56" y="80" width="220" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="56" y="106" width="220" height="6" fill="#1d4ed8"/>
  <text x="166" y="100" text-anchor="middle" font-size="13" font-weight="800" fill="white">FACULTY</text>
  <text x="68" y="126" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="60" y1="134" x2="272" y2="134" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="68" y="146" font-size="9" fill="#e2e8f0">employee_id (varchar) UNIQUE</text>
  <text x="68" y="158" font-size="9" fill="#e2e8f0">name (varchar)</text>
  <text x="68" y="170" font-size="9" fill="#e2e8f0">designation (varchar)</text>
  <text x="68" y="182" font-size="9" fill="#e2e8f0">email (varchar)</text>
  <text x="68" y="194" font-size="9" fill="#e2e8f0">phone (varchar)</text>
  <text x="68" y="206" font-size="9" fill="#e2e8f0">department_id (FK)</text>
  <text x="68" y="218" font-size="9" fill="#e2e8f0">is_active (boolean)</text>

  <!-- Entity: FEEDBACK -->
  <rect x="510" y="560" width="260" height="280" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="510" y="560" width="260" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="510" y="586" width="260" height="6" fill="#1d4ed8"/>
  <text x="640" y="580" text-anchor="middle" font-size="13" font-weight="800" fill="white">FEEDBACK</text>
  <text x="522" y="604" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="514" y1="612" x2="766" y2="612" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="522" y="624" font-size="9" fill="#e2e8f0">reference_id UNIQUE</text>
  <text x="522" y="636" font-size="9" fill="#e2e8f0">course_id (FK)</text>
  <text x="522" y="648" font-size="9" fill="#93c5fd">faculty_id (FK nullable)</text>
  <text x="522" y="660" font-size="9" fill="#e2e8f0">department_id (FK)</text>
  <text x="522" y="672" font-size="9" fill="#e2e8f0">semester, academic_year</text>
  <text x="522" y="684" font-size="9" fill="#e2e8f0">student_year, section</text>
  <text x="522" y="696" font-size="9" fill="#e2e8f0">feedback_type</text>
  <text x="522" y="708" font-size="9" fill="#e2e8f0">rating_teaching_quality (real)</text>
  <text x="522" y="720" font-size="9" fill="#e2e8f0">rating_course_content (real)</text>
  <text x="522" y="732" font-size="9" fill="#e2e8f0">rating_lab_facilities (real)</text>
  <text x="522" y="744" font-size="9" fill="#e2e8f0">rating_study_material (real)</text>
  <text x="522" y="756" font-size="9" fill="#e2e8f0">rating_overall (real)</text>
  <text x="522" y="768" font-size="9" fill="#e2e8f0">comments (text)</text>
  <text x="522" y="780" font-size="9" fill="#e2e8f0">is_anonymous (boolean)</text>
  <text x="522" y="792" font-size="9" fill="#e2e8f0">custom_answers (jsonb)</text>
  <text x="522" y="804" font-size="9" fill="#e2e8f0">submitted_at (timestamptz)</text>

  <!-- Entity: FORM_TEMPLATES -->
  <rect x="1090" y="558" width="240" height="100" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="1090" y="558" width="240" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="1090" y="584" width="240" height="6" fill="#1d4ed8"/>
  <text x="1210" y="578" text-anchor="middle" font-size="13" font-weight="800" fill="white">FORM_TEMPLATES</text>
  <text x="1102" y="602" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="1094" y1="610" x2="1326" y2="610" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="1102" y="622" font-size="9" fill="#e2e8f0">department_id (FK) UNIQUE</text>
  <text x="1102" y="634" font-size="9" fill="#e2e8f0">fields (jsonb)</text>
  <text x="1102" y="646" font-size="9" fill="#e2e8f0">created_at / updated_at</text>

  <!-- Entity: FEEDBACK_WINDOWS -->
  <rect x="56" y="558" width="240" height="130" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <rect x="56" y="558" width="240" height="32" rx="6" fill="#1d4ed8"/>
  <rect x="56" y="584" width="240" height="6" fill="#1d4ed8"/>
  <text x="176" y="578" text-anchor="middle" font-size="13" font-weight="800" fill="white">FEEDBACK_WINDOWS</text>
  <text x="68" y="602" font-size="9" fill="#fbbf24" font-weight="700">PK  id (serial)</text>
  <line x1="60" y1="610" x2="292" y2="610" stroke="#3b82f6" stroke-width="0.5"/>
  <text x="68" y="622" font-size="9" fill="#e2e8f0">title (varchar)</text>
  <text x="68" y="634" font-size="9" fill="#93c5fd">department_id (FK nullable)</text>
  <text x="68" y="646" font-size="9" fill="#e2e8f0">is_active (boolean)</text>
  <text x="68" y="658" font-size="9" fill="#e2e8f0">start_date (timestamptz)</text>
  <text x="68" y="670" font-size="9" fill="#e2e8f0">end_date (timestamptz)</text>

  <!-- Relationship Diamonds (Chen) -->
  <!-- DEPARTMENTS OFFERS COURSES -->
  <polygon points="880,164 940,164 910,184 880,164" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="910" y="178" text-anchor="middle" font-size="9" font-weight="700" fill="white">OFFERS</text>
  <line x1="800" y1="164" x2="880" y2="170" stroke="#64748b" stroke-width="1.5"/>
  <line x1="940" y1="170" x2="1090" y2="158" stroke="#64748b" stroke-width="1.5"/>
  <text x="818" y="158" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="1072" y="152" font-size="11" font-weight="800" fill="#f59e0b">N</text>

  <!-- DEPARTMENTS EMPLOYS FACULTY -->
  <polygon points="316,164 376,164 346,184 316,164" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="346" y="178" text-anchor="middle" font-size="9" font-weight="700" fill="white">EMPLOYS</text>
  <line x1="580" y1="164" x2="376" y2="170" stroke="#64748b" stroke-width="1.5"/>
  <line x1="316" y1="170" x2="276" y2="154" stroke="#64748b" stroke-width="1.5"/>
  <text x="564" y="158" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="278" y="148" font-size="11" font-weight="800" fill="#f59e0b">N</text>

  <!-- COURSES TEACHES via FEEDBACK -->
  <polygon points="750,430 810,430 780,450 750,430" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="780" y="444" text-anchor="middle" font-size="9" font-weight="700" fill="white">RECORDED IN</text>
  <line x1="1090" y1="220" x2="780" y2="430" stroke="#64748b" stroke-width="1.3"/>
  <line x1="780" y1="450" x2="710" y2="560" stroke="#64748b" stroke-width="1.3"/>
  <text x="1068" y="214" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="716" y="554" font-size="11" font-weight="800" fill="#f59e0b">N</text>

  <!-- DEPT HAS FORM_TEMPLATE -->
  <polygon points="1170,388 1230,388 1200,408 1170,388" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="1200" y="402" text-anchor="middle" font-size="9" font-weight="700" fill="white">HAS FORM</text>
  <line x1="1200" y1="238" x2="1200" y2="388" stroke="#64748b" stroke-width="1.3"/>
  <line x1="1200" y1="408" x2="1200" y2="558" stroke="#64748b" stroke-width="1.3"/>
  <text x="1208" y="254" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="1208" y="554" font-size="11" font-weight="800" fill="#f59e0b">1</text>

  <!-- DEPT SCOPES FEEDBACK_WINDOWS -->
  <polygon points="320,420 380,420 350,440 320,420" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="350" y="434" text-anchor="middle" font-size="9" font-weight="700" fill="white">SCOPES</text>
  <line x1="580" y1="200" x2="350" y2="420" stroke="#64748b" stroke-width="1.3"/>
  <line x1="350" y1="440" x2="230" y2="558" stroke="#64748b" stroke-width="1.3"/>
  <text x="562" y="194" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="228" y="552" font-size="11" font-weight="800" fill="#f59e0b">0..N</text>

  <!-- FEEDBACK BELONGS TO DEPT -->
  <polygon points="620,430 680,430 650,450 620,430" fill="#7c3aed" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="650" y="444" text-anchor="middle" font-size="9" font-weight="700" fill="white">BELONGS TO</text>
  <line x1="690" y1="238" x2="650" y2="430" stroke="#64748b" stroke-width="1.3"/>
  <line x1="650" y1="450" x2="640" y2="560" stroke="#64748b" stroke-width="1.3"/>
  <text x="696" y="232" font-size="11" font-weight="800" fill="#f59e0b">1</text>
  <text x="642" y="554" font-size="11" font-weight="800" fill="#f59e0b">N</text>

  <!-- Optional FK: Faculty -> Feedback (dashed) -->
  <line x1="276" y1="192" x2="510" y2="650" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="8,4"/>
  <text x="330" y="470" font-size="9" fill="#818cf8" transform="rotate(-58, 330, 470)">0..1 optional FK</text>

  <!-- Legend -->
  <rect x="20" y="948" width="540" height="42" rx="5" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="36" y="963" font-size="10" font-weight="800" fill="white">LEGEND — Chen Notation</text>
  <rect x="36" y="970" width="22" height="14" rx="3" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1"/>
  <text x="64" y="981" font-size="9" fill="#e2e8f0">Entity</text>
  <polygon points="130,984 156,977 130,970 104,977" fill="#7c3aed" stroke="#a78bfa" stroke-width="1"/>
  <text x="162" y="981" font-size="9" fill="#e2e8f0">Relationship (Diamond)</text>
  <text x="332" y="981" font-size="11" fill="#f59e0b" font-weight="700">1, N</text>
  <text x="356" y="981" font-size="9" fill="#e2e8f0">= Cardinality</text>
  <line x1="436" y1="977" x2="472" y2="977" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="478" y="981" font-size="9" fill="#e2e8f0">Optional FK</text>
</svg>`;

const svgs = [
  { name: "dfd0-context", svg: svg0, title: "DFD Level 0" },
  { name: "dfd1-level1", svg: svg1, title: "DFD Level 1" },
  { name: "dfd2-level2", svg: svg2, title: "DFD Level 2" },
  { name: "er-diagram", svg: svg3, title: "ER Diagram" },
];

console.log("Writing SVG files...");
const pdfPages = [];
for (const { name, svg, title } of svgs) {
  const svgPath = join(OUT, `${name}.svg`);
  const pngPath = join(OUT, `${name}.png`);
  writeFileSync(svgPath, svg, "utf8");
  console.log(`  ✓ ${title} SVG written`);

  // Convert SVG → PNG @ 200 DPI with white background
  execSync(
    `convert -density 200 -background white -alpha remove -alpha off "${svgPath}" "${pngPath}"`,
    { stdio: "pipe" }
  );
  console.log(`  ✓ ${title} PNG generated`);
  pdfPages.push(pngPath);
}

// Merge all PNGs into one multi-page PDF (A3 landscape each page)
const outPdf = join(OUT, "CUPGS-SE-Diagrams.pdf");
const pngList = pdfPages.map((p) => `"${p}"`).join(" ");
execSync(
  `convert ${pngList} -page A3 "${outPdf}"`,
  { stdio: "pipe" }
);

console.log(`\n✅ PDF generated: ${outPdf}`);
console.log(`   Pages: ${pdfPages.length}`);
