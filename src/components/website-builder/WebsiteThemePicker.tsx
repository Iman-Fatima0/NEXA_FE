"use client";

import type { CSSProperties } from "react";
import { PRESET_META } from "../../lib/theme/presets";
import type { ThemePreset, ThemeTokens } from "../../lib/theme/types";
import styles from "./WebsiteThemePicker.module.css";

type WebsiteThemePickerProps = Readonly<{
  preset: ThemePreset;
  theme: ThemeTokens;
  onPresetSelect: (preset: ThemePreset) => void;
  onThemeChange: (patch: Partial<ThemeTokens>) => void;
}>;

export function WebsiteThemePicker({ preset, theme, onPresetSelect, onThemeChange }: WebsiteThemePickerProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.presetGrid}>
        {PRESET_META.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.presetCard} ${preset === p.id ? styles.presetCardActive : ""}`}
            style={{ "--card-accent": p.swatch } as CSSProperties}
            onClick={() => onPresetSelect(p.id)}
          >
            <span className={styles.presetSwatch} style={{ background: p.previewBg }} aria-hidden />
            <span className={styles.presetLabel}>{p.label}</span>
            <span className={styles.presetDesc}>{p.description}</span>
          </button>
        ))}
      </div>
      <div className={styles.colorGrid}>
        {(
          [
            ["primaryColor", "Primary"],
            ["secondaryColor", "Secondary"],
            ["textColor", "Text"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className={styles.colorField}>
            <span className={styles.colorLabel}>{label}</span>
            <input
              type="color"
              className={styles.colorInput}
              value={theme[key]}
              onChange={(e) => onThemeChange({ [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
