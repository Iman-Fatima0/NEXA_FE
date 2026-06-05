"use client";

import Link from "next/link";
import { SUPERADMIN_PALETTE, SUPERADMIN_TABS } from "../../lib/superadmin/palette";
import { SuperadminShell } from "./SuperadminShell";
import styles from "./superadmin.module.css";

const PALETTE_SWATCHES = [
  { label: "Base", hex: SUPERADMIN_PALETTE.base },
  { label: "50", hex: SUPERADMIN_PALETTE[50] },
  { label: "100", hex: SUPERADMIN_PALETTE[100] },
  { label: "200", hex: SUPERADMIN_PALETTE[200] },
  { label: "300", hex: SUPERADMIN_PALETTE[300] },
  { label: "400", hex: SUPERADMIN_PALETTE[400] },
  { label: "500", hex: SUPERADMIN_PALETTE[500] },
  { label: "600", hex: SUPERADMIN_PALETTE[600] },
  { label: "700", hex: SUPERADMIN_PALETTE[700] },
  { label: "800", hex: SUPERADMIN_PALETTE[800] },
  { label: "900", hex: SUPERADMIN_PALETTE[900] },
  { label: "950", hex: SUPERADMIN_PALETTE[950] },
] as const;

function textOn(bg: string): string {
  const dark = ["#737373", "#525252", "#404040", "#262626", "#171717", "#0A0A0A", "#0a0a0a"];
  return dark.includes(bg) ? "#FAFAFA" : "#171717";
}

export function SuperadminHub() {
  return (
    <SuperadminShell title="Superadmin" subtitle="Platform control — select a section">
      <div className={styles.paletteRow} aria-hidden>
        {PALETTE_SWATCHES.map((s) => (
          <span
            key={s.label}
            className={styles.swatchMini}
            style={{ background: s.hex }}
            title={`${s.label} ${s.hex}`}
          />
        ))}
      </div>

      <div className={styles.tabGrid}>
        {SUPERADMIN_TABS.map((tab) => {
          const bg = SUPERADMIN_PALETTE[tab.swatch];
          const fg = textOn(bg);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={styles.tabCard}
              style={{ background: bg, color: fg }}
            >
              <span className={styles.tabCardLabel}>{tab.swatch}</span>
              <h2 className={styles.tabCardTitle}>{tab.title}</h2>
              <p className={styles.tabCardDesc}>{tab.description}</p>
            </Link>
          );
        })}
      </div>
    </SuperadminShell>
  );
}
