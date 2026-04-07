import { useGlassMode } from "@/contexts/GlassModeContext";

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  if (!isLiquid) return null;

  const lvl = settings.level;

  return (
    <svg style={{ display: "none", position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="liquid-glass-card" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="3" seed="42" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.8" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={18 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-sidebar" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.5" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={30 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-btn" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="2" seed="15" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.6" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={12 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-modal" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.006" numOctaves="3" seed="77" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.4" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={25 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-nav" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="33" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.5" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={10 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-input" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.018" numOctaves="2" seed="55" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.4" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={8 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
