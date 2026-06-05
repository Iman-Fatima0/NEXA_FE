"use client";

import { themeToCssVars } from "../../lib/theme/theme-vars";
import type { AnimationStyle, ThemeTokens } from "../../lib/theme/types";
import styles from "./widget-preview.module.css";

type WidgetPreviewProps = {
  theme: ThemeTokens;
  botName?: string;
  greeting?: string;
  mobile?: boolean;
};

function headerClass(style: ThemeTokens["headerStyle"]): string {
  if (style === "glass") return styles.headerGlass;
  if (style === "gradient") return styles.headerGradient;
  return styles.headerSolid;
}

function positionClass(position: ThemeTokens["chatPosition"]): string {
  return position === "bottom-left" ? styles.positionLeft : styles.positionRight;
}

function launcherAnimClass(animation: AnimationStyle): string {
  return animation === "bounce" ? styles.launcherBounce : "";
}

export function WidgetPreview({
  theme,
  botName = "My Bot",
  greeting = "Hi! How can I help you today?",
  mobile = false,
}: Readonly<WidgetPreviewProps>) {
  const cssVars = themeToCssVars(theme);
  const pos = positionClass(theme.chatPosition);

  return (
    <div className={`${styles.previewShell} ${mobile ? styles.previewShellMobile : ""}`}>
      <span className={`${styles.mobileLabel} ${mobile ? "" : styles.brandingHidden}`}>
        Mobile preview
      </span>
      <div className={`${styles.stage} ${pos}`} style={cssVars}>
        <div className={styles.stageInner} aria-hidden />
        <div className={styles.deviceFrame}>
          <div className={styles.chatWindow}>
            <div className={`${styles.header} ${headerClass(theme.headerStyle)}`}>
              <span className={styles.headerTitle}>
                <span className={styles.headerDot} aria-hidden />
                {botName}
              </span>
              <span className={styles.headerClose} aria-hidden>
                ×
              </span>
            </div>
            <div className={styles.body}>
              <div className={`${styles.bubble} ${styles.bubbleBot}`}>{greeting}</div>
              <div className={`${styles.bubble} ${styles.bubbleUser}`}>Tell me about your pricing</div>
              <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                I&apos;d be happy to help with pricing and plans.
              </div>
            </div>
            <div className={styles.inputRow}>
              <span className={styles.inputFake}>Type a message…</span>
              <button type="button" className={styles.sendBtn} aria-hidden tabIndex={-1}>
                ↑
              </button>
            </div>
            <div
              className={`${styles.branding} ${theme.showBranding ? "" : styles.brandingHidden}`}
              aria-hidden={!theme.showBranding}
            >
              Powered by NEXA
            </div>
          </div>
          <div className={styles.launcherWrap}>
            <button
              type="button"
              className={`${styles.launcher} ${launcherAnimClass(theme.animation)}`}
              aria-label="Chat launcher preview"
              tabIndex={-1}
            >
              💬
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
