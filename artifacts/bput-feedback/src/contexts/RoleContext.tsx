import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "guest" | "student" | "faculty" | "hod" | "admin";

export interface FacultyUser {
  id: number;
  name: string;
  email: string | null;
  designation: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  avgRating: number | null;
  totalFeedbackCount: number;
  courses: Array<{ id: number; code: string; name: string; semester: number }>;
}

export interface HodUser {
  id: number;
  name: string;
  code: string;
  hodName: string;
  hodEmployeeId: string;
}

export interface StudentUser {
  rollNumber: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
}

interface RoleContextType {
  role: Role;
  faculty: FacultyUser | null;
  hod: HodUser | null;
  student: StudentUser | null;
  setFaculty: (user: FacultyUser) => void;
  setHod: (user: HodUser) => void;
  setStudent: (user: StudentUser) => void;
  adminPassword: string | null;
  setAdmin: (password?: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "guest",
  faculty: null,
  hod: null,
  student: null,
  setFaculty: () => {},
  setHod: () => {},
  setStudent: () => {},
  adminPassword: null,
  setAdmin: () => {},
  logout: () => {},
});

const SESSION_KEY = "bput_tab_session";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [faculty, setFacultyState] = useState<FacultyUser | null>(null);
  const [hod, setHodState] = useState<HodUser | null>(null);
  const [student, setStudentState] = useState<StudentUser | null>(null);
  const [adminPasswordState, setAdminPasswordState] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.removeItem("bput_session"); } catch {}
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        setRole(session.role ?? "guest");
        setFacultyState(session.faculty ?? null);
        setHodState(session.hod ?? null);
        setStudentState(session.student ?? null);
        const restoredPw = session.adminToken ? atob(session.adminToken) : (session.adminPassword ?? null);
        setAdminPasswordState(restoredPw);
      }
    } catch {}
  }, []);

  const save = (r: Role, f: FacultyUser | null, h: HodUser | null, s: StudentUser | null, ap?: string | null) => {
    try {
      const adminToken = ap ? btoa(ap) : null;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: r, faculty: f, hod: h, student: s, adminToken }));
    } catch {}
    setRole(r);
    setFacultyState(f);
    setHodState(h);
    setStudentState(s);
    setAdminPasswordState(ap ?? null);
  };

  const setFaculty = (user: FacultyUser) => save("faculty", user, null, null);
  const setHod = (user: HodUser) => save("hod", null, user, null);
  const setStudent = (user: StudentUser) => save("student", null, null, user);
  const setAdmin = (password?: string) => save("admin", null, null, null, password);
  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setRole("guest");
    setFacultyState(null);
    setHodState(null);
    setStudentState(null);
    setAdminPasswordState(null);
  };

  return (
    <RoleContext.Provider value={{ role, faculty, hod, student, setFaculty, setHod, setStudent, adminPassword: adminPasswordState, setAdmin, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
