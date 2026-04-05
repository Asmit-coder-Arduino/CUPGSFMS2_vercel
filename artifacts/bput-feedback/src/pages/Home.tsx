import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useListWindows } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { getApiUrl } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GraduationCap, Users, ShieldCheck, BookOpen, Clock, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { data: windows, isLoading } = useListWindows();
  const activeWindows = windows?.filter(w => w.isActive) || [];
  const { role, faculty, student, setFaculty, setStudent, setAdmin, logout } = useRole();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [rollNumber, setRollNumber] = useState("");
  const [empId, setEmpId] = useState("");
  const [pin, setPin] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudentContinue = () => {
    if (!rollNumber.trim()) {
      setError("Please enter your roll number.");
      return;
    }
    setStudent({ rollNumber: rollNumber.trim() });
    setShowStudentModal(false);
    navigate("/submit-feedback");
  };

  const handleFacultyLogin = async () => {
    if (!empId.trim() || !pin.trim()) {
      setError("Please enter both Employee ID and PIN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/faculty-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId.trim(), pin: pin.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      const data = await res.json();
      setFaculty(data);
      setShowFacultyModal(false);
      toast({ title: `Welcome, ${data.name}`, description: `${data.designation} — ${data.departmentName}` });
      navigate("/faculty-portal");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPass.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid password.");
        return;
      }
      setAdmin();
      setShowAdminModal(false);
      toast({ title: "Admin access granted", description: "You now have full access to all system data." });
      navigate("/dashboard");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: "student" | "faculty" | "admin") => {
    setError("");
    setRollNumber("");
    setEmpId("");
    setPin("");
    setAdminPass("");
    if (type === "student") setShowStudentModal(true);
    else if (type === "faculty") setShowFacultyModal(true);
    else setShowAdminModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-4 text-center py-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <BookOpen className="w-4 h-4" />
          Academic Year 2024–25 | Even Semester
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          BPUT Academic Feedback
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Secure, structured feedback collection for Biju Patnaik University of Technology, Rourkela.
        </p>

        {role !== "guest" && (
          <div className="inline-flex items-center gap-3 mt-4 px-5 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {role === "faculty" && faculty && `Logged in as ${faculty.name} — ${faculty.departmentName}`}
            {role === "student" && student && `Student session: Roll No. ${student.rollNumber}`}
            {role === "admin" && "Administrator — Full access"}
            <button onClick={logout} className="ml-3 text-xs underline text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student Card */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Students</CardTitle>
            <CardDescription>Submit anonymous academic feedback for your courses.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : activeWindows.length > 0 ? (
              <div className="space-y-2">
                {activeWindows.map(w => (
                  <div key={w.id} className="p-2.5 bg-blue-50 rounded-md border border-blue-200 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium text-blue-800">{w.title}</span>
                    </div>
                    <div className="text-blue-600 text-xs mt-0.5 ml-5">
                      Sem {w.semester} | {w.academicYear} | Closes {w.endDate ? new Date(w.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-muted/50 rounded text-sm text-muted-foreground text-center">
                No active feedback windows right now.
              </div>
            )}
          </CardContent>
          <CardFooter>
            {role === "student" ? (
              <Link href="/submit-feedback" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={activeWindows.length === 0}>
                  Submit Feedback
                </Button>
              </Link>
            ) : (
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg"
                disabled={activeWindows.length === 0}
                onClick={() => openModal("student")}
              >
                Submit as Student
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Faculty Card */}
        <Card className="border-t-4 border-t-teal-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <CardTitle className="text-xl">Faculty</CardTitle>
            <CardDescription>View feedback submitted for your courses.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {role === "faculty" && faculty ? (
              <div className="space-y-2.5">
                <div className="text-sm font-medium text-teal-800">Welcome back!</div>
                <div className="p-2.5 bg-teal-50 rounded-md border border-teal-200 text-sm">
                  <div className="font-semibold">{faculty.name}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{faculty.designation}</div>
                  <div className="text-muted-foreground text-xs">{faculty.departmentName} | {faculty.employeeId}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {faculty.courses.length} course{faculty.courses.length !== 1 ? "s" : ""} assigned &bull; {faculty.totalFeedbackCount} feedback received
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Log in with your Employee ID and 6-digit PIN to view detailed feedback analytics for your courses.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {role === "faculty" ? (
              <Link href="/faculty-portal" className="w-full">
                <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg" onClick={() => openModal("faculty")}>
                Faculty Login
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Admin Card */}
        <Card className="border-t-4 border-t-slate-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <CardTitle className="text-xl">Administration</CardTitle>
            <CardDescription>Full analytics, faculty management, and feedback controls.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {role === "admin" ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Admin session active</div>
                <div className="space-y-1.5">
                  <Link href="/dashboard"><Button variant="outline" size="sm" className="w-full justify-start">Dashboard</Button></Link>
                  <Link href="/analytics"><Button variant="outline" size="sm" className="w-full justify-start">Analytics</Button></Link>
                  <Link href="/windows"><Button variant="outline" size="sm" className="w-full justify-start">Feedback Windows</Button></Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Administrators can access institution-wide analytics, department comparisons, faculty performance data, and manage feedback windows.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {role === "admin" ? (
              <Link href="/dashboard" className="w-full">
                <Button className="w-full" size="lg" variant="secondary">Go to Dashboard</Button>
              </Link>
            ) : (
              <Button className="w-full" size="lg" variant="secondary" onClick={() => openModal("admin")}>
                Admin Login
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Student Modal */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Feedback Access</DialogTitle>
            <DialogDescription>Enter your roll number to submit feedback. Your feedback will remain anonymous.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                placeholder="e.g. 2201288006"
                value={rollNumber}
                onChange={e => { setRollNumber(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleStudentContinue()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleStudentContinue}>Continue to Submit Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Modal */}
      <Dialog open={showFacultyModal} onOpenChange={setShowFacultyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faculty Login</DialogTitle>
            <DialogDescription>Use your BPUT Employee ID and assigned 6-digit PIN to log in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="empId">Employee ID</Label>
              <Input
                id="empId"
                placeholder="e.g. BPUT/CSE/2005/001"
                value={empId}
                onChange={e => { setEmpId(e.target.value); setError(""); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pin">6-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••••"
                maxLength={6}
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleFacultyLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleFacultyLogin} disabled={loading}>
              {loading ? "Verifying…" : "Login"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administrator Login</DialogTitle>
            <DialogDescription>Enter the system administrator password to gain full access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="adminPass">Admin Password</Label>
              <Input
                id="adminPass"
                type="password"
                placeholder="••••••••"
                value={adminPass}
                onChange={e => { setAdminPass(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" variant="secondary" onClick={handleAdminLogin} disabled={loading}>
              {loading ? "Verifying…" : "Admin Login"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
