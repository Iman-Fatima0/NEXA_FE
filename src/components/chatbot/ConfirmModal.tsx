"use client";

import styles from "./chatbot-platform.module.css";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  busy,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.modal}>
        <h2 id="confirm-title" className={styles.modalTitle}>
          {title}
        </h2>
        <p className={styles.sub}>{message}</p>
        <div className={styles.actionsRow}>
          <button type="button" className={styles.btnSecondary} onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? styles.btnDanger : styles.btnPrimary}
            style={{ width: "auto" }}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
