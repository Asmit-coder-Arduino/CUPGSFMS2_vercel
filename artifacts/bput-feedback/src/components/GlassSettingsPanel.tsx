import { useState, useRef, useEffect } from "react";
import { useGlassMode } from "@/contexts/GlassModeContext";
import { SlidersHorizontal, RotateCcw, Droplets, X } from "lucide-react";

export function GlassSettingsPanel() {
  const { isLiquid, settings, updateSettings, resetSettings } = useGlassMode();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isLiquid) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36,
          borderRadius: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s ease",
          background: open ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)",
          border: "none",
          flexShrink: 0,
        }}
        title="Glass Settings"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 260,
            borderRadius: 16,
            background: "rgba(15, 10, 30, 0.92)",
            border: "1px solid rgba(245,158,11,0.2)",
            padding: "16px",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fcd34d", letterSpacing: 0.5 }}>
                Glass Settings
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={resetSettings}
                title="Reset to defaults"
                style={{
                  background: "rgba(245,158,11,0.15)",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 6px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 3,
                }}
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span style={{ fontSize: 10, color: "#f59e0b" }}>Reset</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          </div>

          <SliderRow
            label="Blur"
            value={settings.blur}
            min={0}
            max={40}
            step={1}
            unit="px"
            onChange={v => updateSettings({ blur: v })}
          />
          <SliderRow
            label="Opacity"
            value={settings.opacity}
            min={0}
            max={0.4}
            step={0.01}
            unit=""
            displayMultiplier={100}
            displayUnit="%"
            onChange={v => updateSettings({ opacity: v })}
          />
          <SliderRow
            label="Liquid Level"
            value={settings.level}
            min={0}
            max={3}
            step={0.1}
            unit="x"
            onChange={v => updateSettings({ level: v })}
          />
          <SliderRow
            label="Border"
            value={settings.border}
            min={0}
            max={1}
            step={0.05}
            unit=""
            displayMultiplier={100}
            displayUnit="%"
            onChange={v => updateSettings({ border: v })}
          />
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, unit, onChange,
  displayMultiplier, displayUnit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  displayMultiplier?: number;
  displayUnit?: string;
}) {
  const displayVal = displayMultiplier
    ? Math.round(value * displayMultiplier)
    : (step < 1 ? value.toFixed(1) : Math.round(value));
  const suffix = displayUnit ?? unit;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 11, color: "#f59e0b", fontWeight: 600,
          background: "rgba(245,158,11,0.12)", padding: "1px 6px", borderRadius: 4,
          fontVariantNumeric: "tabular-nums",
          minWidth: 36, textAlign: "center",
        }}>
          {displayVal}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="lg-settings-slider"
        style={{ width: "100%" }}
      />
    </div>
  );
}
