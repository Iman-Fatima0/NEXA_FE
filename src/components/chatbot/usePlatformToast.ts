"use client";

import { useCallback, useState } from "react";

export type ToastState = { message: string; kind: "success" | "error" } | null;

export function usePlatformToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, kind: "success" });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, kind: "error" });
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  return { toast, showSuccess, showError };
}
