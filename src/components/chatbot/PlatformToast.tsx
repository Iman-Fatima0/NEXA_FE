"use client";

import type { ToastState } from "./usePlatformToast";
import styles from "./chatbot-platform.module.css";

export function PlatformToast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      className={`${styles.toast} ${toast.kind === "success" ? styles.toastSuccess : styles.toastError}`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
