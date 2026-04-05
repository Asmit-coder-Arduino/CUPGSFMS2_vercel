import { useEffect, useState } from "react";
import { CupgsLogo } from "@/components/CupgsLogo";

const STARS = [1, 2, 3, 4, 5];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "stars" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stars"), 200);
    const t2 = setTimeout(() => setPhase("out"), 800);
    const t3 = setTimeout(() => onDone(), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-400 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(145deg, #0a0a0a 0%, #0d1117 50%, #0a0f1a 100%)" }}
    >
      {/* Glow behind logo */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          transition: "opacity 0.4s",
          opacity: phase === "in" ? 0 : 1,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease",
          transform: phase === "in" ? "scale(0.5)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
        }}
      >
        <CupgsLogo size={80} />
      </div>

      {/* App name */}
      <div
        className="mt-4 text-white font-bold text-xl tracking-wide"
        style={{
          transition: "opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s",
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
        }}
      >
        CUPGS Feedback
      </div>

      {/* Stars animation — feedback rating visual */}
      <div className="flex items-center gap-2.5 mt-6">
        {STARS.map((i) => (
          <div
            key={i}
            style={{
              transition: `opacity 0.25s ease ${(i - 1) * 100}ms, transform 0.3s cubic-bezier(.34,1.56,.64,1) ${(i - 1) * 100}ms`,
              opacity: phase === "stars" || phase === "out" ? 1 : 0,
              transform: phase === "stars" || phase === "out" ? "scale(1) rotate(0deg)" : "scale(0) rotate(-30deg)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={i <= 4 ? "#facc15" : "#facc1566"}
                stroke={i <= 4 ? "#f59e0b" : "#f59e0b44"}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div
        className="mt-3 text-sm font-medium"
        style={{
          color: "rgba(255,255,255,0.45)",
          transition: "opacity 0.4s ease 0.3s",
          opacity: phase === "stars" || phase === "out" ? 1 : 0,
        }}
      >
        Academic Feedback System
      </div>

      {/* Bottom loading bar */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
        style={{ width: 120, height: 3, background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
            transition: "width 0.7s ease 0.2s",
            width: phase === "in" ? "0%" : phase === "stars" ? "80%" : "100%",
          }}
        />
      </div>
    </div>
  );
}
