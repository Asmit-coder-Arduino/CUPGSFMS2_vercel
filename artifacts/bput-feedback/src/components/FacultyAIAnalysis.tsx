import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { Brain, TrendingUp, TrendingDown, Star, Sparkles, X, Loader2 } from "lucide-react";

interface AIAnalysis {
  facultyName: string;
  designation: string;
  department: string;
  totalFeedbacks: number;
  totalComments: number;
  avgRatings: {
    courseContent: string;
    teachingQuality: string;
    labFacilities: string;
    studyMaterial: string;
    overall: string;
  };
  courses: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  overallSentiment: string;
  teachingStyle: string;
  studentSatisfaction: string;
  recommendation: string;
  commentsSummary: string;
  ratingTrend: string;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-500/20 text-green-400 border-green-500/30",
  neutral: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  negative: "bg-red-500/20 text-red-400 border-red-500/30",
};

const SATISFACTION_COLORS: Record<string, string> = {
  high: "text-green-400",
  moderate: "text-yellow-400",
  low: "text-red-400",
};

export function FacultyAIAnalysis({ facultyId, onClose }: { facultyId: number; onClose: () => void }) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${getApiUrl()}/api/faculty/${facultyId}/ai-analysis`);
        if (!r.ok) throw new Error("Failed to load analysis");
        setAnalysis(await r.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [facultyId]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Performance Analysis</h2>
              <p className="text-xs text-muted-foreground">Powered by AI · Based on student feedback</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
              <p className="text-sm text-muted-foreground">AI is analyzing feedback data...</p>
              <p className="text-xs text-muted-foreground/60">This may take a few seconds</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : analysis ? (
            <>
              {/* Faculty Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">{analysis.facultyName}</h3>
                  <p className="text-sm text-muted-foreground">{analysis.designation} · {analysis.department}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{analysis.avgRatings.overall}</div>
                  <div className="text-xs text-muted-foreground">Overall Rating</div>
                </div>
              </div>

              {/* Stats bar */}
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
                  {analysis.totalFeedbacks} Feedbacks
                </span>
                <span className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
                  {analysis.totalComments} Comments
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${SENTIMENT_COLORS[analysis.overallSentiment] || "bg-muted"}`}>
                  {analysis.overallSentiment?.charAt(0).toUpperCase() + analysis.overallSentiment?.slice(1)} Sentiment
                </span>
                <span className={`px-3 py-1.5 rounded-full bg-muted text-xs font-medium ${SATISFACTION_COLORS[analysis.studentSatisfaction] || ""}`}>
                  {analysis.studentSatisfaction?.charAt(0).toUpperCase() + analysis.studentSatisfaction?.slice(1)} Satisfaction
                </span>
              </div>

              {/* Summary */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">AI Summary</span>
                </div>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "Content", val: analysis.avgRatings.courseContent },
                  { label: "Teaching", val: analysis.avgRatings.teachingQuality },
                  { label: "Lab", val: analysis.avgRatings.labFacilities },
                  { label: "Material", val: analysis.avgRatings.studyMaterial },
                  { label: "Overall", val: analysis.avgRatings.overall },
                ].map(r => (
                  <div key={r.label} className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{r.val}</div>
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.strengths?.length > 0 && (
                  <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Star className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.improvements?.length > 0 && (
                  <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-1.5">
                      {analysis.improvements.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Teaching Style & Comments */}
              {analysis.teachingStyle && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Teaching Style</h4>
                  <p className="text-sm">{analysis.teachingStyle}</p>
                </div>
              )}

              {analysis.commentsSummary && (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">What Students Are Saying</h4>
                  <p className="text-sm">{analysis.commentsSummary}</p>
                </div>
              )}

              {analysis.ratingTrend && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rating Analysis</h4>
                  <p className="text-sm">{analysis.ratingTrend}</p>
                </div>
              )}

              {analysis.recommendation && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Recommendation</h4>
                  <p className="text-sm">{analysis.recommendation}</p>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/50 text-center">
                Analysis generated by AI based on {analysis.totalFeedbacks} anonymous feedback submissions. Results are indicative, not definitive.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
