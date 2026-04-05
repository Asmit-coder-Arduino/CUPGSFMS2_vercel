export function DfdLevel1() {
  const W = 1560, H = 900;
  const EB = "#1e3a8a";
  const PF = "#14532d";
  const DSF = "#451a03";
  const DSB = "#92400e";
  const AC = "#475569";
  const TC = "#1e293b";
  const LB = "#dbeafe";

  const Entity = ({ x, y, w, h, label, sub }: { x: number; y: number; w: number; h: number; label: string; sub?: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 6 : 0)} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" fontSize={9} fill="#93c5fd" dominantBaseline="middle">{sub}</text>}
    </g>
  );

  const Process = ({ cx, cy, r, num, label, sub }: { cx: number; cy: number; r: number; num: string; label: string; sub?: string }) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={PF} stroke="#16a34a" strokeWidth={1.8} />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="#4ade8066" strokeWidth={0.5} />
      <text x={cx} y={cy - (sub ? 14 : 6)} textAnchor="middle" fontSize={11} fontWeight="800" fill="#86efac" dominantBaseline="middle">{num}</text>
      <text x={cx} y={cy + (sub ? 2 : 8)} textAnchor="middle" fontSize={11} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      {sub && <text x={cx} y={cy + 17} textAnchor="middle" fontSize={10} fill="#a7f3d0" dominantBaseline="middle">{sub}</text>}
    </g>
  );

  const DataStore = ({ x, y, w, num, label }: { x: number; y: number; w: number; num: string; label: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={0} fill={DSF} stroke={DSB} strokeWidth={1.5} />
      <rect x={x} y={y} width={34} height={36} rx={0} fill={DSB} />
      <line x1={x + 34} y1={y} x2={x + 34} y2={y + 36} stroke={DSB} strokeWidth={1.5} />
      <text x={x + 17} y={y + 18} textAnchor="middle" fontSize={10} fontWeight="800" fill="white" dominantBaseline="middle">{num}</text>
      <text x={x + 34 + (w - 34) / 2} y={y + 18} textAnchor="middle" fontSize={11} fontWeight="600" fill="#fcd34d" dominantBaseline="middle">{label}</text>
    </g>
  );

  const Arrow = ({ x1, y1, x2, y2, label, lx, ly, curve }: { x1: number; y1: number; x2: number; y2: number; label: string; lx?: number; ly?: number; curve?: string }) => {
    const mx = lx ?? (x1 + x2) / 2;
    const my = ly ?? (y1 + y2) / 2;
    const tw = Math.min(label.length * 6.2, 160);
    const path = curve ?? `M${x1},${y1} L${x2},${y2}`;
    return (
      <g>
        <path d={path} stroke={AC} strokeWidth={1.5} fill="none" markerEnd="url(#arr1)" />
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
            <marker id="arr1" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill={AC} />
            </marker>
          </defs>
          <rect x={0} y={0} width={W} height={H} rx={10} fill="white" />

          {/* Title */}
          <text x={W / 2} y={32} textAnchor="middle" fontSize={17} fontWeight="800" fill={TC}>DFD Level 1 — Functional Decomposition</text>
          <text x={W / 2} y={52} textAnchor="middle" fontSize={12} fill="#64748b">CUPGS Academic Feedback Management System · Yourdon-Coad Notation</text>
          <line x1={40} y1={62} x2={W - 40} y2={62} stroke="#e2e8f0" strokeWidth={1} />

          {/* ── External Entities ── */}
          <Entity x={30} y={160} w={140} h={60} label="STUDENT" sub="External Entity" />
          <Entity x={30} y={510} w={140} h={60} label="FACULTY" sub="External Entity" />
          <Entity x={1370} y={145} w={150} h={60} label="HOD" sub="External Entity" />
          <Entity x={1370} y={490} w={150} h={60} label="ADMIN" sub="External Entity" />

          {/* ── Processes ── */}
          <Process cx={430} cy={210} r={72} num="1.0" label="Authentication" />
          <Process cx={430} cy={520} r={72} num="2.0" label="Feedback" sub="Collection" />
          <Process cx={780} cy={210} r={72} num="3.0" label="Form Template" sub="Management" />
          <Process cx={780} cy={520} r={72} num="4.0" label="Analytics &" sub="Reporting" />
          <Process cx={1120} cy={360} r={72} num="5.0" label="Institution" sub="Management" />

          {/* ── Data Stores ── */}
          <DataStore x={80} y={756} w={220} num="D1" label="Feedback" />
          <DataStore x={340} y={756} w={210} num="D2" label="Courses" />
          <DataStore x={590} y={756} w={210} num="D3" label="Faculty" />
          <DataStore x={840} y={756} w={230} num="D4" label="Departments" />
          <DataStore x={590} y={76} w={240} num="D5" label="Form Templates" />
          <DataStore x={100} y={378} w={230} num="D6" label="Feedback Windows" />

          {/* ══════════════════════════════════ */}
          {/* ── DATA FLOWS ── */}
          {/* ══════════════════════════════════ */}

          {/* Student → 1.0 Auth: Login Credentials */}
          <Arrow x1={170} y1={178} x2={358} y2={200} label="Login Credentials" lx={260} ly={181} />
          {/* 1.0 Auth → Student: Auth Token */}
          <Arrow x1={360} y1={220} x2={170} y2={202} label="Auth Token" lx={260} ly={218} />

          {/* Student → 2.0 Feedback: Feedback Data */}
          <Arrow x1={170} y1={548} x2={358} y2={532} label="Feedback Submission" lx={263} ly={533} />
          {/* 2.0 Feedback → Student: Confirmation */}
          <Arrow x1={360} y1={552} x2={170} y2={568} label="Reference ID / Confirm" lx={262} ly={568} />

          {/* Faculty → 1.0 Auth */}
          <Arrow x1={170} y1={522} x2={380} y2={268} label="Login" curve={`M170,522 C240,400 320,320 380,268`} lx={252} ly={390} />
          {/* 4.0 → Faculty: Performance Report */}
          <Arrow x1={714} y1={548} x2={170} y2={552} label="Performance Report" lx={440} ly={560} />

          {/* HOD ↔ 3.0 Form Template */}
          <Arrow x1={1370} y1={168} x2={852} y2={195} label="Form Config Request" lx={1110} ly={174} />
          <Arrow x1={852} y1={218} x2={1370} y2={192} label="Template Saved" lx={1110} ly={210} />
          {/* HOD ← 4.0 Analytics */}
          <Arrow x1={848} y1={500} x2={1370} y2={490} label="Dept Analytics / PDF" lx={1108} ly={488} />

          {/* Admin ↔ 5.0 Institution */}
          <Arrow x1={1370} y1={510} x2={1192} y2={390} label="Mgmt Request" lx={1300} ly={440} />
          <Arrow x1={1192} y1={405} x2={1370} y2={530} label="System Dashboard" lx={1300} ly={475} />

          {/* 1.0 Auth → 2.0 Feedback: Validated session */}
          <Arrow x1={430} y1={282} x2={430} y2={448} label="Auth Validated" lx={466} ly={365} />

          {/* 1.0 Auth → 3.0 Form Template: Auth Check */}
          <Arrow x1={502} y1={210} x2={708} y2={210} label="Auth Check" lx={605} ly={197} />

          {/* 1.0 Auth → 5.0 Institution */}
          <Arrow x1={492} y1={230} x2={1054} y2={322} label="Admin Auth" curve={`M492,230 C700,240 900,290 1054,322`} lx={770} ly={252} />

          {/* 3.0 Form Template → 2.0 Feedback: Form Config */}
          <Arrow x1={780} y1={282} x2={780} y2={448} label="Form Config" lx={820} ly={365} />

          {/* 2.0 Feedback ↔ D1 */}
          <Arrow x1={400} y1={590} x2={230} y2={756} label="Store Feedback" lx={290} ly={660} />
          <Arrow x1={210} y1={756} x2={386} y2={590} label="Feedback Records" lx={274} ly={692} />

          {/* 2.0 Feedback → D6 Windows (check) */}
          <Arrow x1={380} y1={490} x2={330} y2={414} label="Check Window" lx={340} ly={450} />
          <Arrow x1={310} y1={414} x2={370} y2={490} label="Window Status" lx={316} ly={460} />

          {/* 2.0 Feedback → D2 Courses */}
          <Arrow x1={450} y1={590} x2={450} y2={756} label="Course Lookup" lx={490} ly={673} />
          <Arrow x1={462} y1={756} x2={462} y2={590} label="Course + Faculty" lx={520} ly={700} />

          {/* 3.0 ↔ D5 Form Templates */}
          <Arrow x1={760} y1={138} x2={760} y2={112} label="Save Template" lx={810} ly={124} />
          <Arrow x1={790} y1={112} x2={790} y2={138} label="Load Template" lx={848} ly={124} />

          {/* 4.0 Analytics ↔ D1 */}
          <Arrow x1={740} y1={590} x2={300} y2={756} label="Read Feedback" lx={500} ly={680} />

          {/* 4.0 Analytics ↔ D2 Courses */}
          <Arrow x1={760} y1={590} x2={530} y2={756} label="Read Courses" lx={645} ly={672} />

          {/* 4.0 Analytics ↔ D3 Faculty */}
          <Arrow x1={780} y1={592} x2={720} y2={756} label="Read Faculty" lx={745} ly={673} />

          {/* 5.0 Institution ↔ D2 Courses */}
          <Arrow x1={1084} y1={428} x2={548} y2={756} label="Manage Courses" curve={`M1084,428 C950,580 750,700 548,756`} lx={820} ly={620} />

          {/* 5.0 Institution ↔ D3 Faculty */}
          <Arrow x1={1090} y1={432} x2={798} y2={756} label="Manage Faculty" curve={`M1090,432 C980,580 900,700 798,756`} lx={970} ly={615} />

          {/* 5.0 Institution ↔ D4 Departments */}
          <Arrow x1={1100} y1={430} x2={1060} y2={756} label="Manage Depts" lx={1096} ly={590} />

          {/* ── Legend ── */}
          <rect x={40} y={H - 82} width={380} height={68} rx={6} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text x={54} y={H - 66} fontSize={10} fontWeight="800" fill={TC}>LEGEND (Yourdon-Coad + Gane-Sarson)</text>
          <rect x={54} y={H - 58} width={22} height={14} rx={2} fill={EB} />
          <text x={82} y={H - 47} fontSize={10} fill={TC}>External Entity (Rectangle)</text>
          <circle cx={65} cy={H - 30} r={8} fill={PF} />
          <text x={82} y={H - 26} fontSize={10} fill={TC}>Process (Circle)</text>
          <rect x={54} y={H - 42} width={22} height={14} rx={0} fill={DSB} />
          <text x={82} y={H - 31} fontSize={10} fill={TC} />
          <rect x={200} y={H - 58} width={30} height={14} rx={0} fill={DSB} />
          <rect x={230} y={H - 58} width={80} height={14} fill={DSF} />
          <text x={318} y={H - 47} fontSize={10} fill={TC}>Data Store (Gane-Sarson)</text>
          <line x1={200} y1={H - 36} x2={240} y2={H - 36} stroke={AC} strokeWidth={1.5} markerEnd="url(#arr1)" />
          <text x={248} y={H - 32} fontSize={10} fill={TC}>Data Flow (Arrow)</text>
        </svg>
      </div>
    </div>
  );
}
