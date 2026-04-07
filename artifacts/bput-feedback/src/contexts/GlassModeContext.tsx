import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type GlassMode = "classic" | "liquid";

interface GlassSettings {
  blur: number;
  opacity: number;
  border: number;
}

const DEFAULT_SETTINGS: GlassSettings = {
  blur: 12,
  opacity: 0.06,
  border: 0,
};

interface GlassModeContextType {
  glassMode: GlassMode;
  toggleGlassMode: () => void;
  isLiquid: boolean;
  settings: GlassSettings;
  updateSettings: (partial: Partial<GlassSettings>) => void;
  resetSettings: () => void;
}

const GlassModeContext = createContext<GlassModeContextType>({
  glassMode: "classic",
  toggleGlassMode: () => {},
  isLiquid: false,
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

export function GlassModeProvider({ children }: { children: ReactNode }) {
  const [glassMode, setGlassMode] = useState<GlassMode>(() => {
    try {
      const saved = localStorage.getItem("cupgs-glass-mode") as GlassMode | null;
      if (saved === "classic" || saved === "liquid") return saved;
    } catch {}
    return "classic";
  });

  const [settings, setSettings] = useState<GlassSettings>(() => {
    try {
      const saved = localStorage.getItem("cupgs-glass-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          blur: typeof parsed.blur === "number" ? parsed.blur : DEFAULT_SETTINGS.blur,
          opacity: typeof parsed.opacity === "number" ? parsed.opacity : DEFAULT_SETTINGS.opacity,
          border: typeof parsed.border === "number" ? parsed.border : DEFAULT_SETTINGS.border,
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (glassMode === "liquid") {
      html.classList.add("liquid-glass");
    } else {
      html.classList.remove("liquid-glass");
    }
    try { localStorage.setItem("cupgs-glass-mode", glassMode); } catch {}
  }, [glassMode]);

  useEffect(() => {
    const html = document.documentElement;
    html.style.setProperty("--lg-blur", `${settings.blur}px`);
    html.style.setProperty("--lg-opacity", `${settings.opacity}`);
    html.style.setProperty("--lg-border", `${settings.border}`);
    try { localStorage.setItem("cupgs-glass-settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  const toggleGlassMode = () => setGlassMode(prev => (prev === "classic" ? "liquid" : "classic"));

  const updateSettings = (partial: Partial<GlassSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      next.blur = Math.max(0, Math.min(40, next.blur));
      next.opacity = Math.max(0, Math.min(0.4, next.opacity));
      next.border = Math.max(0, Math.min(1, next.border));
      return next;
    });
  };

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <GlassModeContext.Provider value={{
      glassMode, toggleGlassMode, isLiquid: glassMode === "liquid",
      settings, updateSettings, resetSettings,
    }}>
      {children}
    </GlassModeContext.Provider>
  );
}

export function useGlassMode() {
  return useContext(GlassModeContext);
}
