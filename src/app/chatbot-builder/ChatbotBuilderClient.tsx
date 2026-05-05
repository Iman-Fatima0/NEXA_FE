"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import wb from "../website-builder/website-builder.module.css";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

const ACCEPT =
  ".pdf,.txt,.csv,.docx,application/pdf,text/csv,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const PLACEHOLDER_NAME = "e.g. Customer Support Assistant";
const PLACEHOLDER_PERSONALITY =
  "Example: Friendly and professional, helpful but concise, uses emojis occasionally";

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

type ChatbotBuilderClientProps = Readonly<{
  hubBackHref: string;
}>;

export default function ChatbotBuilderClient({ hubBackHref }: ChatbotBuilderClientProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatbotName, setChatbotName] = useState("");
  const [personality, setPersonality] = useState("");
  const [knowledgeMode, setKnowledgeMode] = useState<"files" | "text">("files");
  const [files, setFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const addFiles = useCallback((list: FileList | File[]) => {
    setFiles((prev) => {
      const next = [...prev];
      const seen = new Set(next.map(fileKey));
      for (const file of Array.from(list)) {
        const key = fileKey(file);
        if (!seen.has(key)) {
          seen.add(key);
          next.push(file);
        }
      }
      return next;
    });
  }, []);

  const removeFile = useCallback((key: string) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
  }, []);

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const list = input.files;
    if (list?.length) {
      setKnowledgeMode("files");
      addFiles(Array.from(list));
      input.value = "";
    }
    setDragActive(false);
  }, [addFiles]);

  const onDropZoneDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types?.includes("Files")) {
      setDragActive(true);
    }
  }, []);

  const onDropZoneDragLeave = useCallback((e: DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) {
      return;
    }
    setDragActive(false);
  }, []);

  return (
    <div className={wb.page}>
      <Link href={hubBackHref} className={wb.backNav} aria-label="Back">
        <img src="/assets/images/redarrowithoutbg.png" alt="" width={24} height={24} className={wb.backNavImg} decoding="async" />
      </Link>
      <main className={wb.main}>
        <section className={wb.split}>
          <div>
            <article className={wb.panel}>
              <h2 className={wb.panelTitle}>Chatbot Configuration</h2>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-name">
                  Chatbot Name
                </label>
                <input
                  id="cb-name"
                  className={wb.input}
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder={PLACEHOLDER_NAME}
                  autoComplete="off"
                />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-tone">
                  Personality &amp; Tone
                </label>
                <input
                  id="cb-tone"
                  className={wb.input}
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder={PLACEHOLDER_PERSONALITY}
                  autoComplete="off"
                />
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Add Knowledge Base</h2>
              <div className={wb.btnRow2}>
                <button
                  type="button"
                  className={`${wb.btnGhost} ${knowledgeMode === "files" ? wb.btnGhostActive : ""}`}
                  onClick={() => setKnowledgeMode("files")}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  className={`${wb.btnGhost} ${knowledgeMode === "text" ? wb.btnGhostActive : ""}`}
                  onClick={() => setKnowledgeMode("text")}
                >
                  Enter Text
                </button>
              </div>

              {knowledgeMode === "files" ? (
                <>
                  <div
                    className={`${wb.dropZone} ${wb.dropZoneInteractive} ${dragActive ? wb.dropZoneDragging : ""}`}
                    onDragEnter={onDropZoneDragEnter}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragLeave={onDropZoneDragLeave}
                  >
                    <div className={wb.dropZoneVisual}>
                      <div className={wb.dropZoneIcon}>⇪</div>
                      <div className={wb.dropZoneTitle}>Upload your data files</div>
                      <div className={wb.dropZoneHint}>Drop files here or click this area to browse. PDF, TXT, CSV, DOCX.</div>
                      <span className={wb.dropZoneCue}>Choose files</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      id={fileInputId}
                      type="file"
                      className={wb.dropZoneNativeFile}
                      accept={ACCEPT}
                      multiple
                      onChange={onInputChange}
                      aria-label="Upload knowledge files (PDF, TXT, CSV, DOCX)"
                    />
                  </div>
                  {files.length > 0 ? (
                    <ul className={wb.fileList} aria-label="Selected files">
                      {files.map((file) => {
                        const key = fileKey(file);
                        return (
                          <li key={key} className={wb.fileRow}>
                            <span>
                              {file.name}
                              <span className={wb.fileMeta}> ({(file.size / 1024).toFixed(1)} KB)</span>
                            </span>
                            <button type="button" className={wb.fileRemove} onClick={() => removeFile(key)} aria-label={`Remove ${file.name}`}>
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
                  <label className={wb.label} htmlFor="cb-knowledge-text">
                    Knowledge text
                  </label>
                  <textarea
                    id="cb-knowledge-text"
                    className={wb.textarea}
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder="Paste or type product info, FAQs, policies, etc. The more detail, the better answers your bot can give."
                    rows={8}
                  />
                  <p className={wb.kbHint}>{knowledgeText.length} characters</p>
                </div>
              )}

              <Link href="/chatbot-builder/trained" className={`${wb.btnBlack} ${wb.linkAsBtn} ${wb.btnTop}`}>
                Train Chatbot
              </Link>
            </article>
          </div>

          <article className={wb.previewShell}>
            <img className={wb.previewGif} src={PREVIEW_WAIT_GIF} alt="" width={800} height={600} decoding="async" />
            <div className={wb.previewScrim} aria-hidden />
            <div className={wb.previewMessage}>
              <h3 className={wb.previewHeading}>Your chatbot will appear here</h3>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
