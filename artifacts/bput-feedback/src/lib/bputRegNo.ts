export const BPUT_BRANCH_MAP: Record<string, string> = {
  "01": "CE",
  "02": "EE",
  "03": "ME",
  "04": "ECE",
  "05": "CSE",
  "06": "IT",
  "07": "EEE",
  "08": "EIE",
  "11": "IT",
  "21": "CSE",
  "22": "ECE",
  "23": "EE",
  "24": "ME",
  "25": "CE",
};

export function detectDeptCodeFromRegNo(regNo: string): string | null {
  const cleaned = regNo.replace(/\s/g, "");
  if (cleaned.length < 4 || !/^\d+$/.test(cleaned)) return null;
  const branchCode = cleaned.substring(2, 4);
  return BPUT_BRANCH_MAP[branchCode] ?? null;
}

export function isValidBputRegNo(regNo: string): boolean {
  const cleaned = regNo.replace(/\s/g, "");
  return /^\d{10}$/.test(cleaned);
}
