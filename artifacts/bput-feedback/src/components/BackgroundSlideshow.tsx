import { useState, useEffect, useCallback, useRef } from "react";
import { Pin, PinOff, ChevronLeft, ChevronRight } from "lucide-react";

const BG_IMAGES = [
  { src: "/bg-aurora.png", label: "Aurora" },
  { src: "/bg-nebula.png", label: "Nebula" },
  { src: "/bg-liquid.png", label: "Liquid" },
  { src: "/bg-ocean.png", label: "Ocean" },
  { src: "/bg-clouds.jpg", label: "Clouds" },
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
  const animKey = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (next === curr) return;
      animKey.current++;
      setLayers((prev) => [...prev, { idx: next, entering: true }]);
      setCurr(next);
      setTimeout(() => {
        setLayers([{ idx: next, entering: false }]);
      }, TRANSITION_MS + 200);
    },
    [curr],
  );

  useEffect(() => {
    if (pinned) return;
    const t = setInterval(() => {
      const next = (curr + 1) % BG_IMAGES.length;
      goTo(next);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [curr, pinned, goTo]);

  const togglePin = () => {
    if (pinned) {
      localStorage.removeItem(PINNED_KEY);
      setPinned(false);
    } else {
      localStorage.setItem(PINNED_KEY, String(curr));
      setPinned(true);
    }
  };

  const handlePrev = () => goTo((curr - 1 + BG_IMAGES.length) % BG_IMAGES.length);
  const handleNext = () => goTo((curr + 1) % BG_IMAGES.length);

  const showPanel = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  const kenBurnsVariants = [
    "scale(1.15) translate(-2%, -1%)",
    "scale(1.12) translate(2%, 1%)",
    "scale(1.18) translate(-1%, 2%)",
    "scale(1.14) translate(1%, -2%)",
    "scale(1.16) translate(0%, 1%)",
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
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

      <div
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5"
        onMouseEnter={showPanel}
        onTouchStart={showPanel}
      >
        <div
          className="flex items-center gap-1 overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxWidth: showControls ? "300px" : "0px",
            opacity: showControls ? 1 : 0,
          }}
        >
          <button
            onClick={handlePrev}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            {BG_IMAGES.map((bg, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={bg.label}
                className="transition-all duration-300"
                style={{
                  width: i === curr ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "99px",
                  background:
                    i === curr
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span
            className="text-[10px] text-white/40 font-medium whitespace-nowrap pl-1"
          >
            {BG_IMAGES[curr].label}
          </span>
        </div>

        <button
          onClick={() => {
            togglePin();
            showPanel();
          }}
          onMouseEnter={showPanel}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: pinned
              ? "rgba(139,92,246,0.35)"
              : "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
          }}
          title={pinned ? "Unpin background (resume auto-rotate)" : "Pin this background"}
        >
          {pinned ? (
            <Pin className="w-3.5 h-3.5 text-violet-300" />
          ) : (
            <PinOff className="w-3.5 h-3.5 text-white/50" />
          )}
        </button>
      </div>
    </div>
  );
}
