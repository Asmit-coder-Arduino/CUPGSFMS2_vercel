import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type GlassMode = "classic" | "liquid";

interface GlassModeContextType {
  glassMode: GlassMode;
  toggleGlassMode: () => void;
  isLiquid: boolean;
}

const GlassModeContext = createContext<GlassModeContextType>({
  glassMode: "classic",
  toggleGlassMode: () => {},
  isLiquid: false,
});

export function GlassModeProvider({ children }: { children: ReactNode }) {
  const [glassMode, setGlassMode] = useState<GlassMode>(() => {
    try {
      const saved = localStorage.getItem("cupgs-glass-mode") as GlassMode | null;
      if (saved === "classic" || saved === "liquid") return saved;
    } catch {}
    return "classic";
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

  const toggleGlassMode = () => setGlassMode(prev => (prev === "classic" ? "liquid" : "classic"));

  return (
    <GlassModeContext.Provider value={{ glassMode, toggleGlassMode, isLiquid: glassMode === "liquid" }}>
      {children}
    </GlassModeContext.Provider>
  );
}

export function useGlassMode() {
  return useContext(GlassModeContext);
}
