"use client";

import { useCallback, useEffect, useState } from "react";
import { hexToHue, hslToHex, normalizeHexColor } from "../../lib/website-theme-color";
import styles from "./ThemeColorSlider.module.css";

type ThemeColorSliderProps = Readonly<{
  value: string;
  onChange: (hex: string) => void;
  id?: string;
}>;

export function ThemeColorSlider({ value, onChange, id = "wb-theme" }: ThemeColorSliderProps) {
  const normalized = normalizeHexColor(value);
  const [hue, setHue] = useState(() => hexToHue(normalized));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      setHue(hexToHue(normalizeHexColor(value)));
    }
  }, [value, dragging]);

  const displayHex = dragging ? hslToHex(hue) : normalized;

  const handleChange = useCallback(
    (nextHue: number) => {
      setHue(nextHue);
      onChange(hslToHex(nextHue));
    },
    [onChange],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <span className={styles.swatch} style={{ background: displayHex }} aria-hidden />
        <span className={styles.value} style={{ color: displayHex }}>
          {displayHex.toUpperCase()}
        </span>
      </div>
      <div className={styles.trackWrap}>
        <input
          id={id}
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          className={styles.slider}
          aria-label="Theme color"
        />
      </div>
    </div>
  );
}
