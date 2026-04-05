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
  setAdmin: () => void;
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
  setAdmin: () => {},
  logout: () => {},
});

const STORAGE_KEY = "bput_session";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [faculty, setFacultyState] = useState<FacultyUser | null>(null);
  const [hod, setHodState] = useState<HodUser | null>(null);
  const [student, setStudentState] = useState<StudentUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        setRole(session.role ?? "guest");
        setFacultyState(session.faculty ?? null);
        setHodState(session.hod ?? null);
        setStudentState(session.student ?? null);
      }
    } catch {}
  }, []);

  const save = (r: Role, f: FacultyUser | null, h: HodUser | null, s: StudentUser | null) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: r, faculty: f, hod: h, student: s }));
    setRole(r);
    setFacultyState(f);
    setHodState(h);
    setStudentState(s);
  };

  const setFaculty = (user: FacultyUser) => save("faculty", user, null, null);
  const setHod = (user: HodUser) => save("hod", null, user, null);
  const setStudent = (user: StudentUser) => save("student", null, null, user);
  const setAdmin = () => save("admin", null, null, null);
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    save("guest", null, null, null);
  };

  return (
    <RoleContext.Provider value={{ role, faculty, hod, student, setFaculty, setHod, setStudent, setAdmin, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
