export function DfdLevel2() {
  const W = 1200, H = 760;
  const EB = "#1e3a8a";
  const PF = "#14532d";
  const DSF = "#451a03";
  const DSB = "#92400e";
  const AC = "#475569";
  const TC = "#1e293b";
  const LB = "#dbeafe";

  const Entity = ({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
    </g>
  );

  const Process = ({ cx, cy, r, num, label, sub }: { cx: number; cy: number; r: number; num: string; label: string; sub?: string }) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={PF} stroke="#16a34a" strokeWidth={1.8} />
      <text x={cx} y={cy - (sub ? 13 : 5)} textAnchor="middle" fontSize={10} fontWeight="800" fill="#86efac" dominantBaseline="middle">{num}</text>
      <text x={cx} y={cy + (sub ? 2 : 9)} textAnchor="middle" fontSize={11} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      {sub && <text x={cx} y={cy + 17} textAnchor="middle" fontSize={10} fill="#a7f3d0" dominantBaseline="middle">{sub}</text>}
    </g>
  );

  const DataStore = ({ x, y, w, num, label }: { x: number; y: number; w: number; num: string; label: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={34} fill={DSF} stroke={DSB} strokeWidth={1.5} />
      <rect x={x} y={y} width={32} height={34} fill={DSB} />
      <line x1={x + 32} y1={y} x2={x + 32} y2={y + 34} stroke={DSB} strokeWidth={1.5} />
      <text x={x + 16} y={y + 17} textAnchor="middle" fontSize={10} fontWeight="800" fill="white" dominantBaseline="middle">{num}</text>
      <text x={x + 32 + (w - 32) / 2} y={y + 17} textAnchor="middle" fontSize={11} fontWeight="600" fill="#fcd34d" dominantBaseline="middle">{label}</text>
    </g>
  );

  const Arr = ({ x1, y1, x2, y2, label, lx, ly, c }: { x1: number; y1: number; x2: number; y2: number; label: string; lx?: number; ly?: number; c?: string }) => {
    const mx = lx ?? (x1 + x2) / 2;
    const my = ly ?? (y1 + y2) / 2;
    const tw = Math.min(label.length * 6.2, 170);
    const d = c ?? `M${x1},${y1} L${x2},${y2}`;
    return (
      <g>
        <path d={d} stroke={AC} strokeWidth={1.5} fill="none" markerEnd="url(#arr2)" />
        <rect x={mx - tw / 2 - 3} y={my - 10} width={tw + 6} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.6} />
        <text x={mx} y={my + 0.5} textAnchor="middle" fontSize={9.5} fill={TC} dominantBaseline="middle">{label}</text>
      </g>
    );
  };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: 24 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <marker id="arr2" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill={AC} />
            </marker>
          </defs>
          <rect width={W} height={H} rx={10} fill="white" />

          {/* Title */}
          <text x={W / 2} y={32} textAnchor="middle" fontSize={17} fontWeight="800" fill={TC}>DFD Level 2 — Explosion of Process 2.0</text>
          <text x={W / 2} y={52} textAnchor="middle" fontSize={12} fill="#64748b">Feedback Collection Sub-Processes · Yourdon-Coad Notation</text>
          <line x1={40} y1={62} x2={W - 40} y2={62} stroke="#e2e8f0" strokeWidth={1} />

          {/* Dashed boundary box for Process 2.0 */}
          <rect x={90} y={75} width={1020} height={530} rx={10} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="8,4" />
          <text x={110} y={94} fontSize={10} fill="#16a34a" fontWeight="700">Process 2.0 — Feedback Collection (Expanded)</text>

          {/* External Entities */}
          <Entity x={20} y={260} w={120} h={55} label="STUDENT" />
          <Entity x={20} y={420} w={120} h={55} label="HOD FORM" />

          {/* ── Sub-Processes ── */}
          {/* 2.1 Validate Inputs */}
          <Process cx={310} cy={200} r={68} num="2.1" label="Validate" sub="Inputs" />
          {/* 2.2 Check Feedback Window */}
          <Process cx={310} cy={430} r={68} num="2.2" label="Check Feedback" sub="Window" />
          {/* 2.3 Profanity Filter */}
          <Process cx={570} cy={310} r={68} num="2.3" label="Profanity" sub="Filter" />
          {/* 2.4 Course-Faculty Check */}
          <Process cx={810} cy={200} r={68} num="2.4" label="Course-Faculty" sub="Integrity" />
          {/* 2.5 Generate Reference ID */}
          <Process cx={810} cy={430} r={68} num="2.5" label="Generate" sub="Reference ID" />
          {/* 2.6 Store Feedback */}
          <Process cx={1050} cy={310} r={68} num="2.6" label="Store" sub="Feedback" />

          {/* ── Data Stores ── */}
          <DataStore x={220} y={662} w={200} num="D2" label="Courses" />
          <DataStore x={460} y={662} w={220} num="D3" label="Faculty" />
          <DataStore x={720} y={662} w={230} num="D6" label="Feedback Windows" />
          <DataStore x={860} y={662} w={200} num="D1" label="Feedback" />

          {/* ── DATA FLOWS ── */}

          {/* Student → 2.1 Validate */}
          <Arr x1={140} y1={276} x2={242} y2={215} label="Raw Feedback Data" lx={186} ly={238} />

          {/* HOD Form Template → 2.1 Validate */}
          <Arr x1={140} y1={440} x2={244} y2={415} label="Form Template" lx={187} ly={420} />

          {/* 2.1 → 2.3 Profanity Filter */}
          <Arr x1={378} y1={210} x2={502} y2={285} label="Validated Fields" lx={436} ly={238} />

          {/* 2.2 → 2.1 (Window OK) */}
          <Arr x1={310} y1={362} x2={310} y2={268} label="Window Open" lx={346} ly={315} />

          {/* D6 → 2.2 Check Window */}
          <Arr x1={760} y1={662} x2={358} y2={497} label="Window Status" c={`M760,662 C600,660 450,580 358,497`} lx={556} ly={636} />

          {/* 2.2 → D6 (query) */}
          <Arr x1={340} y1={496} x2={740} y2={662} label="Window Query" c={`M340,496 C460,600 620,660 740,662`} lx={490} ly={595} />

          {/* 2.3 → 2.4 Integrity Check */}
          <Arr x1={638} y1={285} x2={742} y2={215} label="Filtered Content" lx={690} ly={244} />

          {/* 2.3 → 2.5 (after profanity check) */}
          <Arr x1={638} y1={330} x2={742} y2={410} label="Text Fields OK" lx={690} ly={374} />

          {/* D2 Courses → 2.4 */}
          <Arr x1={370} y1={662} x2={770} y2={267} label="Course Record" c={`M370,662 C400,500 650,350 770,267`} lx={488} ly={500} />

          {/* D3 Faculty → 2.4 */}
          <Arr x1={600} y1={662} x2={800} y2={268} label="Faculty Record" c={`M600,662 C680,500 780,380 800,268`} lx={714} ly={520} />

          {/* 2.4 → 2.6 (integrity passed) */}
          <Arr x1={878} y1={210} x2={982} y2={275} label="Integrity Passed" lx={932} ly={236} />

          {/* 2.5 → 2.6 (ref ID generated) */}
          <Arr x1={878} y1={420} x2={982} y2={345} label="Reference ID" lx={932} ly={375} />

          {/* 2.6 → D1 Feedback (store) */}
          <Arr x1={1050} y1={378} x2={1000} y2={662} label="Feedback Record" lx={1054} ly={530} />

          {/* 2.6 → Student (confirmation out) */}
          <Arr x1={982} y1={300} x2={140} y2={300} label="Submission Confirmed + Ref ID" c={`M982,300 C800,238 300,238 140,290`} lx={560} ly={224} />

          {/* Legend */}
          <rect x={40} y={H - 72} width={360} height={56} rx={6} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={54} y={H - 57} fontSize={10} fontWeight="800" fill={TC}>LEGEND</text>
          <rect x={54} y={H - 48} width={22} height={14} rx={2} fill={EB} />
          <text x={82} y={H - 37} fontSize={10} fill={TC}>External Entity</text>
          <circle cx={180} cy={H - 41} r={8} fill={PF} />
          <text x={194} y={H - 37} fontSize={10} fill={TC}>Sub-Process</text>
          <rect x={268} y={H - 49} width={22} height={14} fill={DSB} />
          <rect x={290} y={H - 49} width={60} height={14} fill={DSF} />
          <text x={358} y={H - 37} fontSize={10} fill={TC}>Data Store</text>
        </svg>
      </div>
    </div>
  );
}
