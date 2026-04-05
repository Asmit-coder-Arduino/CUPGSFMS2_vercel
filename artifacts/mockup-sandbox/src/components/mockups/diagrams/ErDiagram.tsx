export function ErDiagram() {
  const W = 1500, H = 960;
  const EF = "#1e3a8a";
  const AF = "#374151";
  const RF = "#7c3aed";
  const TC = "#1e293b";
  const AC = "#475569";

  const Entity = ({ x, y, w, h, name, pk, attrs }: { x: number; y: number; w: number; h: number; name: string; pk: string; attrs: string[] }) => (
    <g>
      {/* Entity box */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill={EF} stroke="#3b82f6" strokeWidth={2} />
      {/* Header bar */}
      <rect x={x} y={y} width={w} height={32} rx={6} fill="#1d4ed8" />
      <rect x={x} y={y + 24} width={w} height={8} fill="#1d4ed8" />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize={13} fontWeight="800" fill="white" dominantBaseline="middle">{name}</text>
      {/* Attributes */}
      <text x={x + 10} y={y + 45} fontSize={10} fill="#fbbf24" fontWeight="700" dominantBaseline="middle">PK  {pk}</text>
      <line x1={x + 4} y1={y + 53} x2={x + w - 4} y2={y + 53} stroke="#3b82f6" strokeWidth={0.5} />
      {attrs.map((a, i) => (
        <text key={i} x={x + 10} y={y + 62 + i * 16} fontSize={10} fill="#e2e8f0" dominantBaseline="middle">{a}</text>
      ))}
    </g>
  );

  const Oval = ({ cx, cy, rx, ry, label, isPK }: { cx: number; cy: number; rx: number; ry: number; label: string; isPK?: boolean }) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={isPK ? "#1e3a8a" : AF} stroke={isPK ? "#60a5fa" : "#6b7280"} strokeWidth={1.2} />
      {isPK
        ? <text x={cx} y={cy} textAnchor="middle" fontSize={9} fill="#fbbf24" fontWeight="700" dominantBaseline="middle" textDecoration="underline">{label}</text>
        : <text x={cx} y={cy} textAnchor="middle" fontSize={9} fill="#d1d5db" dominantBaseline="middle">{label}</text>}
    </g>
  );

  const Diamond = ({ cx, cy, w, h, label }: { cx: number; cy: number; w: number; h: number; label: string }) => {
    const pts = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
    return (
      <g>
        <polygon points={pts} fill={RF} stroke="#a78bfa" strokeWidth={1.5} />
        <text x={cx} y={cy} textAnchor="middle" fontSize={10} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      </g>
    );
  };

  const Rel = ({ x1, y1, x2, y2, c1, c2, curve }: { x1: number; y1: number; x2: number; y2: number; c1: string; c2: string; curve?: string }) => {
    const d = curve ?? `M${x1},${y1} L${x2},${y2}`;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return (
      <g>
        <path d={d} stroke={AC} strokeWidth={1.4} fill="none" />
        <text x={x1 + (x2 > x1 ? 14 : -14)} y={y1 + (y2 > y1 ? 14 : -14)} textAnchor="middle" fontSize={11} fontWeight="800" fill="#f59e0b">{c1}</text>
        <text x={x2 + (x1 > x2 ? 14 : -14)} y={y2 + (y1 > y2 ? 14 : -14)} textAnchor="middle" fontSize={11} fontWeight="800" fill="#f59e0b">{c2}</text>
      </g>
    );
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f172a", borderRadius: 12, boxShadow: "0 4px 32px rgba(0,0,0,0.5)", padding: 24 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <rect width={W} height={H} rx={12} fill="#0f172a" />

          {/* Title */}
          <text x={W / 2} y={34} textAnchor="middle" fontSize={18} fontWeight="800" fill="white">ER Diagram — Entity Relationship Diagram</text>
          <text x={W / 2} y={56} textAnchor="middle" fontSize={12} fill="#64748b">CUPGS Academic Feedback Management System · Chen Notation</text>
          <line x1={40} y1={68} x2={W - 40} y2={68} stroke="#1e293b" strokeWidth={1} />

          {/* ════════════════════════════════════ */}
          {/* ENTITIES */}
          {/* ════════════════════════════════════ */}

          {/* departments — center top */}
          <Entity x={580} y={90} w={220} h={145} name="DEPARTMENTS" pk="id (serial)"
            attrs={["code (varchar)  UNIQUE", "name (varchar)", "hod_name (varchar)", "hod_employee_id (varchar)", "created_at (timestamptz)"]} />

          {/* courses — center right */}
          <Entity x={1100} y={80} w={220} h={162} name="COURSES" pk="id (serial)"
            attrs={["code (varchar)  UNIQUE", "name (varchar)", "department_id (FK)", "faculty_id (FK, nullable)", "semester (int)", "academic_year (varchar)", "credits (int)"]} />

          {/* faculty — far left */}
          <Entity x={60} y={80} w={220} h={145} name="FACULTY" pk="id (serial)"
            attrs={["employee_id (varchar) UNIQUE", "name (varchar)", "designation (varchar)", "email (varchar)", "phone (varchar)", "department_id (FK)"]} />

          {/* feedback — center bottom */}
          <Entity x={510} y={560} w={260} h={225} name="FEEDBACK" pk="id (serial)"
            attrs={["reference_id (text) UNIQUE", "course_id (FK)", "faculty_id (FK, nullable)", "department_id (FK)", "semester (int)", "academic_year (varchar)", "student_year (int)", "section (varchar)", "feedback_type (text)", "rating_course_content (real)", "rating_teaching_quality (real)", "rating_lab_facilities (real)", "rating_study_material (real)", "rating_overall (real)", "comments (text)", "is_anonymous (boolean)", "custom_answers (jsonb)", "created_at (timestamptz)"]} />

          {/* form_templates — far right */}
          <Entity x={1100} y={560} w={230} h={100} name="FORM_TEMPLATES" pk="id (serial)"
            attrs={["department_id (FK) UNIQUE", "fields (jsonb)", "created_at / updated_at"]} />

          {/* feedback_windows — bottom left */}
          <Entity x={60} y={560} w={230} h={130} name="FEEDBACK_WINDOWS" pk="id (serial)"
            attrs={["title (varchar)", "department_id (FK, nullable)", "is_active (boolean)", "start_date (timestamptz)", "end_date (timestamptz)"]} />

          {/* ════════════════════════════════════ */}
          {/* RELATIONSHIPS (Diamonds) */}
          {/* ════════════════════════════════════ */}

          {/* departments — OWNS — courses */}
          <Diamond cx={880} cy={152} w={110} h={50} label="OFFERS" />

          {/* departments — EMPLOYS — faculty */}
          <Diamond cx={340} cy={152} w={110} h={50} label="EMPLOYS" />

          {/* faculty — TEACHES — courses */}
          <Diamond cx={880} cy={430} w={110} h={50} label="TEACHES" />

          {/* departments — HAS — form_templates */}
          <Diamond cx={1215} cy={390} w={120} h={50} label="HAS FORM" />

          {/* departments — SCOPES — feedback_windows */}
          <Diamond cx={340} cy={430} w={130} h={50} label="SCOPES" />

          {/* feedback — FOR — courses */}
          <Diamond cx={880} cy={660} w={110} h={50} label="FOR" />

          {/* feedback — BY — departments */}
          <Diamond cx={640} cy={430} w={110} h={50} label="BELONGS" />

          {/* ════════════════════════════════════ */}
          {/* RELATIONSHIP LINES with Cardinality */}
          {/* ════════════════════════════════════ */}

          {/* departments ↔ OFFERS ↔ courses (1:N) */}
          <Rel x1={800} y1={152} x2={935} y2={152} c1="1" c2="" />
          <Rel x1={825} y1={152} x2={825} y2={152} c1="" c2="" />
          <line x1={800} y1={152} x2={935} y2={152} stroke={AC} strokeWidth={1.4} />
          <line x1={825} y1={152} x2={1100} y2={152} stroke={AC} strokeWidth={1.4} />
          <text x={810} y={143} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>
          <text x={1090} y={143} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>

          {/* departments ↔ EMPLOYS ↔ faculty (1:N) */}
          <line x1={580} y1={152} x2={395} y2={152} stroke={AC} strokeWidth={1.4} />
          <line x1={285} y1={152} x2={280} y2={152} stroke={AC} strokeWidth={1.4} />
          <text x={560} y={143} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>
          <text x={292} y={143} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>

          {/* faculty ↔ TEACHES ↔ courses (1:N) */}
          <line x1={280} y1={225} x2={280} y2={430} stroke={AC} strokeWidth={1.4} />
          <line x1={280} y1={430} x2={825} y2={430} stroke={AC} strokeWidth={1.4} />
          <line x1={935} y1={430} x2={1210} y2={300} stroke={AC} strokeWidth={1.4} />
          <text x={290} y={435} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>
          <text x={1196} y={290} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>

          {/* departments ↔ HAS FORM ↔ form_templates (1:1) */}
          <line x1={800} y1={200} x2={1215} y2={200} stroke={AC} strokeWidth={1.4} />
          <line x1={1215} y1={200} x2={1215} y2={365} stroke={AC} strokeWidth={1.4} />
          <line x1={1215} y1={415} x2={1215} y2={560} stroke={AC} strokeWidth={1.4} />
          <text x={820} y={192} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>
          <text x={1222} y={555} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>

          {/* departments ↔ SCOPES ↔ feedback_windows (1:N) */}
          <line x1={580} y1={200} x2={340} y2={200} stroke={AC} strokeWidth={1.4} />
          <line x1={340} y1={200} x2={340} y2={405} stroke={AC} strokeWidth={1.4} />
          <line x1={340} y1={455} x2={200} y2={560} stroke={AC} strokeWidth={1.4} />
          <text x={560} y={192} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>
          <text x={198} y={555} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>

          {/* feedback ↔ FOR ↔ courses (N:1) */}
          <line x1={770} y1={660} x2={935} y2={660} stroke={AC} strokeWidth={1.4} />
          <line x1={825} y1={660} x2={825} y2={660} stroke={AC} strokeWidth={1.4} />
          <line x1={935} y1={660} x2={1210} y2={242} stroke={AC} strokeWidth={1.4} />
          <text x={752} y={652} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>
          <text x={1200} y={235} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>

          {/* feedback ↔ BELONGS ↔ departments (N:1) */}
          <line x1={640} y1={560} x2={640} y2={455} stroke={AC} strokeWidth={1.4} />
          <line x1={640} y1={405} x2={700} y2={235} stroke={AC} strokeWidth={1.4} />
          <text x={648} y={548} fontSize={11} fontWeight="800" fill="#f59e0b">N</text>
          <text x={706} y={228} fontSize={11} fontWeight="800" fill="#f59e0b">1</text>

          {/* feedback → faculty (N:1 optional) — FK line only, no diamond */}
          <line x1={510} y1={650} x2={280} y2={225} stroke="#6366f1" strokeWidth={1.3} strokeDasharray="6,3" />
          <text x={370} y={430} fontSize={9} fill="#818cf8" fontWeight="600">N : 0..1</text>
          <text x={340} y={442} fontSize={9} fill="#818cf8">(optional FK)</text>

          {/* ════════════════════════════════════ */}
          {/* ATTRIBUTE OVALS — Departments */}
          {/* ════════════════════════════════════ */}
          <Oval cx={610} cy={76} rx={38} ry={14} label="id" isPK />
          <line x1={610} y1={90} x2={640} y2={90} stroke="#60a5fa" strokeWidth={1} />

          <Oval cx={755} cy={76} rx={40} ry={14} label="code" />
          <line x1={755} y1={90} x2={730} y2={90} stroke="#6b7280" strokeWidth={1} />

          {/* ATTRIBUTE OVALS — Feedback (selected key ones) */}
          <Oval cx={480} cy={548} rx={44} ry={14} label="reference_id" />
          <line x1={510} y1={560} x2={510} y2={560} stroke="#6b7280" strokeWidth={1} />

          <Oval cx={630} cy={796} rx={42} ry={14} label="rating_overall" />
          <line x1={640} y1={785} x2={640} y2={785} stroke="#6b7280" strokeWidth={1} />

          <Oval cx={770} cy={796} rx={44} ry={14} label="custom_answers" />

          {/* ════════════════════════════════════ */}
          {/* LEGEND */}
          {/* ════════════════════════════════════ */}
          <rect x={40} y={H - 86} width={500} height={72} rx={6} fill="#1e293b" stroke="#334155" strokeWidth={1} />
          <text x={56} y={H - 70} fontSize={11} fontWeight="800" fill="white">LEGEND — Chen Notation</text>

          <rect x={56} y={H - 60} width={26} height={16} rx={3} fill={EF} stroke="#3b82f6" strokeWidth={1} />
          <text x={88} y={H - 48} fontSize={10} fill="#e2e8f0">Entity (Rectangle)</text>

          <ellipse cx={200} cy={H - 52} rx={28} ry={12} fill={AF} stroke="#6b7280" strokeWidth={1} />
          <text x={234} y={H - 48} fontSize={10} fill="#e2e8f0">Attribute (Oval)</text>

          <ellipse cx={346} cy={H - 52} rx={28} ry={12} fill={EF} stroke="#60a5fa" strokeWidth={1} />
          <text x={346} y={H - 52} textAnchor="middle" fontSize={8} fill="#fbbf24" dominantBaseline="middle" textDecoration="underline">PK</text>
          <text x={380} y={H - 48} fontSize={10} fill="#e2e8f0">Primary Key</text>

          <polygon points={`440,${H - 30} 470,${H - 22} 440,${H - 14} 410,${H - 22}`} fill={RF} stroke="#a78bfa" strokeWidth={1} />
          <text x={476} y={H - 18} fontSize={10} fill="#e2e8f0">Relationship (Diamond)</text>

          <text x={56} y={H - 24} fontSize={10} fill="#f59e0b" fontWeight="700">1, N</text>
          <text x={76} y={H - 20} fontSize={10} fill="#e2e8f0">= Cardinality</text>

          <line x1={200} y1={H - 24} x2={240} y2={H - 24} stroke="#6366f1" strokeWidth={1.3} strokeDasharray="5,3" />
          <text x={248} y={H - 20} fontSize={10} fill="#e2e8f0">Optional FK (dashed)</text>
        </svg>
      </div>
    </div>
  );
}
