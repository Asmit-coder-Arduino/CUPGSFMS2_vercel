import { useGlassMode } from "@/contexts/GlassModeContext";

const FILTER_CSS = `
.liquid-glass .glass-card::after,
.liquid-glass .glass::after,
.liquid-glass .glass-strong::after,
.liquid-glass .stat-card::after,
.liquid-glass .lg-card::after {
  filter: url(#liquid-glass-card);
  -webkit-filter: url(#liquid-glass-card);
}
.liquid-glass .lg-sidebar::after,
.liquid-glass .lg-mobile-bar::after {
  filter: url(#liquid-glass-sidebar);
  -webkit-filter: url(#liquid-glass-sidebar);
}
.liquid-glass .glass-nav-item.active::after {
  filter: url(#liquid-glass-nav);
  -webkit-filter: url(#liquid-glass-nav);
}
.liquid-glass .btn-gradient-blue::after,
.liquid-glass .btn-gradient-teal::after,
.liquid-glass .btn-gradient-indigo::after,
.liquid-glass .btn-gradient-slate::after,
.liquid-glass .theme-toggle::after,
.liquid-glass .lg-toggle-btn::after,
.liquid-glass .hero-badge::after,
.liquid-glass .icon-circle-blue::after,
.liquid-glass .icon-circle-teal::after,
.liquid-glass .icon-circle-indigo::after,
.liquid-glass .icon-circle-slate::after,
.liquid-glass .accent-line-blue::after,
.liquid-glass .accent-line-teal::after,
.liquid-glass .accent-line-indigo::after,
.liquid-glass .accent-line-slate::after {
  filter: url(#liquid-glass-btn);
  -webkit-filter: url(#liquid-glass-btn);
}
`;

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  if (!isLiquid) return null;

  const lvl = settings.level;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FILTER_CSS }} />
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="liquid-glass-card" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="42" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={77 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-sidebar" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={90 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-btn" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="15" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={50 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-modal" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="77" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={77 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-nav" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="33" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={40 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-glass-input" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="55" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
            <feDisplacementMap in="SourceGraphic" in2="blur" scale={30 * lvl} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
