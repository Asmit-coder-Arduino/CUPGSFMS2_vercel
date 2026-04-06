import { useState, useEffect, useCallback } from "react";

const BG_IMAGES = [
  "/bg-aurora.png",
  "/bg-nebula.png",
  "/bg-liquid.png",
  "/bg-ocean.png",
  "/bg-clouds.jpg",
];

const INTERVAL = 8000;

export function BackgroundSlideshow() {
  const [curr, setCurr] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const advance = useCallback(() => {
    setPrev(curr);
    setCurr(c => (c + 1) % BG_IMAGES.length);
  }, [curr]);

  useEffect(() => {
    const t = setInterval(advance, INTERVAL);
    return () => clearInterval(t);
  }, [advance]);

  useEffect(() => {
    if (prev !== null) {
      const t = setTimeout(() => setPrev(null), 1800);
      return () => clearTimeout(t);
    }
  }, [prev]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #06030f 0%, #0a0618 30%, #080c1a 60%, #030810 100%)",
        }}
      />

      {prev !== null && (
        <div
          className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
          style={{
            opacity: 0,
            backgroundImage: `url(${BG_IMAGES[prev]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div
        className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
        style={{
          opacity: 0.55,
          backgroundImage: `url(${BG_IMAGES[curr]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(6,3,15,0.5) 100%)",
        }}
      />
    </div>
  );
}
