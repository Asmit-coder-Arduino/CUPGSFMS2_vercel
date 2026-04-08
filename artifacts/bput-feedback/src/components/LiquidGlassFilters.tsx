import { useGlassMode } from "@/contexts/GlassModeContext";
import { useEffect } from "react";

const RADIAL_GRADIENT_PNG = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAew0lEQVR4nO3d1XZsSYwE0PtNzczMzMzMzMz/PLPug2dyyRFSSKlTVS7ng97ap9zdZ6+QlGn7wiWXXPI/q1atwnVh39/AeahLL70U1mWXXSYXe8a+/92OvRaQpope/Msvv9ytK6644lRFXxNB2vd/k2OoBaRQDEP0wl955ZVtFYFaaHpqARHLgmAYxpf4qquugnX11VeXiz2T4UFoFha9FhBSDATCEAG45pprYF177bVysWdEgDw0C0xcC8hQEQoLwkNgX/DrrruuvSJECI4Fs7D4tYBccskpFBkQHoLrr7/+VN1www3ThZ7r4cmCGbHs+//NvuvcAmFJwVB4IDwAN954I62bbrpJLu85HiAFDMKCkmXf/88WkD3AGNMiQmFBeBDsC37zzTe3V4QIobFgPCwrVc4RkBMYLC0QCi8hGIbxBb7llltO1a233jpd6LkMDgLDEgZhYalyXqAcPZARBksLlBQMhILBvtC33XYbrdtvvz0s7+s9PBEalC4oWbxUOXYoRwvEgzGmRQZFhCF68e+44462iiBFaLJYbKqcFyhHByQDA80UEYoIg32R77zzTlh33XVXutizPDwIjYKFtWDnDcrRAIlgsNliTAsVBQIRAbj77rvbKwLkgVGwjKnCZpVjh3LmgaCtlAeDpYWKAoHwINxzzz2n6t577y0Xep4HxwOjYGGp4kE5pq3XmQZiU8NrpRQYKgqEIUJw3333tVeEB6HJYMlAQa3XMaTJmQSCYNjUYDDGNmpMiywKhsG+xPfff/+peuCBB8qFnufBQWAyWMZUse0Xg4LWw2cVypkD4qUGmzFUGCoKhCFC8OCDD7ZXhAehyWDJQEHD/DGkyZkBEsGwqcFgjG3UmBZZFAyDfYkfeuihU/Xwww+XCz3Pg4PAZLCMqWLbLwZFmU/OCpQzAURNDTZjqDBUFAyEh+CRRx5pLw9PBEbBkoFiZ5RjSZODB3LxP6IHg6UGaqUsDJQWEQoEwoPw6KOPwnrsscfSxZ7lwfHAeFhQqiAotvVCSDwoh47kYIFUUgNtpSIYKC0YCpQQHgb7gj/++ONtFeFBYFDCICwoVRQodut1DGlykEBmcLDh24OB0kJJCYbBvsxPPPGEW08++SSt6Gs9OAiMly4sVSIodpg/JiQHB2TEkYVhUwPNGAwGSwuGgoFQXv6nnnqqXAqiCAxLFpQqHhQ7o2TaLgvlUJEcFJBo3lBSA7VTdsZgMFQUDISE4Omnn26rCE8ERsHiQbHDvNd2ZdPkkJAcDJCOlsprp1QYEQoFhH2Zn3nmGVrPPvtsWN7Xe3AiMB6WDBTWds22XPt+Jw8GCMORhWFTAw3fszAiEMrL/9xzz5VLQRSB6YJit14jkiyUQ0WydyAIx0xqoHbKDt8MhopCAYFe7ueff76tIjwRGAWLB8Vuvby2K5Mmh4Zkb0DQpmq2pfLaqSwMBQUDYV/mF154wa0XX3yRVvS1HhwEJsJSgcLarpmW61A2XHsBksVRmTVQOzUDw6JgINSX/6WXXkqXiigCY7FUobC2KzObHDqSvQAZcbBhvDM1xq3UOGMwGBkUHgb0kr/88svTpeBBYFQsDMo4o4xbr640YcP7PtutnQOJcMy0VOiQrxNGhCKC8Morr7RVBEfF0gEFHTbOtFyHhGSnQKK2qgsHSo2xncrA8FAwEPZlfvXVV9167bXXaEVf68FBYBiWDBTbdnlp0oVkX4P7zoDM4si2VCg1xq3UOGOMMFhaeCg8EN7L//rrr8ulImJgPCwoVUYo44wybr28NFFarrOAZCdA7Al5BsdMS4XaqVkYCIUHAr3sb7zxRrkUPAyMxTILxbZd1ZarimQXQ/vmQND1EQVHpaWyGyqUGmM75bVSKgoPA3rB33zzzelS4CAwEZao9bJtF0oTtulSWi4Fya6vpWwK5GSd6x0...";

function buildFilterCSS(pageUrl: string) {
  return `
.liquid-glass .glass-card::after,
.liquid-glass .glass::after,
.liquid-glass .glass-strong::after,
.liquid-glass .stat-card::after,
.liquid-glass .lg-card::after {
  filter: url(${pageUrl}#liquid-glass-card);
  -webkit-filter: url(${pageUrl}#liquid-glass-card);
}
.liquid-glass .lg-sidebar::after,
.liquid-glass .lg-mobile-bar::after {
  filter: url(${pageUrl}#liquid-glass-sidebar);
  -webkit-filter: url(${pageUrl}#liquid-glass-sidebar);
}
.liquid-glass .glass-nav-item.active::after {
  filter: url(${pageUrl}#liquid-glass-nav);
  -webkit-filter: url(${pageUrl}#liquid-glass-nav);
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
  filter: url(${pageUrl}#liquid-glass-btn);
  -webkit-filter: url(${pageUrl}#liquid-glass-btn);
}
`;
}

function getPageUrl() {
  return window.location.href.split("#")[0];
}

export function LiquidGlassFilters() {
  const { isLiquid, settings } = useGlassMode();
  const lvl = settings.level;

  useEffect(() => {
    if (!isLiquid) return;

    const STYLE_ID = "liquid-glass-filter-styles";

    function injectStyles() {
      const pageUrl = getPageUrl();
      let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
      }
      style.textContent = buildFilterCSS(pageUrl);
    }

    injectStyles();

    window.addEventListener("popstate", injectStyles);
    window.addEventListener("hashchange", injectStyles);

    return () => {
      window.removeEventListener("popstate", injectStyles);
      window.removeEventListener("hashchange", injectStyles);
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, [isLiquid]);

  if (!isLiquid) return null;

  return (
    <svg
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "1px",
        height: "1px",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
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
        <filter id="liquid-glass-btn" primitiveUnits="objectBoundingBox">
          <feImage href={`data:image/png;base64,${RADIAL_GRADIENT_PNG}`} result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2="map" scale={lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-glass-nav" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="33" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale={40 * lvl} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
