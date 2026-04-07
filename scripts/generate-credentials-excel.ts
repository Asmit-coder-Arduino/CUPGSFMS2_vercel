import ExcelJS from "exceljs";
import path from "path";

const FACULTY_CREDENTIALS = [
  { name: "Dr. Debashreet Das", dept: "CSE", designation: "Associate Professor", employeeId: "CUPGS/CSE/001", pin: "FP7K2M" },
  { name: "Dr. Pradip Kumar Sahu", dept: "CSE", designation: "Professor", employeeId: "CUPGS/CSE/002", pin: "FP3N8Q" },
  { name: "Dr. Sumitra Kisan", dept: "CSE", designation: "Professor", employeeId: "CUPGS/CSE/003", pin: "FP9R4W" },
  { name: "Shiba Prasad Dash", dept: "CSE", designation: "Assistant Professor", employeeId: "CUPGS/CSE/004", pin: "FP5T6X" },
  { name: "Dr. D Chandrasekhar Rao", dept: "CSE", designation: "Associate Professor", employeeId: "CUPGS/CSE/005", pin: "FP2V8Y" },
  { name: "Dr. Prakash Kumar Panda", dept: "ECE", designation: "Associate Professor", employeeId: "CUPGS/ECE/001", pin: "FP4A7D" },
  { name: "Dr. Bikramaditya Das", dept: "ECE", designation: "Associate Professor", employeeId: "CUPGS/ECE/002", pin: "FP6B3G" },
  { name: "Dr. Ashish Kumar Padhan", dept: "ECE", designation: "Assistant Professor", employeeId: "CUPGS/ECE/003", pin: "FP8C5H" },
  { name: "Dr. Manas Ranjan Nayak", dept: "EE", designation: "Professor", employeeId: "CUPGS/EE/001", pin: "FP1E9J" },
  { name: "Dr. Sivkumar Mishra", dept: "EE", designation: "Professor", employeeId: "CUPGS/EE/002", pin: "FP7F2L" },
  { name: "Dr. Manoj Kumar Sahu", dept: "EE", designation: "Associate Professor", employeeId: "CUPGS/EE/003", pin: "FP3G6N" },
  { name: "Dr. Saswata Satpathi", dept: "EE", designation: "Assistant Professor", employeeId: "CUPGS/EE/004", pin: "FP9H4P" },
  { name: "Dr. Atal Bihari Harichandan", dept: "ME", designation: "Associate Professor", employeeId: "CUPGS/ME/001", pin: "FP5K8R" },
  { name: "Dr. Nirmal Kumar Kund", dept: "ME", designation: "Professor", employeeId: "CUPGS/ME/002", pin: "FP2L3S" },
  { name: "Dr. Pradeep Kumar Mishra", dept: "ME", designation: "Associate Professor", employeeId: "CUPGS/ME/003", pin: "FP6M7T" },
  { name: "Dr. Bibhuti Bhusan Mukharjee", dept: "CE", designation: "Associate Professor", employeeId: "CUPGS/CE/001", pin: "FP4N9U" },
  { name: "Dr. Madhusmita Biswal", dept: "CE", designation: "Assistant Professor", employeeId: "CUPGS/CE/002", pin: "FP8P2V" },
  { name: "Dr. Bharadwaj Nanda", dept: "CE", designation: "Associate Professor", employeeId: "CUPGS/CE/003", pin: "FP1Q5W" },
];

const HOD_CREDENTIALS = [
  { name: "Dr. Debashreet Das", dept: "CSE", deptFull: "Computer Science & Engineering", employeeId: "HOD/CSE/001", pin: "HD4X7A" },
  { name: "Dr. Prakash Kumar Panda", dept: "ECE", deptFull: "Electronics & Communication Engineering", employeeId: "HOD/ECE/001", pin: "HD8Y3B" },
  { name: "Dr. Manas Ranjan Nayak", dept: "EE", deptFull: "Electrical Engineering", employeeId: "HOD/EE/001", pin: "HD2Z6C" },
  { name: "Dr. Atal Bihari Harichandan", dept: "ME", deptFull: "Mechanical Engineering", employeeId: "HOD/ME/001", pin: "HD6W9D" },
  { name: "Dr. Bibhuti Bhusan Mukharjee", dept: "CE", deptFull: "Civil Engineering", employeeId: "HOD/CE/001", pin: "HD3V5E" },
];

const ADMIN_CREDENTIALS = {
  role: "Administrator",
  password: process.env.ADMIN_PASSWORD || "CUPGS@Admin#2025",
};

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BPUT CUPGS Feedback System";
  wb.created = new Date();

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4A148C" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const cellBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFD0D0D0" } },
    left: { style: "thin", color: { argb: "FFD0D0D0" } },
    bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
    right: { style: "thin", color: { argb: "FFD0D0D0" } },
  };

  const fSheet = wb.addWorksheet("Faculty Credentials", {
    properties: { tabColor: { argb: "FF4A148C" } },
  });

  fSheet.columns = [
    { header: "S.No", key: "sno", width: 6 },
    { header: "Faculty Name", key: "name", width: 30 },
    { header: "Department", key: "dept", width: 10 },
    { header: "Designation", key: "designation", width: 22 },
    { header: "Employee ID", key: "employeeId", width: 20 },
    { header: "Login PIN", key: "pin", width: 12 },
  ];

  fSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell.style, headerStyle);
  });
  fSheet.getRow(1).height = 28;

  FACULTY_CREDENTIALS.forEach((f, i) => {
    const row = fSheet.addRow({ sno: i + 1, ...f });
    row.eachCell((cell) => {
      cell.border = cellBorder;
      cell.alignment = { vertical: "middle" };
    });
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3E5F5" } };
      });
    }
  });

  const hSheet = wb.addWorksheet("HOD Credentials", {
    properties: { tabColor: { argb: "FF1A237E" } },
  });

  hSheet.columns = [
    { header: "S.No", key: "sno", width: 6 },
    { header: "HOD Name", key: "name", width: 30 },
    { header: "Department Code", key: "dept", width: 18 },
    { header: "Department Full Name", key: "deptFull", width: 40 },
    { header: "HOD Employee ID", key: "employeeId", width: 18 },
    { header: "Login PIN", key: "pin", width: 12 },
  ];

  hSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell.style, headerStyle);
  });
  hSheet.getRow(1).height = 28;

  HOD_CREDENTIALS.forEach((h, i) => {
    const row = hSheet.addRow({ sno: i + 1, ...h });
    row.eachCell((cell) => {
      cell.border = cellBorder;
      cell.alignment = { vertical: "middle" };
    });
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EAF6" } };
      });
    }
  });

  const aSheet = wb.addWorksheet("Admin Credentials", {
    properties: { tabColor: { argb: "FFB71C1C" } },
  });

  aSheet.columns = [
    { header: "Role", key: "role", width: 20 },
    { header: "Password", key: "password", width: 25 },
    { header: "Note", key: "note", width: 50 },
  ];

  aSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell.style, headerStyle);
  });
  aSheet.getRow(1).height = 28;

  const adminRow = aSheet.addRow({
    role: ADMIN_CREDENTIALS.role,
    password: ADMIN_CREDENTIALS.password,
    note: "Use this password on the Admin Login page. Can be changed via ADMIN_PASSWORD env variable.",
  });
  adminRow.eachCell((cell) => {
    cell.border = cellBorder;
    cell.alignment = { vertical: "middle" };
  });

  const outPath = path.join(process.cwd(), "CUPGS_Credentials_2025.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(`\n✅ Excel file generated: ${outPath}`);
  console.log(`   Faculty : ${FACULTY_CREDENTIALS.length} entries`);
  console.log(`   HODs    : ${HOD_CREDENTIALS.length} entries`);
  console.log(`   Admin   : 1 entry`);
}

generate().catch((e) => {
  console.error("❌ Excel generation failed:", e);
  process.exit(1);
});
