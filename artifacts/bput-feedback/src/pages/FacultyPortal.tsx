import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, MessageSquare, TrendingUp, Award, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CourseStats {
  id: number;
  code: string;
  name: string;
  semester: number;
  academicYear: string;
  feedbackCount: number;
  avgOverall: number | null;
  avgCourseContent: number | null;
  avgTeachingQuality: number | null;
  avgLabFacilities: number | null;
  avgStudyMaterial: number | null;
  recentComments: string[];
}

function StarRating({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-muted-foreground text-sm">No data</span>;
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold">{value.toFixed(2)}</span>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  const color = !value ? "bg-muted" : value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value ? value.toFixed(2) : "—"}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CourseStats }) {
  const [expanded, setExpanded] = useState(false);
  const ratingColor = !course.avgOverall ? "text-muted-foreground" :
    course.avgOverall >= 4 ? "text-emerald-600" :
    course.avgOverall >= 3 ? "text-amber-600" : "text-red-500";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono">{course.code}</Badge>
              <Badge variant="secondary" className="text-xs">Sem {course.semester}</Badge>
            </div>
            <CardTitle className="text-base">{course.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{course.academicYear}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-bold ${ratingColor}`}>
              {course.avgOverall ? course.avgOverall.toFixed(1) : "—"}
            </div>
            <div className="text-xs text-muted-foreground">/ 5.0</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span>{course.feedbackCount} response{course.feedbackCount !== 1 ? "s" : ""}</span>
          </div>
          {course.avgOverall && <StarRating value={course.avgOverall} />}
        </div>

        {course.feedbackCount > 0 && (
          <>
            <div className="space-y-2 pt-1">
              <RatingBar label="Course Content" value={course.avgCourseContent} />
              <RatingBar label="Teaching Quality" value={course.avgTeachingQuality} />
              <RatingBar label="Lab Facilities" value={course.avgLabFacilities} />
              <RatingBar label="Study Material" value={course.avgStudyMaterial} />
            </div>

            {course.recentComments.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-8 text-xs"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span>Student Comments ({course.recentComments.length})</span>
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </Button>
                {expanded && (
                  <div className="space-y-2 mt-2">
                    {course.recentComments.map((c, i) => (
                      <div key={i} className="p-2.5 bg-muted/50 rounded-md text-xs text-muted-foreground italic border-l-2 border-primary/30">
                        "{c}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {course.feedbackCount === 0 && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No feedback received yet for this course.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FacultyPortal() {
  const { role, faculty } = useRole();
  const [, navigate] = useLocation();
  const [courseData, setCourseData] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (role !== "faculty" || !faculty) {
      navigate("/");
      return;
    }
    setPhotoUrl((faculty as any).photoUrl || null);
    const fetchData = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/faculty/${faculty.id}/my-feedback`);
        if (!res.ok) throw new Error("Failed to load feedback data.");
        const data = await res.json();
        setCourseData(data.courses);
      } catch (e: any) {
        setError(e.message || "Could not load feedback data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [faculty, role]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !faculty) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Image must be under 5MB", variant: "destructive" }); return; }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const res = await fetch(`${getApiUrl()}/api/faculty/${faculty.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: dataUrl }),
        });
        if (res.ok) {
          setPhotoUrl(dataUrl);
          toast({ title: "Photo updated successfully!" });
        } else {
          toast({ title: "Failed to update photo", variant: "destructive" });
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Failed to upload photo", variant: "destructive" });
      setUploadingPhoto(false);
    }
  };

  if (role !== "faculty" || !faculty) return null;

  const totalFeedback = courseData.reduce((s, c) => s + c.feedbackCount, 0);
  const coursesWithFeedback = courseData.filter(c => c.feedbackCount > 0);
  const overallAvg = coursesWithFeedback.length > 0
    ? coursesWithFeedback.reduce((s, c) => s + (c.avgOverall ?? 0), 0) / coursesWithFeedback.length
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/10">
              {photoUrl ? (
                <img src={photoUrl} alt={faculty.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                  {faculty.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(245,158,11,0.8)" }}
            >
              {uploadingPhoto ? (
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{faculty.name}</h1>
            <p className="text-muted-foreground">
              {faculty.designation} — {faculty.departmentName} | {faculty.employeeId}
            </p>
            {faculty.specialization && (
              <p className="text-sm text-muted-foreground/80">{faculty.specialization}</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <BookOpen className="w-4 h-4" /> Courses
            </div>
            <div className="text-3xl font-bold">{courseData.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <MessageSquare className="w-4 h-4" /> Feedback
            </div>
            <div className="text-3xl font-bold">{loading ? "—" : totalFeedback}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" /> Avg Rating
            </div>
            <div className={`text-3xl font-bold ${
              !overallAvg ? "text-muted-foreground" :
              overallAvg >= 4 ? "text-emerald-600" :
              overallAvg >= 3 ? "text-amber-600" : "text-red-500"
            }`}>
              {loading ? "—" : overallAvg ? overallAvg.toFixed(2) : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Award className="w-4 h-4" /> Department
            </div>
            <div className="text-xl font-bold">{faculty.departmentCode}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Courses — Feedback Summary</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-52 w-full" />)}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : courseData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No courses assigned yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {courseData.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
