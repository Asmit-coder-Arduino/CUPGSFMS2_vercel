import { useState, useEffect, useCallback, useRef } from "react";
import { Pin, PinOff, ChevronLeft, ChevronRight } from "lucide-react";

const BG_IMAGES = [
  { src: "/bg-aurora.png", label: "Aurora" },
  { src: "/bg-nebula.png", label: "Nebula" },
  { src: "/bg-liquid.png", label: "Liquid" },
  { src: "/bg-ocean.png", label: "Ocean" },
  { src: "/bg-clouds.jpg", label: "Clouds" },
  { src: "/bg-galaxy.png", label: "Galaxy" },
  { src: "/bg-holographic.png", label: "Holographic" },
  { src: "/bg-forest.png", label: "Forest" },
  { src: "/bg-crystal.png", label: "Crystal" },
  { src: "/bg-jellyfish.png", label: "Jellyfish" },
  { src: "/bg-smoke.png", label: "Smoke" },
  { src: "/bg-mountains.png", label: "Mountains" },
  { src: "/bg-silk.png", label: "Silk" },
  { src: "/bg-cyber.png", label: "Cyber" },
  { src: "/bg-marble.png", label: "Marble" },
];

const INTERVAL = 10000;
const TRANSITION_MS = 2200;
const PINNED_KEY = "bput_bg_pinned";

function getSavedPin(): number | null {
  try {
    const v = localStorage.getItem(PINNED_KEY);
    if (v !== null) {
      const n = parseInt(v, 10);
      if (n >= 0 && n < BG_IMAGES.length) return n;
    }
  } catch {}
  return null;
}

export function BackgroundSlideshow() {
  const savedPin = getSavedPin();
  const [curr, setCurr] = useState(savedPin ?? 0);
  const [pinned, setPinned] = useState(savedPin !== null);
  const [layers, setLayers] = useState<{ idx: number; entering: boolean }[]>([
    { idx: savedPin ?? 0, entering: false },
  ]);
  const [showControls, setShowControls] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const currRef = useRef(curr);
  currRef.current = curr;

  const goTo = useCallback((next: number) => {
    if (next === currRef.current) return;
    setLayers((prev) => [...prev, { idx: next, entering: true }]);
    setCurr(next);
    setTimeout(() => {
      setLayers([{ idx: next, entering: false }]);
    }, TRANSITION_MS + 200);
  }, []);

  useEffect(() => {
    if (pinned) return;
    const t = setInterval(() => {
      const next = (currRef.current + 1) % BG_IMAGES.length;
      goTo(next);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [pinned, goTo]);

  const togglePin = useCallback(() => {
    setPinned((prev) => {
      if (prev) {
        localStorage.removeItem(PINNED_KEY);
        return false;
      } else {
        localStorage.setItem(PINNED_KEY, String(currRef.current));
        return true;
      }
    });
  }, []);

  const handlePrev = useCallback(
    () => goTo((currRef.current - 1 + BG_IMAGES.length) % BG_IMAGES.length),
    [goTo],
  );
  const handleNext = useCallback(
    () => goTo((currRef.current + 1) % BG_IMAGES.length),
    [goTo],
  );

  const showPanel = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 5000);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #06030f 0%, #0a0618 30%, #080c1a 60%, #030810 100%)",
          }}
        />

        {layers.map((layer, li) => (
          <div
            key={`${layer.idx}-${li}`}
            className="absolute inset-0"
            style={{
              opacity: layer.entering ? 0 : 0.55,
              animation: layer.entering
                ? `bgFadeIn ${TRANSITION_MS}ms ease-in-out forwards`
                : undefined,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${BG_IMAGES[layer.idx].src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                animation: `kenBurns_${layer.idx % 5} ${INTERVAL + TRANSITION_MS}ms ease-in-out infinite alternate`,
              }}
            />
          </div>
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(6,3,15,0.5) 100%)",
          }}
        />
      </div>

      <div
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-1.5 pointer-events-auto"
        onMouseEnter={showPanel}
        onTouchStart={showPanel}
        onClick={showPanel}
      >
        <div
          className="flex items-center gap-1 overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxWidth: showControls ? "400px" : "0px",
            opacity: showControls ? 1 : 0,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            className="flex items-center gap-1 px-2 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            {BG_IMAGES.map((bg, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                title={bg.label}
                className="transition-all duration-300 flex-shrink-0"
                style={{
                  width: i === curr ? "14px" : "5px",
                  height: "5px",
                  borderRadius: "99px",
                  background:
                    i === curr
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] text-white/50 font-medium whitespace-nowrap pl-1 flex-shrink-0">
            {BG_IMAGES[curr].label}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePin();
            showPanel();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
          style={{
            background: pinned
              ? "rgba(139,92,246,0.5)"
              : "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
            boxShadow: pinned
              ? "0 0 12px rgba(139,92,246,0.3)"
              : "0 0 8px rgba(0,0,0,0.3)",
          }}
          title={pinned ? "Unpin background (resume slideshow)" : "Pin this wallpaper"}
        >
          {pinned ? (
            <Pin className="w-4 h-4 text-violet-200" />
          ) : (
            <PinOff className="w-4 h-4 text-white/50" />
          )}
        </button>
      </div>
    </>
  );
}
