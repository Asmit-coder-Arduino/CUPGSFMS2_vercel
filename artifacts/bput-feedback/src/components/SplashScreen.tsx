import { useEffect, useState } from "react";
import { CupgsLogo } from "@/components/CupgsLogo";

const STARS = [1, 2, 3, 4, 5];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "stars" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stars"), 200);
    const t2 = setTimeout(() => setPhase("out"), 900);
    const t3 = setTimeout(() => onDone(), 1350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at 30% 20%, rgba(180,83,9,0.35) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(202,138,4,0.2) 0%, transparent 55%), linear-gradient(160deg, #0f0a00 0%, #1a1000 55%, #100800 100%)"
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute",
          width: 500, height: 500,
          top: -120, left: -100,
          background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 65%)",
          filter: "blur(60px)",
          transition: "opacity 0.6s",
          opacity: phase === "in" ? 0 : 0.8,
        }} />
        <div style={{
          position: "absolute",
          width: 400, height: 400,
          bottom: -80, right: -80,
          background: "radial-gradient(circle, rgba(234,179,8,0.18) 0%, transparent 65%)",
          filter: "blur(60px)",
          transition: "opacity 0.6s 0.1s",
          opacity: phase === "in" ? 0 : 0.7,
        }} />
      </div>

      <div className="relative">
        <div style={{
          position: "absolute",
          inset: -20,
          background: "radial-gradient(circle, rgba(245,158,11,0.55) 0%, transparent 65%)",
          filter: "blur(30px)",
          borderRadius: "50%",
          transition: "opacity 0.5s",
          opacity: phase === "in" ? 0 : 1,
        }} />
        <div
          style={{
            transition: "transform 0.55s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease",
            transform: phase === "in" ? "scale(0.4)" : "scale(1)",
            opacity: phase === "in" ? 0 : 1,
          }}
        >
          <CupgsLogo size={84} />
        </div>
      </div>

      <div
        className="mt-5 font-extrabold text-2xl tracking-tight"
        style={{
          background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 40%, #eab308 70%, #fbbf24 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          transition: "opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s",
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(10px)" : "translateY(0)",
        }}
      >
        CUPGS Feedback
      </div>

      <div className="flex items-center gap-3 mt-5">
        {STARS.map((i) => (
          <div
            key={i}
            style={{
              transition: `opacity 0.3s ease ${(i - 1) * 90}ms, transform 0.35s cubic-bezier(.34,1.56,.64,1) ${(i - 1) * 90}ms`,
              opacity: phase === "stars" || phase === "out" ? 1 : 0,
              transform: phase === "stars" || phase === "out" ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(-45deg)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id={`sg${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={i <= 4 ? "#f59e0b" : "#f59e0b44"} />
                  <stop offset="100%" stopColor={i <= 4 ? "#b45309" : "#b4530944"} />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={`url(#sg${i})`}
                stroke={i <= 4 ? "#d97706" : "#d9770644"}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div
        className="mt-3 text-sm font-medium tracking-wide"
        style={{
          color: "rgba(252,211,77,0.55)",
          transition: "opacity 0.4s ease 0.35s",
          opacity: phase === "stars" || phase === "out" ? 1 : 0,
        }}
      >
        Academic Feedback System · BPUT Rourkela
      </div>

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
        style={{ width: 140, height: 3, background: "rgba(245,158,11,0.12)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #d97706, #f59e0b, #eab308)",
            transition: "width 0.8s ease 0.2s",
            width: phase === "in" ? "0%" : phase === "stars" ? "75%" : "100%",
          }}
        />
      </div>
    </div>
  );
}
