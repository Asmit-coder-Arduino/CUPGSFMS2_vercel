import { db } from "./index";
import {
  departmentsTable,
  facultyTable,
  coursesTable,
} from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seeding BPUT CUPGS database from website data...");

  // ─── STEP 1: DEPARTMENTS ─────────────────────────────────────────────────
  console.log("\n📚 Inserting departments...");

  const deptData = [
    {
      code: "CSE",
      name: "Computer Science & Engineering",
      hodName: "Dr. Debashreet Das",
      hodEmployeeId: "HOD/CSE/001",
      hodPin: "HD4X7A",
    },
    {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      hodName: "Dr. Prakash Kumar Panda",
      hodEmployeeId: "HOD/ECE/001",
      hodPin: "HD8Y3B",
    },
    {
      code: "EE",
      name: "Electrical Engineering",
      hodName: "Dr. Manas Ranjan Nayak",
      hodEmployeeId: "HOD/EE/001",
      hodPin: "HD2Z6C",
    },
    {
      code: "ME",
      name: "Mechanical Engineering",
      hodName: "Dr. Atal Bihari Harichandan",
      hodEmployeeId: "HOD/ME/001",
      hodPin: "HD6W9D",
    },
    {
      code: "CE",
      name: "Civil Engineering",
      hodName: "Dr. Bibhuti Bhusan Mukharjee",
      hodEmployeeId: "HOD/CE/001",
      hodPin: "HD3V5E",
    },
  ];

  const insertedDepts: Record<string, number> = {};
  for (const dept of deptData) {
    const [existing] = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.code, dept.code));
    if (existing) {
      await db
        .update(departmentsTable)
        .set(dept)
        .where(eq(departmentsTable.id, existing.id));
      insertedDepts[dept.code] = existing.id;
      console.log(`  ✏️  Updated: ${dept.code} - ${dept.name}`);
    } else {
      const [inserted] = await db
        .insert(departmentsTable)
        .values(dept)
        .returning({ id: departmentsTable.id });
      insertedDepts[dept.code] = inserted.id;
      console.log(`  ✅ Inserted: ${dept.code} - ${dept.name}`);
    }
  }

  // ─── STEP 2: FACULTY ─────────────────────────────────────────────────────
  console.log("\n👩‍🏫 Inserting faculty...");

  const facultyData = [
    // CSE Department — source: bput.ac.in/faculties-cse.php
    {
      name: "Dr. Debashreet Das",
      designation: "Associate Professor",
      departmentCode: "CSE",
      employeeId: "CUPGS/CSE/001",
      loginPin: "FP7K2M",
      qualification: "B.E.(I.T.), M.Tech(CSE), PhD(CSE)",
      specialization: "Data Structures & Algorithms",
      photoUrl: "https://www.bput.ac.in/images/faculty/Debashreet-Das.jpg",
    },
    {
      name: "Dr. Pradip Kumar Sahu",
      designation: "Professor",
      departmentCode: "CSE",
      employeeId: "CUPGS/CSE/002",
      loginPin: "FP3N8Q",
      qualification: "B.E., M.E., Ph.D.",
      specialization:
        "Embedded Systems, VLSI, Network-on-Chip, Cloud Computing, Image Processing",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_cb5f5443640592634bf3865a64515ced.jpg",
    },
    {
      name: "Dr. Sumitra Kisan",
      designation: "Professor",
      departmentCode: "CSE",
      employeeId: "CUPGS/CSE/003",
      loginPin: "FP9R4W",
      qualification: "B.Tech, M.Tech, Ph.D.",
      specialization:
        "Cryptography & Network Security, Fractal Analysis, Pattern Recognition, Steganography",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_d9dc7fda64e62046401193fa2f7c0730.jpg",
    },
    {
      name: "Shiba Prasad Dash",
      designation: "Assistant Professor",
      departmentCode: "CSE",
      employeeId: "CUPGS/CSE/004",
      loginPin: "FP5T6X",
      qualification: "B.Tech, M.Tech",
      specialization: "Data Structures & Algorithms",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1473675614.jpg",
    },
    {
      name: "Dr. D Chandrasekhar Rao",
      designation: "Associate Professor",
      departmentCode: "CSE",
      employeeId: "CUPGS/CSE/005",
      loginPin: "FP2V8Y",
      qualification: "B.Tech, M.Tech, Ph.D.",
      specialization: "Computer Science & Engineering",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_11072024csecsrao.jpg",
    },

    // ECE Department — source: bput.ac.in/faculties-ece.php
    {
      name: "Dr. Prakash Kumar Panda",
      designation: "Associate Professor",
      departmentCode: "ECE",
      employeeId: "CUPGS/ECE/001",
      loginPin: "FP4A7D",
      qualification: "M.Tech, Ph.D.",
      specialization: "Electronics & Communication Engineering",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr-Prakash-Kumar-Panda.jpg",
    },
    {
      name: "Dr. Bikramaditya Das",
      designation: "Associate Professor",
      departmentCode: "ECE",
      employeeId: "CUPGS/ECE/002",
      loginPin: "FP6B3G",
      qualification: "Ph.D., M.Tech, B.Tech",
      specialization:
        "Wireless Communication, Adaptive Control, Control of Underwater Vehicles, Robotics",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr-Bikramaditya-Das.jpg",
    },
    {
      name: "Dr. Ashish Kumar Padhan",
      designation: "Assistant Professor",
      departmentCode: "ECE",
      employeeId: "CUPGS/ECE/003",
      loginPin: "FP8C5H",
      qualification: "Ph.D., M.Tech",
      specialization: "Electronics & Communication Engineering",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr-Ashish-Kumar-Padhan.jpg",
    },

    // EE Department — source: bput.ac.in/faculties-EE.php
    {
      name: "Dr. Manas Ranjan Nayak",
      designation: "Professor",
      departmentCode: "EE",
      employeeId: "CUPGS/EE/001",
      loginPin: "FP1E9J",
      qualification: "Ph.D., M.E., B.E.",
      specialization:
        "Renewable Energy Integration, Energy Storage, Electric Vehicle, Smart Grid",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1553404001.jpg",
    },
    {
      name: "Dr. Sivkumar Mishra",
      designation: "Professor",
      departmentCode: "EE",
      employeeId: "CUPGS/EE/002",
      loginPin: "FP7F2L",
      qualification: "Ph.D., M.Tech, B.E.",
      specialization:
        "Power Distribution System, Distributed Generation, Micro Grids, Soft Computing in Power Systems",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1553764269.jpg",
    },
    {
      name: "Dr. Manoj Kumar Sahu",
      designation: "Associate Professor",
      departmentCode: "EE",
      employeeId: "CUPGS/EE/003",
      loginPin: "FP3G6N",
      qualification: "B.E., M.Tech, Ph.D.",
      specialization: "Power Electronics & Electrical Drives, Renewable Energy Systems",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1473767496.jpg",
    },
    {
      name: "Dr. Saswata Satpathi",
      designation: "Assistant Professor",
      departmentCode: "EE",
      employeeId: "CUPGS/EE/004",
      loginPin: "FP9H4P",
      qualification: "Ph.D.",
      specialization: "Electrical Engineering",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr.SaswataSatpathi-EE.jpg",
    },

    // ME Department — source: bput.ac.in/faculties-mech.php
    {
      name: "Dr. Atal Bihari Harichandan",
      designation: "Associate Professor",
      departmentCode: "ME",
      employeeId: "CUPGS/ME/001",
      loginPin: "FP5K8R",
      qualification: "B.E., M.Tech, Ph.D.",
      specialization:
        "Computational Fluid Dynamics, Aerodynamics, Gas Dynamics, Carbon Capture, Aeroacoustics",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr-Atal-Bihari-Harichandan.jpg",
    },
    {
      name: "Dr. Nirmal Kumar Kund",
      designation: "Professor",
      departmentCode: "ME",
      employeeId: "CUPGS/ME/002",
      loginPin: "FP2L3S",
      qualification: "Ph.D., M.Tech., B.Tech.",
      specialization:
        "Alloys & Composites, Casting & Solidification, CFD, Semisolid Materials Processing",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_aef8a66974b2bbc95e670bf6df07a6b3.jpg",
    },
    {
      name: "Dr. Pradeep Kumar Mishra",
      designation: "Associate Professor",
      departmentCode: "ME",
      employeeId: "CUPGS/ME/003",
      loginPin: "FP6M7T",
      qualification: "B.E., M.Tech, Ph.D.",
      specialization: "Mechanics of Materials, Applied Thermodynamics",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1550899236.bmp",
    },

    // CE Department — source: bput.ac.in/faculties-civil.php
    {
      name: "Dr. Bibhuti Bhusan Mukharjee",
      designation: "Associate Professor",
      departmentCode: "CE",
      employeeId: "CUPGS/CE/001",
      loginPin: "FP4N9U",
      qualification: "B.E., M.Tech, Ph.D.",
      specialization: "Concrete Technology, Sustainable Materials and Technologies",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1545273815.jpg",
    },
    {
      name: "Dr. Madhusmita Biswal",
      designation: "Assistant Professor",
      departmentCode: "CE",
      employeeId: "CUPGS/CE/002",
      loginPin: "FP8P2V",
      qualification: "B.Tech, M.Tech, Ph.D.",
      specialization:
        "Structural Dynamics, Composite Structures, Vibration and Stability of Plates & Shells",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/faculty_1545361720.jpg",
    },
    {
      name: "Dr. Bharadwaj Nanda",
      designation: "Associate Professor",
      departmentCode: "CE",
      employeeId: "CUPGS/CE/003",
      loginPin: "FP1Q5W",
      qualification: "B.Tech, M.Tech, Ph.D.",
      specialization: "Building Engineering, Construction Technology",
      photoUrl:
        "https://www.bput.ac.in/images/faculty/Dr.Bharadwaj-Nanda.jpg",
    },
  ];

  const insertedFaculty: Record<string, number> = {};
  for (const f of facultyData) {
    const deptId = insertedDepts[f.departmentCode];
    const { departmentCode, ...rest } = f;
    const payload = { ...rest, departmentId: deptId };
    const [existing] = await db
      .select()
      .from(facultyTable)
      .where(eq(facultyTable.employeeId, f.employeeId));
    if (existing) {
      await db
        .update(facultyTable)
        .set(payload)
        .where(eq(facultyTable.id, existing.id));
      insertedFaculty[f.employeeId] = existing.id;
      console.log(`  ✏️  Updated: ${f.name} (${f.designation}, ${f.departmentCode})`);
    } else {
      const [inserted] = await db
        .insert(facultyTable)
        .values(payload)
        .returning({ id: facultyTable.id });
      insertedFaculty[f.employeeId] = inserted.id;
      console.log(`  ✅ Inserted: ${f.name} (${f.designation}, ${f.departmentCode})`);
    }
  }

  // ─── STEP 3: COURSES ─────────────────────────────────────────────────────
  console.log("\n📖 Inserting courses (BPUT B.Tech syllabus 2025-26)...");

  const AY = "2025-26";

  const coursesData = [
    // ── CSE ─────────────────────────────────────────────────────────────────
    // Dr. Debashreet Das — Data Structures & Algorithms focus
    {
      code: "CS301",
      name: "Data Structures & Algorithms",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/001",
      semester: 3,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CS401",
      name: "Design & Analysis of Algorithms",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/001",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CS601",
      name: "Machine Learning",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/001",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Pradip Kumar Sahu — Embedded Systems / Cloud
    {
      code: "CS501",
      name: "Cloud Computing",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/002",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CS404",
      name: "Computer Networks",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/002",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CS701",
      name: "Internet of Things",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/002",
      semester: 7,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Sumitra Kisan — Cryptography / Security
    {
      code: "CS502",
      name: "Cryptography & Network Security",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/003",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CS303",
      name: "Theory of Computation",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/003",
      semester: 3,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CS702",
      name: "Information Security",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/003",
      semester: 7,
      academicYear: AY,
      credits: 3,
    },
    // Shiba Prasad Dash — Programming / OOP
    {
      code: "CS101",
      name: "Programming in C",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/004",
      semester: 1,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CS201",
      name: "Object Oriented Programming (Java)",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/004",
      semester: 2,
      academicYear: AY,
      credits: 4,
    },
    // Dr. D Chandrasekhar Rao — DBMS / Software
    {
      code: "CS403",
      name: "Database Management Systems",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/005",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CS503",
      name: "Software Engineering",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/005",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CS602",
      name: "Web Technology",
      deptCode: "CSE",
      employeeId: "CUPGS/CSE/005",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },

    // ── ECE ─────────────────────────────────────────────────────────────────
    // Dr. Prakash Kumar Panda — DSP / EM Theory
    {
      code: "EC401",
      name: "Digital Signal Processing",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/001",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EC301",
      name: "Electromagnetic Theory",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/001",
      semester: 3,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "EC501",
      name: "VLSI Design",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/001",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Bikramaditya Das — Wireless / Robotics / Control
    {
      code: "EC502",
      name: "Wireless Communication",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/002",
      semester: 5,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EC402",
      name: "Control Systems",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/002",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EC601",
      name: "Robotics & Automation",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/002",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Ashish Kumar Padhan — Analog / Digital Electronics
    {
      code: "EC201",
      name: "Analog Electronics",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/003",
      semester: 2,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EC302",
      name: "Digital Electronics",
      deptCode: "ECE",
      employeeId: "CUPGS/ECE/003",
      semester: 3,
      academicYear: AY,
      credits: 4,
    },

    // ── EE ──────────────────────────────────────────────────────────────────
    // Dr. Manas Ranjan Nayak — Renewable Energy / EV
    {
      code: "EE501",
      name: "Renewable Energy Systems",
      deptCode: "EE",
      employeeId: "CUPGS/EE/001",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "EE601",
      name: "Electric Vehicles & Energy Management",
      deptCode: "EE",
      employeeId: "CUPGS/EE/001",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "EE401",
      name: "Power Systems Analysis",
      deptCode: "EE",
      employeeId: "CUPGS/EE/001",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    // Dr. Sivkumar Mishra — Smart Grid / Distribution
    {
      code: "EE602",
      name: "Smart Grid Technologies",
      deptCode: "EE",
      employeeId: "CUPGS/EE/002",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "EE502",
      name: "Power Distribution System",
      deptCode: "EE",
      employeeId: "CUPGS/EE/002",
      semester: 5,
      academicYear: AY,
      credits: 4,
    },
    // Dr. Manoj Kumar Sahu — Power Electronics / Drives
    {
      code: "EE403",
      name: "Power Electronics",
      deptCode: "EE",
      employeeId: "CUPGS/EE/003",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EE503",
      name: "Electrical Drives",
      deptCode: "EE",
      employeeId: "CUPGS/EE/003",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Saswata Satpathi — Electrical Machines / Circuit
    {
      code: "EE301",
      name: "Electrical Machines",
      deptCode: "EE",
      employeeId: "CUPGS/EE/004",
      semester: 3,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "EE201",
      name: "Circuit Theory & Networks",
      deptCode: "EE",
      employeeId: "CUPGS/EE/004",
      semester: 2,
      academicYear: AY,
      credits: 4,
    },

    // ── ME ──────────────────────────────────────────────────────────────────
    // Dr. Atal Bihari Harichandan — CFD / Aerodynamics
    {
      code: "ME501",
      name: "Computational Fluid Dynamics",
      deptCode: "ME",
      employeeId: "CUPGS/ME/001",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "ME401",
      name: "Fluid Mechanics",
      deptCode: "ME",
      employeeId: "CUPGS/ME/001",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "ME601",
      name: "Gas Dynamics & Aerodynamics",
      deptCode: "ME",
      employeeId: "CUPGS/ME/001",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Nirmal Kumar Kund — Materials / Manufacturing
    {
      code: "ME301",
      name: "Materials Science & Engineering",
      deptCode: "ME",
      employeeId: "CUPGS/ME/002",
      semester: 3,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "ME402",
      name: "Manufacturing Technology",
      deptCode: "ME",
      employeeId: "CUPGS/ME/002",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "ME502",
      name: "Casting, Forming & Welding",
      deptCode: "ME",
      employeeId: "CUPGS/ME/002",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Pradeep Kumar Mishra — Mechanics / Thermodynamics
    {
      code: "ME201",
      name: "Engineering Mechanics",
      deptCode: "ME",
      employeeId: "CUPGS/ME/003",
      semester: 2,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "ME302",
      name: "Applied Thermodynamics",
      deptCode: "ME",
      employeeId: "CUPGS/ME/003",
      semester: 3,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "ME403",
      name: "Mechanics of Materials",
      deptCode: "ME",
      employeeId: "CUPGS/ME/003",
      semester: 4,
      academicYear: AY,
      credits: 3,
    },

    // ── CE ──────────────────────────────────────────────────────────────────
    // Dr. Bibhuti Bhusan Mukharjee — Concrete / Structural
    {
      code: "CE501",
      name: "Concrete Technology",
      deptCode: "CE",
      employeeId: "CUPGS/CE/001",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CE401",
      name: "Structural Analysis",
      deptCode: "CE",
      employeeId: "CUPGS/CE/001",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CE601",
      name: "Design of RCC Structures",
      deptCode: "CE",
      employeeId: "CUPGS/CE/001",
      semester: 6,
      academicYear: AY,
      credits: 4,
    },
    // Dr. Madhusmita Biswal — Structural Dynamics / Vibration
    {
      code: "CE502",
      name: "Structural Dynamics",
      deptCode: "CE",
      employeeId: "CUPGS/CE/002",
      semester: 5,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CE301",
      name: "Mechanics of Structures",
      deptCode: "CE",
      employeeId: "CUPGS/CE/002",
      semester: 3,
      academicYear: AY,
      credits: 4,
    },
    {
      code: "CE602",
      name: "Composite Materials in Civil Engineering",
      deptCode: "CE",
      employeeId: "CUPGS/CE/002",
      semester: 6,
      academicYear: AY,
      credits: 3,
    },
    // Dr. Bharadwaj Nanda — Building Engineering / Construction
    {
      code: "CE201",
      name: "Building Materials & Construction",
      deptCode: "CE",
      employeeId: "CUPGS/CE/003",
      semester: 2,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CE302",
      name: "Surveying & Geomatics",
      deptCode: "CE",
      employeeId: "CUPGS/CE/003",
      semester: 3,
      academicYear: AY,
      credits: 3,
    },
    {
      code: "CE402",
      name: "Geotechnical Engineering",
      deptCode: "CE",
      employeeId: "CUPGS/CE/003",
      semester: 4,
      academicYear: AY,
      credits: 4,
    },
  ];

  for (const c of coursesData) {
    const deptId = insertedDepts[c.deptCode];
    const facultyId = insertedFaculty[c.employeeId];
    const { deptCode, employeeId, ...rest } = c;
    const payload = { ...rest, departmentId: deptId, facultyId };

    const [existing] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.code, c.code));
    if (existing) {
      await db
        .update(coursesTable)
        .set(payload)
        .where(eq(coursesTable.id, existing.id));
      console.log(`  ✏️  Updated: [${c.code}] ${c.name}`);
    } else {
      await db.insert(coursesTable).values(payload);
      console.log(`  ✅ Inserted: [${c.code}] ${c.name}`);
    }
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Departments : ${deptData.length}`);
  console.log(`   Faculty     : ${facultyData.length}`);
  console.log(`   Courses     : ${coursesData.length}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
