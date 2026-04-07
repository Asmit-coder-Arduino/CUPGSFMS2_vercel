import { useGlassMode } from "@/contexts/GlassModeContext";

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  if (!isLiquid) return null;

  const lvl = settings.level;
  const cardScale = Math.round(77 * lvl);
  const sidebarScale = Math.round(90 * lvl);
  const btnScale = Math.round(50 * lvl);
  const navScale = Math.round(40 * lvl);
  const inputScale = Math.round(30 * lvl);

  return (
    <svg style={{ display: "none", position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="liquid-glass-card" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="42" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={cardScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-sidebar" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.006" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={sidebarScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-btn" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="3" seed="17" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={btnScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-nav" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="2" seed="33" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={navScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-input" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.018" numOctaves="2" seed="55" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={inputScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
