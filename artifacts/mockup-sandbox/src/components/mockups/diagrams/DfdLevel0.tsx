export function DfdLevel0() {
  const W = 1100, H = 600;
  const EB = "#1e3a8a"; // entity fill
  const PF = "#14532d"; // process fill
  const AC = "#475569"; // arrow color
  const TC = "#1e293b"; // text color
  const LB = "#dbeafe"; // label bg

  const Marker = () => (
    <defs>
      <marker id="arr0" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill={AC} />
      </marker>
      <filter id="shadow0">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.15" />
      </filter>
    </defs>
  );

  const Entity = ({ x, y, w, h, label, sub }: { x: number; y: number; w: number; h: number; label: string; sub?: string }) => (
    <g filter="url(#shadow0)">
      <rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 6 : 0)} textAnchor="middle" fontSize={13} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontSize={10} fill="#93c5fd" dominantBaseline="middle">{sub}</text>}
    </g>
  );

  const FlowArrow = ({ x1, y1, x2, y2, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; label: string; lx?: number; ly?: number }) => {
    const mx = lx ?? (x1 + x2) / 2;
    const my = ly ?? (y1 + y2) / 2;
    const tw = label.length * 6.5;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0)" />
        <rect x={mx - tw / 2 - 4} y={my - 10} width={tw + 8} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8} />
        <text x={mx} y={my + 0.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">{label}</text>
      </g>
    );
  };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: 24 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <Marker />
          <rect x={0} y={0} width={W} height={H} rx={10} fill="white" />

          {/* Title */}
          <text x={W / 2} y={32} textAnchor="middle" fontSize={17} fontWeight="800" fill={TC}>DFD Level 0 — Context Diagram</text>
          <text x={W / 2} y={52} textAnchor="middle" fontSize={12} fill="#64748b">CUPGS Academic Feedback Management System · Yourdon-Coad Notation</text>
          <line x1={40} y1={62} x2={W - 40} y2={62} stroke="#e2e8f0" strokeWidth={1} />

          {/* External Entities */}
          <Entity x={420} y={78} w={260} h={60} label="STUDENT" sub="External Entity" />
          <Entity x={900} y={240} w={160} h={60} label="HOD" sub="External Entity" />
          <Entity x={420} y={462} w={260} h={60} label="ADMIN" sub="External Entity" />
          <Entity x={20} y={240} w={160} h={60} label="FACULTY" sub="External Entity" />

          {/* Central Process — Circle (Yourdon notation) */}
          <circle cx={550} cy={285} r={118} fill={PF} stroke="#16a34a" strokeWidth={2} filter="url(#shadow0)" />
          <circle cx={550} cy={285} r={114} fill="none" stroke="#4ade80" strokeWidth={0.5} />
          <text x={550} y={268} textAnchor="middle" fontSize={15} fontWeight="800" fill="white" dominantBaseline="middle">0.</text>
          <text x={550} y={286} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">CUPGS Feedback</text>
          <text x={550} y={304} textAnchor="middle" fontSize={12} fill="#86efac" dominantBaseline="middle">Management System</text>

          {/* ── Student ↕ System ── */}
          <FlowArrow x1={528} y1={138} x2={528} y2={167} label="Feedback Submission" lx={420} ly={152} />
          <FlowArrow x1={572} y1={167} x2={572} y2={138} label="Submission Confirmation" lx={690} ly={148} />

          {/* ── HOD ↔ System ── */}
          <FlowArrow x1={900} y1={262} x2={668} y2={262} label="Form Template Config" lx={783} ly={248} />
          <FlowArrow x1={668} y1={282} x2={900} y2={282} label="Analytics Report / PDF" lx={783} ly={296} />

          {/* ── Admin ↕ System ── */}
          <FlowArrow x1={528} y1={462} x2={528} y2={403} label="Dept / Course Config" lx={420} ly={432} />
          <FlowArrow x1={572} y1={403} x2={572} y2={462} label="Institution Dashboard" lx={690} ly={437} />

          {/* ── Faculty ↔ System ── */}
          <FlowArrow x1={180} y1={262} x2={432} y2={262} label="View Request / Login" lx={308} ly={248} />
          <FlowArrow x1={432} y1={282} x2={180} y2={282} label="Performance Analytics" lx={308} ly={296} />

          {/* Legend */}
          <rect x={40} y={H - 72} width={320} height={58} rx={6} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={54} y={H - 57} fontSize={10} fontWeight="700" fill={TC}>LEGEND</text>
          <rect x={54} y={H - 48} width={24} height={14} rx={2} fill={EB} />
          <text x={83} y={H - 37} fontSize={10} fill={TC}>External Entity (Rectangle)</text>
          <circle cx={66} cy={H - 20} r={8} fill={PF} />
          <text x={83} y={H - 16} fontSize={10} fill={TC}>Process (Circle — Yourdon)</text>
        </svg>
      </div>
    </div>
  );
}
