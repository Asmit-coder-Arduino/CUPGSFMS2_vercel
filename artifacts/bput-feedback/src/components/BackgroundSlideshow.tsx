import { useState, useEffect, useCallback, useRef } from "react";
import { Pin, PinOff, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { useGlassMode } from "@/contexts/GlassModeContext";

const BG_IMAGES = [
  { src: "/bg-bput-gate.png", label: "BPUT Gate" },
  { src: "/bg-bput-aerial.png", label: "BPUT Aerial" },
  { src: "/bg-bput-library.png", label: "BPUT Library" },
  { src: "/bg-bput-garden.png", label: "BPUT Garden" },
  { src: "/bg-bput-main.png", label: "BPUT Main" },
  { src: "/bg-nature-coast.png", label: "Ocean Coast" },
  { src: "/bg-nature-sakura.png", label: "Sakura Night" },
  { src: "/bg-nature-lake.png", label: "Starry Lake" },
  { src: "/bg-nature-waterfall.png", label: "Waterfall" },
  { src: "/bg-nature-mountains.png", label: "Misty Mountains" },
  { src: "/bg-led-green.png", label: "LED Green" },
  { src: "/bg-led-pink.png", label: "LED Pink" },
  { src: "/bg-led-gold.png", label: "LED Gold" },
  { src: "/bg-led-blue.png", label: "LED Blue" },
  { src: "/bg-led-purple.png", label: "LED Purple" },
  { src: "/bg-marble.png", label: "Marble" },
  { src: "/bg-cyber.png", label: "Cyber" },
  { src: "/bg-silk.png", label: "Silk" },
  { src: "/bg-mountains.png", label: "Mountains" },
  { src: "/bg-smoke.png", label: "Smoke" },
  { src: "/bg-jellyfish.png", label: "Jellyfish" },
  { src: "/bg-crystal.png", label: "Crystal" },
  { src: "/bg-forest.png", label: "Forest" },
  { src: "/bg-holographic.png", label: "Holographic" },
  { src: "/bg-galaxy.png", label: "Galaxy" },
  { src: "/bg-clouds.jpg", label: "Clouds" },
  { src: "/bg-ocean.png", label: "Ocean" },
  { src: "/bg-liquid.png", label: "Liquid" },
  { src: "/bg-nebula.png", label: "Nebula" },
  { src: "/bg-aurora.png", label: "Aurora" },
  { src: "/bg-molten-gold.png", label: "Molten Gold" },
  { src: "/bg-cyber-rain.png", label: "Cyber Rain" },
  { src: "/bg-sakura-twilight.png", label: "Sakura Dusk" },
  { src: "/bg-silk-emerald.png", label: "Silk Emerald" },
  { src: "/bg-bioluminescent-ocean.png", label: "Deep Glow" },
  { src: "/bg-iridescent-bubble.png", label: "Iridescent" },
  { src: "/bg-golden-peaks.png", label: "Golden Peaks" },
  { src: "/bg-holo-grid.png", label: "Holo Grid" },
  { src: "/bg-aurora-lake.png", label: "Aurora Lake" },
  { src: "/bg-glass-violet.png", label: "Glass Violet" },
];

const INTERVAL = 10000;
const TRANSITION_MS = 2200;
const PINNED_KEY = "bput_bg_pinned";
const BG_ACTIVE_KEY = "bput_bg_active";

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

function isBgActive(): boolean {
  try {
    const v = localStorage.getItem(BG_ACTIVE_KEY);
    if (v === "true") return true;
  } catch {}
  return false;
}

export function BackgroundSlideshow() {
  const { isLiquid } = useGlassMode();
  const savedPin = getSavedPin();
  const [bgActive, setBgActive] = useState(isBgActive());
  const [curr, setCurr] = useState(savedPin ?? 0);
  const [pinned, setPinned] = useState(savedPin !== null);
  const [layers, setLayers] = useState<{ idx: number; entering: boolean }[]>(
    bgActive ? [{ idx: savedPin ?? 0, entering: false }] : [],
  );
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
    if (!bgActive || pinned) return;
    const t = setInterval(() => {
      const next = (currRef.current + 1) % BG_IMAGES.length;
      goTo(next);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [bgActive, pinned, goTo]);

  const toggleBg = useCallback(() => {
    setBgActive((prev) => {
      const next = !prev;
      try { localStorage.setItem(BG_ACTIVE_KEY, String(next)); } catch {}
      if (next) {
        setLayers([{ idx: currRef.current, entering: false }]);
      } else {
        setLayers([]);
      }
      return next;
    });
  }, []);

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
            background: "linear-gradient(160deg, #000000 0%, #050505 30%, #030303 60%, #000000 100%)",
          }}
        />

        {bgActive && layers.map((layer, li) => (
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
            background: bgActive
              ? "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%)"
              : "none",
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
          className="flex items-center gap-1.5 overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxWidth: showControls ? "380px" : "0px",
            opacity: showControls ? 1 : 0,
          }}
        >
          {bgActive && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors flex-shrink-0"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: isLiquid ? "none" : "blur(10px)",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: isLiquid ? "none" : "blur(10px)",
                }}
              >
                <span className="text-[11px] text-white/70 font-medium whitespace-nowrap">
                  {curr + 1}/{BG_IMAGES.length}
                </span>
                <span className="text-[11px] text-white/45 whitespace-nowrap">
                  {BG_IMAGES[curr].label}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors flex-shrink-0"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: isLiquid ? "none" : "blur(10px)",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin();
                  showPanel();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
                style={{
                  background: pinned
                    ? "rgba(245,158,11,0.5)"
                    : "rgba(0,0,0,0.45)",
                  backdropFilter: isLiquid ? "none" : "blur(10px)",
                  boxShadow: pinned
                    ? "0 0 12px rgba(245,158,11,0.3)"
                    : "0 0 8px rgba(0,0,0,0.3)",
                }}
                title={pinned ? "Unpin background (resume slideshow)" : "Pin this wallpaper"}
              >
                {pinned ? (
                  <Pin className="w-3.5 h-3.5 text-amber-200" />
                ) : (
                  <PinOff className="w-3.5 h-3.5 text-white/50" />
                )}
              </button>
            </>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBg();
            showPanel();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
          style={{
            background: bgActive
              ? "rgba(245,158,11,0.5)"
              : "rgba(255,255,255,0.08)",
            backdropFilter: isLiquid ? "none" : "blur(10px)",
            boxShadow: bgActive
              ? "0 0 12px rgba(245,158,11,0.3)"
              : "0 0 8px rgba(0,0,0,0.3)",
          }}
          title={bgActive ? "Switch to deep black (no wallpaper)" : "Enable background wallpapers"}
        >
          <ImageIcon className={`w-4 h-4 ${bgActive ? "text-amber-200" : "text-white/50"}`} />
        </button>
      </div>
    </>
  );
}
