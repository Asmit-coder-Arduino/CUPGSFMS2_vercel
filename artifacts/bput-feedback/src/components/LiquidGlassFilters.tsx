import { useGlassMode } from "@/contexts/GlassModeContext";
import { useEffect } from "react";

function svgFilterUrl(filterInner: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${filterInner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#f")`;
}

function cardFilter(scale: number) {
  return svgFilterUrl(
    `<filter id="f" x="0%" y="0%" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="42" result="noise"/>` +
    `<feGaussianBlur in="noise" stdDeviation="0.02" result="blur"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="blur" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  );
}

function sidebarFilter(scale: number) {
  return svgFilterUrl(
    `<filter id="f" x="0%" y="0%" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>` +
    `<feGaussianBlur in="noise" stdDeviation="0.02" result="blur"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="blur" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  );
}

function btnFilter(scale: number) {
  return svgFilterUrl(
    `<filter id="f" x="0%" y="0%" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="7" result="noise"/>` +
    `<feGaussianBlur in="noise" stdDeviation="0.015" result="blur"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="blur" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  );
}

function navFilter(scale: number) {
  return svgFilterUrl(
    `<filter id="f" x="0%" y="0%" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="33" result="noise"/>` +
    `<feGaussianBlur in="noise" stdDeviation="0.02" result="blur"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="blur" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  );
}

function buildFilterCSS(lvl: number) {
  const card = cardFilter(77 * lvl);
  const sidebar = sidebarFilter(90 * lvl);
  const btn = btnFilter(lvl * 60);
  const nav = navFilter(40 * lvl);

  return `
.liquid-glass .glass-card::after,
.liquid-glass .glass::after,
.liquid-glass .glass-strong::after,
.liquid-glass .stat-card::after,
.liquid-glass .lg-card::after {
  filter: ${card};
  -webkit-filter: ${card};
}
.liquid-glass .lg-sidebar::after,
.liquid-glass .lg-mobile-bar::after {
  filter: ${sidebar};
  -webkit-filter: ${sidebar};
}
.liquid-glass .glass-nav-item.active::after {
  filter: ${nav};
  -webkit-filter: ${nav};
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
  filter: ${btn};
  -webkit-filter: ${btn};
}
`;
}

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  const lvl = settings.level;

  useEffect(() => {
    if (!isLiquid) return;

    const STYLE_ID = "liquid-glass-filter-styles";
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = buildFilterCSS(lvl);

    return () => {
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, [isLiquid, lvl]);

  return null;
}
