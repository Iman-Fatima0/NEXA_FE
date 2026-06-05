"use client";

import { useState } from "react";
import styles from "./chatbot-platform.module.css";

type CopyFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
};

export function CopyField({ label, value, mono = true }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <span className={styles.label}>{label}</span>
      <div className={styles.copyBlock}>
        {mono ? <pre>{value}</pre> : <code>{value}</code>}
        <button type="button" className={styles.btnSecondary} onClick={() => void onCopy()}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
