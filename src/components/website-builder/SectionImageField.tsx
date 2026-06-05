"use client";

import { useId, useRef, useState } from "react";
import { uploadWebsiteSectionImage } from "../../lib/fetch-user-websites";
import wb from "../../app/website-builder/website-builder.module.css";

type SectionImageFieldProps = Readonly<{
  websiteId: string;
  sectionKey: string;
  imageUrl: string;
  onImageUrl: (url: string) => void;
  disabled?: boolean;
}>;

function formatUploadErr(err: unknown): string {
  return err instanceof Error ? err.message : "Upload failed.";
}

export function SectionImageField({
  websiteId,
  sectionKey,
  imageUrl,
  onImageUrl,
  disabled,
}: SectionImageFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setLocalError("Please choose an image file.");
      return;
    }
    const named =
      file.name?.trim() ||
      `pasted-image.${file.type === "image/jpeg" ? "jpg" : file.type.replace("image/", "") || "png"}`;
    const uploadable =
      file.name?.trim() ? file : new File([file], named, { type: file.type });
    setLocalError(null);
    setUploading(true);
    try {
      const { url } = await uploadWebsiteSectionImage(websiteId, uploadable);
      onImageUrl(url);
    } catch (e) {
      setLocalError(formatUploadErr(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) void uploadFile(file);
        return;
      }
    }
  };

  const previewSrc = imageUrl.trim() || null;

  return (
    <div className={wb.sectionImageField} style={{ marginTop: "0.5rem" }}>
      <span className={wb.label} style={{ display: "block", marginBottom: "0.35rem" }}>
        Section image <span style={{ fontWeight: 400, opacity: 0.75 }}>(optional)</span>
      </span>
      <div
        className={wb.sectionImageDrop}
        tabIndex={0}
        role="group"
        aria-label={`Image for ${sectionKey}`}
        onPaste={disabled || uploading ? undefined : onPaste}
        onDragOver={(e) => e.preventDefault()}
        onDrop={
          disabled || uploading
            ? undefined
            : (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void uploadFile(file);
              }
        }
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className={wb.sectionImagePreview} />
        ) : (
          <p className={wb.sectionImagePlaceholder}>
            {uploading ? "Uploading…" : "Choose a file or paste an image (Ctrl+V)"}
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={wb.visuallyHidden}
          disabled={disabled || uploading}
          onChange={onFileChange}
        />
        <button
          type="button"
          className={wb.btnGhost}
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "UPLOADING…" : "CHOOSE IMAGE"}
        </button>
        {previewSrc ? (
          <button
            type="button"
            className={wb.btnGhost}
            disabled={disabled || uploading}
            onClick={() => onImageUrl("")}
          >
            REMOVE
          </button>
        ) : null}
      </div>
      {localError ? <p className={wb.error} style={{ marginTop: "0.35rem" }}>{localError}</p> : null}
    </div>
  );
}
