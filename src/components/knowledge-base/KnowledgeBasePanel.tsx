"use client";

import { useCallback, useId, useRef, type ChangeEvent, type DragEvent } from "react";
import { INGEST_ACCEPT, INGEST_HINT, isIngestableFile } from "../../lib/chatbot/ingest-files";
import { knowledgeFileKey } from "../../lib/knowledge-base/knowledge-base-utils";
import wb from "../../app/website-builder/website-builder.module.css";

export type KnowledgeBasePanelProps = Readonly<{
  idPrefix: string;
  disabled?: boolean;
  knowledgeMode: "files" | "text";
  onKnowledgeModeChange: (mode: "files" | "text") => void;
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (key: string) => void;
  knowledgeText: string;
  onKnowledgeTextChange: (text: string) => void;
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  showUrls?: boolean;
  title?: string;
  textHint?: string;
  className?: string;
}>;

export function KnowledgeBasePanel({
  idPrefix,
  disabled = false,
  knowledgeMode,
  onKnowledgeModeChange,
  files,
  onAddFiles,
  onRemoveFile,
  knowledgeText,
  onKnowledgeTextChange,
  urls,
  onUrlsChange,
  showUrls = true,
  title = "Add Knowledge Base",
  textHint = "used when you generate with AI.",
  className,
}: KnowledgeBasePanelProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.currentTarget.files;
      if (list?.length) {
        onKnowledgeModeChange("files");
        onAddFiles(Array.from(list));
        e.currentTarget.value = "";
      }
    },
    [onAddFiles, onKnowledgeModeChange],
  );

  const onDropZoneDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <article className={className ? `${wb.panel} ${className}` : wb.panel}>
      <h2 className={wb.panelTitle}>{title}</h2>
      <div className={wb.btnRow2}>
        <button
          type="button"
          className={`${wb.btnGhost} ${knowledgeMode === "files" ? wb.btnGhostActive : ""}`}
          onClick={() => onKnowledgeModeChange("files")}
          disabled={disabled}
        >
          Upload Files
        </button>
        <button
          type="button"
          className={`${wb.btnGhost} ${knowledgeMode === "text" ? wb.btnGhostActive : ""}`}
          onClick={() => onKnowledgeModeChange("text")}
          disabled={disabled}
        >
          Enter Text
        </button>
      </div>

      {knowledgeMode === "files" ? (
        <>
          <div
            className={`${wb.dropZone} ${wb.dropZoneInteractive}`}
            onDragEnter={onDropZoneDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) {
                onKnowledgeModeChange("files");
                onAddFiles(Array.from(e.dataTransfer.files));
              }
            }}
          >
            <div className={wb.dropZoneVisual}>
              <div className={wb.dropZoneIcon}>⇪</div>
              <div className={wb.dropZoneTitle}>Upload your data files</div>
              <div className={wb.dropZoneHint}>{INGEST_HINT}</div>
              <span className={wb.dropZoneCue}>Choose files</span>
            </div>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              className={wb.dropZoneNativeFile}
              accept={INGEST_ACCEPT}
              multiple
              onChange={onInputChange}
              disabled={disabled}
              aria-label="Upload knowledge files"
            />
          </div>
          {files.length > 0 ? (
            <ul className={wb.fileList} aria-label="Selected files">
              {files.map((file) => {
                const key = knowledgeFileKey(file);
                return (
                  <li key={key} className={wb.fileRow}>
                    <span>
                      {file.name}
                      <span className={wb.fileMeta}> ({(file.size / 1024).toFixed(1)} KB)</span>
                    </span>
                    <button
                      type="button"
                      className={wb.fileRemove}
                      onClick={() => onRemoveFile(key)}
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={wb.kbHint}>No files selected yet.</p>
          )}
        </>
      ) : (
        <div className={wb.field}>
          <label className={wb.label} htmlFor={`${idPrefix}-knowledge-text`}>
            Custom knowledge
          </label>
          <textarea
            id={`${idPrefix}-knowledge-text`}
            className={wb.textarea}
            value={knowledgeText}
            onChange={(e) => onKnowledgeTextChange(e.target.value)}
            placeholder="Paste or type product info, FAQs, policies, etc."
            rows={8}
            disabled={disabled}
          />
          <p className={wb.kbHint}>
            {knowledgeText.length} characters — {textHint}
          </p>
        </div>
      )}

      {showUrls ? (
        <div className={wb.field} style={{ marginTop: "1rem" }}>
          <span className={wb.label}>Website URLs</span>
          {urls.map((url, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                className={wb.input}
                type="url"
                placeholder="https://yoursite.com/about"
                value={url}
                onChange={(e) => {
                  const next = [...urls];
                  next[i] = e.target.value;
                  onUrlsChange(next);
                }}
                disabled={disabled}
              />
              {urls.length > 1 ? (
                <button
                  type="button"
                  className={wb.fileRemove}
                  disabled={disabled}
                  onClick={() => onUrlsChange(urls.filter((_, j) => j !== i))}
                  aria-label="Remove URL"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className={wb.btnGhost}
            disabled={disabled}
            onClick={() => onUrlsChange([...urls, ""])}
          >
            Add URL
          </button>
        </div>
      ) : null}
    </article>
  );
}
