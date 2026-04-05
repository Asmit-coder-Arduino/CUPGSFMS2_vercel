import { useRef } from "react";

// ─── Inline SVG renderers (no iframes needed for print) ─────────────────────

function Dfd0Svg() {
  const W = 1100, H = 570;
  const EB = "#1e3a8a", PF = "#14532d", AC = "#475569", TC = "#1e293b", LB = "#dbeafe";
  const Entity = ({ x, y, w, h, label, sub }: any) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5} />
      <text x={x+w/2} y={y+h/2-(sub?6:0)} textAnchor="middle" fontSize={13} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text>
      {sub && <text x={x+w/2} y={y+h/2+10} textAnchor="middle" fontSize={10} fill="#93c5fd" dominantBaseline="middle">{sub}</text>}
    </g>
  );
  const Arr = ({ x1,y1,x2,y2,label,lx,ly }: any) => {
    const mx=lx??(x1+x2)/2, my=ly??(y1+y2)/2, tw=label.length*6.5;
    return <g>
      <defs><marker id={`a${label.slice(0,4)}`} markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill={AC}/></marker></defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={AC} strokeWidth={1.6} markerEnd={`url(#a${label.slice(0,4)})`}/>
      <rect x={mx-tw/2-4} y={my-10} width={tw+8} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={mx} y={my+0.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">{label}</text>
    </g>;
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      <defs><marker id="arr0m" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill={AC}/></marker></defs>
      <rect width={W} height={H} fill="white"/>
      <Entity x={420} y={68} w={260} h={60} label="STUDENT" sub="External Entity"/>
      <Entity x={900} y={220} w={160} h={60} label="HOD" sub="External Entity"/>
      <Entity x={420} y={440} w={260} h={60} label="ADMIN" sub="External Entity"/>
      <Entity x={20} y={220} w={160} h={60} label="FACULTY" sub="External Entity"/>
      <circle cx={550} cy={270} r={115} fill={PF} stroke="#16a34a" strokeWidth={2}/>
      <circle cx={550} cy={270} r={111} fill="none" stroke="#4ade8066" strokeWidth={0.5}/>
      <text x={550} y={252} textAnchor="middle" fontSize={14} fontWeight="800" fill="#86efac" dominantBaseline="middle">0.</text>
      <text x={550} y={270} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">CUPGS Feedback</text>
      <text x={550} y={288} textAnchor="middle" fontSize={12} fill="#86efac" dominantBaseline="middle">Management System</text>
      {/* Flows */}
      <line x1={528} y1={128} x2={528} y2={155} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={350} y={132} width={160} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={430} y={141.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Feedback Submission</text>
      <line x1={572} y1={155} x2={572} y2={128} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={588} y={132} width={160} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={668} y={141.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Submission Confirm</text>
      <line x1={900} y1={244} x2={665} y2={252} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={758} y={236} width={150} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={833} y={245.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Form Template Config</text>
      <line x1={665} y1={268} x2={900} y2={268} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={756} y={272} width={150} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={831} y={281.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Analytics Report / PDF</text>
      <line x1={528} y1={440} x2={528} y2={385} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={350} y={400} width={160} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={430} y={409.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Dept / Course Config</text>
      <line x1={572} y1={385} x2={572} y2={440} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={588} y={400} width={160} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={668} y={409.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Institution Dashboard</text>
      <line x1={180} y1={244} x2={435} y2={252} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={220} y={236} width={150} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={295} y={245.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">View Request / Login</text>
      <line x1={435} y1={268} x2={180} y2={268} stroke={AC} strokeWidth={1.6} markerEnd="url(#arr0m)"/>
      <rect x={220} y={272} width={150} height={18} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.8}/>
      <text x={295} y={281.5} textAnchor="middle" fontSize={10} fill={TC} dominantBaseline="middle">Performance Analytics</text>
      {/* Legend */}
      <rect x={16} y={H-52} width={280} height={46} rx={5} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1}/>
      <text x={28} y={H-38} fontSize={9} fontWeight="700" fill={TC}>LEGEND (Yourdon-Coad)</text>
      <rect x={28} y={H-30} width={18} height={12} rx={2} fill={EB}/><text x={52} y={H-20} fontSize={9} fill={TC}>External Entity</text>
      <circle cx={134} cy={H-24} r={7} fill={PF}/><text x={146} y={H-20} fontSize={9} fill={TC}>Process (Circle)</text>
    </svg>
  );
}

function Dfd1Svg() {
  const W=1480, H=860;
  const EB="#1e3a8a", PF="#14532d", DSF="#451a03", DSB="#92400e", AC="#475569", TC="#1e293b", LB="#dbeafe";
  const E=({x,y,w,h,l,s}:{x:number;y:number;w:number;h:number;l:string;s?:string})=>(
    <g><rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5}/>
    <text x={x+w/2} y={y+h/2-(s?6:0)} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">{l}</text>
    {s&&<text x={x+w/2} y={y+h/2+9} textAnchor="middle" fontSize={9} fill="#93c5fd" dominantBaseline="middle">{s}</text>}</g>
  );
  const P=({cx,cy,r,n,l,s}:{cx:number;cy:number;r:number;n:string;l:string;s?:string})=>(
    <g><circle cx={cx} cy={cy} r={r} fill={PF} stroke="#16a34a" strokeWidth={1.8}/>
    <text x={cx} y={cy-(s?13:5)} textAnchor="middle" fontSize={10} fontWeight="800" fill="#86efac" dominantBaseline="middle">{n}</text>
    <text x={cx} y={cy+(s?2:9)} textAnchor="middle" fontSize={11} fontWeight="700" fill="white" dominantBaseline="middle">{l}</text>
    {s&&<text x={cx} y={cy+17} textAnchor="middle" fontSize={10} fill="#a7f3d0" dominantBaseline="middle">{s}</text>}</g>
  );
  const DS=({x,y,w,n,l}:{x:number;y:number;w:number;n:string;l:string})=>(
    <g><rect x={x} y={y} width={w} height={32} fill={DSF} stroke={DSB} strokeWidth={1.5}/>
    <rect x={x} y={y} width={32} height={32} fill={DSB}/>
    <text x={x+16} y={y+16} textAnchor="middle" fontSize={10} fontWeight="800" fill="white" dominantBaseline="middle">{n}</text>
    <text x={x+32+(w-32)/2} y={y+16} textAnchor="middle" fontSize={11} fontWeight="600" fill="#fcd34d" dominantBaseline="middle">{l}</text></g>
  );
  const A=({x1,y1,x2,y2,lbl,lx,ly,c}:{x1:number;y1:number;x2:number;y2:number;lbl:string;lx?:number;ly?:number;c?:string})=>{
    const mx=lx??(x1+x2)/2, my=ly??(y1+y2)/2, tw=Math.min(lbl.length*6,160);
    return <g>
      <path d={c??`M${x1},${y1}L${x2},${y2}`} stroke={AC} strokeWidth={1.4} fill="none" markerEnd="url(#a1)"/>
      <rect x={mx-tw/2-3} y={my-9} width={tw+6} height={16} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.6}/>
      <text x={mx} y={my+0.5} textAnchor="middle" fontSize={9} fill={TC} dominantBaseline="middle">{lbl}</text>
    </g>;
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      <defs><marker id="a1" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill={AC}/></marker></defs>
      <rect width={W} height={H} fill="white"/>
      <E x={20} y={150} w={130} h={56} l="STUDENT" s="External Entity"/>
      <E x={20} y={490} w={130} h={56} l="FACULTY" s="External Entity"/>
      <E x={1310} y={135} w={145} h={56} l="HOD" s="External Entity"/>
      <E x={1310} y={480} w={145} h={56} l="ADMIN" s="External Entity"/>
      <P cx={410} cy={195} r={68} n="1.0" l="Authentication"/>
      <P cx={410} cy={490} r={68} n="2.0" l="Feedback" s="Collection"/>
      <P cx={740} cy={195} r={68} n="3.0" l="Form Template" s="Management"/>
      <P cx={740} cy={490} r={68} n="4.0" l="Analytics &" s="Reporting"/>
      <P cx={1060} cy={345} r={68} n="5.0" l="Institution" s="Management"/>
      <DS x={70} y={720} w={200} n="D1" l="Feedback"/>
      <DS x={310} y={720} w={195} n="D2" l="Courses"/>
      <DS x={550} y={720} w={195} n="D3" l="Faculty"/>
      <DS x={790} y={720} w={215} n="D4" l="Departments"/>
      <DS x={560} y={72} w={230} n="D5" l="Form Templates"/>
      <DS x={80} y={352} w={215} n="D6" l="Feedback Windows"/>
      <A x1={150} y1={168} x2={342} y2={193} lbl="Login Credentials" lx={244} ly={172}/>
      <A x1={344} y1={212} x2={150} y2={195} lbl="Auth Token" lx={244} ly={210}/>
      <A x1={150} y1={515} x2={342} y2={505} lbl="Feedback Submission" lx={244} ly={503}/>
      <A x1={344} y1={525} x2={150} y2={538} lbl="Ref ID / Confirm" lx={244} ly={538}/>
      <A x1={150} y1={500} x2={364} y2={255} lbl="Login" c="M150,500 C220,380 300,300 364,255" lx={232} ly={375}/>
      <A x1={694} y1={520} x2={150} y2={528} lbl="Performance Report" lx={420} ly={536}/>
      <A x1={1310} y1={158} x2={808} y2={182} lbl="Form Config Request" lx={1056} ly={162}/>
      <A x1={808} y1={202} x2={1310} y2={178} lbl="Template Saved" lx={1056} ly={198}/>
      <A x1={808} y1={475} x2={1310} y2={470} lbl="Dept Analytics / PDF" lx={1056} ly={462}/>
      <A x1={1310} y1={496} x2={1128} y2={376} lbl="Mgmt Request" lx={1234} ly={424}/>
      <A x1={1128} y1={392} x2={1310} y2={516} lbl="System Dashboard" lx={1234} ly={460}/>
      <A x1={410} y1={263} x2={410} y2={422} lbl="Auth Validated" lx={448} ly={342}/>
      <A x1={478} y1={195} x2={672} y2={195} lbl="Auth Check" lx={575} ly={183}/>
      <A x1={470} y1={215} x2={1000} y2={305} lbl="Admin Auth" c="M470,215 C650,230 850,270 1000,305" lx={730} ly={236}/>
      <A x1={740} y1={263} x2={740} y2={422} lbl="Form Config" lx={778} ly={342}/>
      <A x1={380} y1={556} x2={210} y2={720} lbl="Store Feedback" lx={270} ly={630}/>
      <A x1={195} y1={720} x2={368} y2={556} lbl="Feedback Records" lx={254} ly={660}/>
      <A x1={362} y1={464} x2={300} y2={384} lbl="Check Window" lx={318} ly={422}/>
      <A x1={282} y1={384} x2={354} y2={464} lbl="Window Status" lx={298} ly={430}/>
      <A x1={428} y1={556} x2={425} y2={720} lbl="Course Lookup" lx={464} ly={638}/>
      <A x1={442} y1={720} x2={440} y2={556} lbl="Course+Faculty" lx={496} ly={662}/>
      <A x1={730} y1={128} x2={730} y2={104} lbl="Save Template" lx={778} ly={115}/>
      <A x1={750} y1={104} x2={750} y2={128} lbl="Load Template" lx={800} ly={115}/>
      <A x1={714} y1={556} x2={272} y2={720} lbl="Read Feedback" lx={480} ly={650}/>
      <A x1={730} y1={556} x2={510} y2={720} lbl="Read Courses" lx={617} ly={648}/>
      <A x1={746} y1={556} x2={700} y2={720} lbl="Read Faculty" lx={718} ly={645}/>
      <A x1={1034} y1={408} x2={520} y2={720} lbl="Manage Courses" c="M1034,408 C900,550 720,680 520,720" lx={800} ly={590}/>
      <A x1={1042} y1={412} x2={766} y2={720} lbl="Manage Faculty" c="M1042,412 C960,560 870,660 766,720" lx={944} ly={596}/>
      <A x1={1050} y1={414} x2={1008} y2={720} lbl="Manage Depts" lx={1060} ly={567}/>
      {/* Legend */}
      <rect x={20} y={H-52} width={400} height={42} rx={5} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1}/>
      <text x={34} y={H-38} fontSize={9} fontWeight="700" fill={TC}>LEGEND</text>
      <rect x={34} y={H-28} width={18} height={12} rx={2} fill={EB}/><text x={58} y={H-18} fontSize={9} fill={TC}>External Entity</text>
      <circle cx={138} cy={H-22} r={7} fill={PF}/><text x={150} y={H-18} fontSize={9} fill={TC}>Process</text>
      <rect x={210} y={H-28} width={22} height={12} fill={DSB}/><rect x={232} y={H-28} width={60} height={12} fill={DSF}/>
      <text x={298} y={H-18} fontSize={9} fill={TC}>Data Store (Gane-Sarson)</text>
    </svg>
  );
}

function Dfd2Svg() {
  const W=1160, H=730;
  const EB="#1e3a8a", PF="#14532d", DSF="#451a03", DSB="#92400e", AC="#475569", TC="#1e293b", LB="#dbeafe";
  const E=({x,y,w,h,l}:any)=><g><rect x={x} y={y} width={w} height={h} rx={4} fill={EB} stroke="#3b82f6" strokeWidth={1.5}/><text x={x+w/2} y={y+h/2} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">{l}</text></g>;
  const P=({cx,cy,r,n,l,s}:any)=><g><circle cx={cx} cy={cy} r={r} fill={PF} stroke="#16a34a" strokeWidth={1.8}/><text x={cx} y={cy-(s?12:5)} textAnchor="middle" fontSize={10} fontWeight="800" fill="#86efac" dominantBaseline="middle">{n}</text><text x={cx} y={cy+(s?2:8)} textAnchor="middle" fontSize={11} fontWeight="700" fill="white" dominantBaseline="middle">{l}</text>{s&&<text x={cx} y={cy+16} textAnchor="middle" fontSize={10} fill="#a7f3d0" dominantBaseline="middle">{s}</text>}</g>;
  const DS=({x,y,w,n,l}:any)=><g><rect x={x} y={y} width={w} height={30} fill={DSF} stroke={DSB} strokeWidth={1.5}/><rect x={x} y={y} width={30} height={30} fill={DSB}/><text x={x+15} y={y+15} textAnchor="middle" fontSize={9} fontWeight="800" fill="white" dominantBaseline="middle">{n}</text><text x={x+30+(w-30)/2} y={y+15} textAnchor="middle" fontSize={11} fontWeight="600" fill="#fcd34d" dominantBaseline="middle">{l}</text></g>;
  const A=({x1,y1,x2,y2,lbl,lx,ly,c}:any)=>{const mx=lx??(x1+x2)/2, my=ly??(y1+y2)/2, tw=Math.min(lbl.length*5.8,160); return <g><path d={c??`M${x1},${y1}L${x2},${y2}`} stroke={AC} strokeWidth={1.4} fill="none" markerEnd="url(#a2)"/><rect x={mx-tw/2-3} y={my-9} width={tw+6} height={16} rx={3} fill={LB} stroke="#93c5fd" strokeWidth={0.6}/><text x={mx} y={my+0.5} textAnchor="middle" fontSize={9} fill={TC} dominantBaseline="middle">{lbl}</text></g>;};
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      <defs><marker id="a2" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill={AC}/></marker></defs>
      <rect width={W} height={H} fill="white"/>
      <rect x={80} y={68} width={1000} height={510} rx={10} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="8,4}"/>
      <text x={96} y={86} fontSize={10} fill="#16a34a" fontWeight="700">Process 2.0 — Feedback Collection (Expanded)</text>
      <E x={4} y={240} w={110} h={52} l="STUDENT"/>
      <E x={4} y={400} w={110} h={52} l="HOD FORM"/>
      <P cx={295} cy={188} r={64} n="2.1" l="Validate" s="Inputs"/>
      <P cx={295} cy={415} r={64} n="2.2" l="Check" s="Feedback Win."/>
      <P cx={555} cy={300} r={64} n="2.3" l="Profanity" s="Filter"/>
      <P cx={800} cy={188} r={64} n="2.4" l="Course-Faculty" s="Integrity"/>
      <P cx={800} cy={415} r={64} n="2.5" l="Generate" s="Reference ID"/>
      <P cx={1040} cy={300} r={64} n="2.6" l="Store" s="Feedback"/>
      <DS x={195} y={640} w={185} n="D2" l="Courses"/>
      <DS x={420} y={640} w={190} n="D3" l="Faculty"/>
      <DS x={650} y={640} w={210} n="D6" l="Feedback Windows"/>
      <DS x={860} y={640} w={185} n="D1" l="Feedback"/>
      <A x1={114} y1={256} x2={232} y2={204} lbl="Raw Feedback Data" lx={170} ly={222}/>
      <A x1={114} y1={420} x2={232} y2={408} lbl="Form Template" lx={168} ly={406}/>
      <A x1={359} y1={200} x2={492} y2={276} lbl="Validated Fields" lx={420} ly={228}/>
      <A x1={295} y1={351} x2={295} y2={252} lbl="Window Open" lx={330} ly={302}/>
      <A x1={710} y1={640} x2={354} y2={478} lbl="Window Status" c="M710,640 C590,620 440,560 354,478" lx={535} ly={615}/>
      <A x1={330} y1={478} x2={690} y2={640} lbl="Window Query" c="M330,478 C440,580 590,630 690,640" lx={472} ly={580}/>
      <A x1={620} y1={276} x2={738} y2={208} lbl="Filtered Content" lx={676} ly={234}/>
      <A x1={620} y1={322} x2={738} y2={400} lbl="Text Fields OK" lx={676} ly={366}/>
      <A x1={350} y1={640} x2={766} y2={252} lbl="Course Record" c="M350,640 C380,480 630,340 766,252" lx={460} ly={480}/>
      <A x1={560} y1={640} x2={790} y2={252} lbl="Faculty Record" c="M560,640 C650,480 760,360 790,252" lx={660} ly={495}/>
      <A x1={864} y1={200} x2={976} y2={268} lbl="Integrity Passed" lx={916} ly={228}/>
      <A x1={864} y1={408} x2={976} y2={338} lbl="Reference ID" lx={920} ly={365}/>
      <A x1={1040} y1={364} x2={980} y2={640} lbl="Feedback Record" lx={1038} ly={508}/>
      <A x1={976} y1={290} x2={114} y2={278} lbl="Confirmed + Ref ID" c="M976,290 C800,228 300,222 114,272" lx={540} ly={216}/>
    </svg>
  );
}

function ErSvg() {
  const W=1480, H=940;
  const EF="#1e3a8a", AF="#374151", RF="#7c3aed", TC="#1e293b", AC="#475569";
  const Ent=({x,y,w,h,name,pk,attrs}:{x:number;y:number;w:number;h:number;name:string;pk:string;attrs:string[]})=>(
    <g><rect x={x} y={y} width={w} height={h} rx={6} fill={EF} stroke="#3b82f6" strokeWidth={2}/>
    <rect x={x} y={y} width={w} height={30} rx={6} fill="#1d4ed8"/><rect x={x} y={y+22} width={w} height={8} fill="#1d4ed8}"/>
    <text x={x+w/2} y={y+18} textAnchor="middle" fontSize={12} fontWeight="800" fill="white" dominantBaseline="middle">{name}</text>
    <text x={x+8} y={y+42} fontSize={9} fill="#fbbf24" fontWeight="700" dominantBaseline="middle">PK  {pk}</text>
    <line x1={x+4} y1={y+50} x2={x+w-4} y2={y+50} stroke="#3b82f6" strokeWidth={0.5}/>
    {attrs.map((a,i)=><text key={i} x={x+8} y={y+60+i*14} fontSize={9} fill="#e2e8f0" dominantBaseline="middle">{a}</text>)}</g>
  );
  const Dia=({cx,cy,w,h,label}:{cx:number;cy:number;w:number;h:number;label:string})=>{
    const pts=`${cx},${cy-h/2} ${cx+w/2},${cy} ${cx},${cy+h/2} ${cx-w/2},${cy}`;
    return <g><polygon points={pts} fill={RF} stroke="#a78bfa" strokeWidth={1.5}/><text x={cx} y={cy} textAnchor="middle" fontSize={9} fontWeight="700" fill="white" dominantBaseline="middle">{label}</text></g>;
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto"}}>
      <rect width={W} height={H} fill="#0f172a"/>
      {/* Entities */}
      <Ent x={570} y={82} w={210} h={136} name="DEPARTMENTS" pk="id (serial)" attrs={["code (varchar) UNIQUE","name (varchar)","hod_name (varchar)","hod_employee_id (varchar)","created_at (timestamptz)"]}/>
      <Ent x={1060} y={72} w={200} h={148} name="COURSES" pk="id (serial)" attrs={["code (varchar) UNIQUE","name (varchar)","department_id (FK)","faculty_id (FK nullable)","semester (int)","academic_year (varchar)","credits (int)"]}/>
      <Ent x={60} y={72} w={210} h={134} name="FACULTY" pk="id (serial)" attrs={["employee_id (varchar) UNIQUE","name (varchar)","designation (varchar)","email (varchar)","phone (varchar)","department_id (FK)"]}/>
      <Ent x={490} y={545} w={240} h={250} name="FEEDBACK" pk="id (serial)" attrs={["reference_id UNIQUE","course_id (FK)","faculty_id (FK nullable)","department_id (FK)","semester, academic_year","student_year, section","feedback_type","rating_course_content (real)","rating_teaching_quality (real)","rating_lab_facilities (real)","rating_study_material (real)","rating_overall (real)","comments (text)","is_anonymous (boolean)","custom_answers (jsonb)"]}/>
      <Ent x={1060} y={545} w={220} h={92} name="FORM_TEMPLATES" pk="id (serial)" attrs={["department_id (FK) UNIQUE","fields (jsonb)","created_at / updated_at"]}/>
      <Ent x={60} y={545} w={220} h={118} name="FEEDBACK_WINDOWS" pk="id (serial)" attrs={["title (varchar)","department_id (FK nullable)","is_active (boolean)","start_date (timestamptz)","end_date (timestamptz)"]}/>
      {/* Relationship Diamonds */}
      <Dia cx={850} cy={148} w={100} h={46} label="OFFERS"/>
      <Dia cx={330} cy={148} w={110} h={46} label="EMPLOYS"/>
      <Dia cx={850} cy={420} w={110} h={46} label="TEACHES"/>
      <Dia cx={1170} cy={380} w={110} h={46} label="HAS FORM"/>
      <Dia cx={330} cy={420} w={100} h={46} label="SCOPES"/>
      <Dia cx={850} cy={648} w={80} h={40} label="FOR"/>
      <Dia cx={620} cy={420} w={100} h={46} label="BELONGS"/>
      {/* Relationship Lines */}
      <line x1={780} y1={148} x2={800} y2={148} stroke={AC} strokeWidth={1.3}/>
      <line x1={800} y1={148} x2={900} y2={148} stroke={AC} strokeWidth={1.3}/>
      <line x1={900} y1={148} x2={1060} y2={148} stroke={AC} strokeWidth={1.3}/>
      <text x={794} y={140} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <text x={1048} y={140} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <line x1={570} y1={148} x2={385} y2={148} stroke={AC} strokeWidth={1.3}/>
      <line x1={275} y1={148} x2={270} y2={148} stroke={AC} strokeWidth={1.3}/>
      <line x1={270} y1={148} x2={60} y2={148} stroke={AC} strokeWidth={1.3} markerEnd="url(#ae)"/>
      <text x={548} y={140} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <text x={66} y={140} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <line x1={270} y1={206} x2={270} y2={420} stroke={AC} strokeWidth={1.3}/>
      <line x1={270} y1={420} x2={800} y2={420} stroke={AC} strokeWidth={1.3}/>
      <line x1={900} y1={420} x2={1160} y2={278} stroke={AC} strokeWidth={1.3}/>
      <text x={280} y={425} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <text x={1148} y={272} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <line x1={780} y1={196} x2={1170} y2={196} stroke={AC} strokeWidth={1.3}/>
      <line x1={1170} y1={196} x2={1170} y2={357} stroke={AC} strokeWidth={1.3}/>
      <line x1={1170} y1={403} x2={1170} y2={545} stroke={AC} strokeWidth={1.3}/>
      <text x={796} y={188} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <text x={1178} y={540} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <line x1={570} y1={192} x2={330} y2={192} stroke={AC} strokeWidth={1.3}/>
      <line x1={330} y1={192} x2={330} y2={397} stroke={AC} strokeWidth={1.3}/>
      <line x1={330} y1={443} x2={180} y2={545} stroke={AC} strokeWidth={1.3}/>
      <text x={546} y={184} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <text x={176} y={540} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <line x1={730} y1={648} x2={810} y2={648} stroke={AC} strokeWidth={1.3}/>
      <line x1={890} y1={648} x2={1160} y2={230} stroke={AC} strokeWidth={1.3}/>
      <text x={712} y={640} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <text x={1148} y={224} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <line x1={620} y1={545} x2={620} y2={443} stroke={AC} strokeWidth={1.3}/>
      <line x1={620} y1={397} x2={680} y2={218} stroke={AC} strokeWidth={1.3}/>
      <text x={628} y={534} fontSize={10} fontWeight="800" fill="#f59e0b">N</text>
      <text x={688} y={212} fontSize={10} fontWeight="800" fill="#f59e0b">1</text>
      <line x1={490} y1={640} x2={270} y2={216} stroke="#6366f1" strokeWidth={1.2} strokeDasharray="6,3"/>
      <text x={355} y={418} fontSize={9} fill="#818cf8">N : 0..1 (opt. FK)</text>
      <defs><marker id="ae" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill={AC}/></marker></defs>
      {/* Legend */}
      <rect x={20} y={H-54} width={480} height={44} rx={5} fill="#1e293b" stroke="#334155" strokeWidth={1}/>
      <text x={34} y={H-39} fontSize={10} fontWeight="800" fill="white">LEGEND — Chen Notation</text>
      <rect x={34} y={H-28} width={20} height={13} rx={3} fill={EF} stroke="#3b82f6" strokeWidth={1}/><text x={60} y={H-18} fontSize={9} fill="#e2e8f0">Entity</text>
      <ellipse cx={120} cy={H-21} rx={26} ry={11} fill={AF} stroke="#6b7280" strokeWidth={1}/><text x={152} y={H-18} fontSize={9} fill="#e2e8f0">Attribute</text>
      <polygon points={`220,${H-14} 244,${H-21} 220,${H-28} 196,${H-21}`} fill={RF} stroke="#a78bfa" strokeWidth={1}/><text x={252} y={H-18} fontSize={9} fill="#e2e8f0">Relationship</text>
      <text x={336} y={H-20} fontSize={10} fill="#f59e0b" fontWeight="700">1, N</text><text x={356} y={H-18} fontSize={9} fill="#e2e8f0">= Cardinality</text>
      <line x1={420} y1={H-21} x2={450} y2={H-21} stroke="#6366f1" strokeWidth={1.2} strokeDasharray="5,3"/><text x={456} y={H-18} fontSize={9} fill="#e2e8f0">Optional FK</text>
    </svg>
  );
}

// ─── Main Export Page ────────────────────────────────────────────────────────
export function AllDiagramsPdf() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .page-break { page-break-after: always; break-after: page; }
          .diagram-page { padding: 12mm; }
          @page { size: A3 landscape; margin: 8mm; }
        }
        @media screen {
          body { background: #e2e8f0; }
          .diagram-page {
            background: white;
            margin: 20px auto;
            padding: 32px 24px;
            max-width: 1560px;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          }
        }
        .page-title { font-family: sans-serif; font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .page-subtitle { font-family: sans-serif; font-size: 12px; color: #64748b; margin-bottom: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
        svg text { font-family: sans-serif; }
      `}</style>

      {/* Print Button */}
      <div className="no-print" style={{ position:"fixed", top:20, right:20, zIndex:9999, display:"flex", gap:10 }}>
        <button onClick={handlePrint} style={{
          background:"#1d4ed8", color:"white", border:"none", borderRadius:8,
          padding:"12px 28px", fontSize:15, fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 12px rgba(29,78,216,0.4)", fontFamily:"sans-serif"
        }}>
          🖨️ Print / Save as PDF
        </button>
        <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontSize:12,color:"#64748b",fontFamily:"sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
          In print dialog → select <b>Save as PDF</b> → Paper: <b>A3 Landscape</b>
        </div>
      </div>

      <div ref={containerRef}>
        {/* Page 1 — DFD Level 0 */}
        <div className="diagram-page page-break">
          <div className="page-title">DFD Level 0 — Context Diagram</div>
          <div className="page-subtitle">CUPGS Academic Feedback Management System · Yourdon-Coad Notation · Page 1 of 4</div>
          <Dfd0Svg />
        </div>

        {/* Page 2 — DFD Level 1 */}
        <div className="diagram-page page-break">
          <div className="page-title">DFD Level 1 — Functional Decomposition</div>
          <div className="page-subtitle">All Sub-Systems with Data Stores & Flows · Yourdon-Coad + Gane-Sarson · Page 2 of 4</div>
          <Dfd1Svg />
        </div>

        {/* Page 3 — DFD Level 2 */}
        <div className="diagram-page page-break">
          <div className="page-title">DFD Level 2 — Process 2.0 Explosion (Feedback Collection)</div>
          <div className="page-subtitle">Internal Sub-Processes of Feedback Collection · Yourdon-Coad Notation · Page 3 of 4</div>
          <Dfd2Svg />
        </div>

        {/* Page 4 — ER Diagram */}
        <div className="diagram-page">
          <div className="page-title" style={{color:"white",background:"#0f172a",padding:"10px 14px",borderRadius:6}}>ER Diagram — Entity Relationship Diagram</div>
          <div className="page-subtitle">Complete Database Schema · Chen Notation · Page 4 of 4</div>
          <ErSvg />
        </div>
      </div>
    </>
  );
}
