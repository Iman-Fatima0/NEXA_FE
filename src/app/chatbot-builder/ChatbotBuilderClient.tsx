"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import wb from "../website-builder/website-builder.module.css";
import { createBot, ingestDocument, updateBot } from "../../lib/chatbot/chatbot-builder-api";
import { INGEST_ACCEPT, INGEST_HINT, isIngestableFile, textFileFromString } from "../../lib/chatbot/ingest-files";
import { setActiveBot } from "../../lib/chatbot/session-storage";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

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
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatbotName, setChatbotName] = useState("");
  const [personality, setPersonality] = useState("");
  const [knowledgeMode, setKnowledgeMode] = useState<"files" | "text">("files");
  const [files, setFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  const addFiles = useCallback((list: FileList | File[]) => {
    setFiles((prev) => {
      const next = [...prev];
      const seen = new Set(next.map(fileKey));
      for (const file of Array.from(list)) {
        if (!isIngestableFile(file)) continue;
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

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const list = input.files;
      if (list?.length) {
        setKnowledgeMode("files");
        addFiles(Array.from(list));
        input.value = "";
      }
      setDragActive(false);
    },
    [addFiles],
  );

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

  const onTrain = async () => {
    const name = chatbotName.trim();
    if (!name) {
      setTrainError("Enter a chatbot name.");
      return;
    }
    const hasFiles = knowledgeMode === "files" && files.length > 0;
    const hasText = knowledgeMode === "text" && knowledgeText.trim().length > 0;
    if (!hasFiles && !hasText) {
      setTrainError("Add at least one PDF/TXT file or knowledge text to ingest.");
      return;
    }

    setTraining(true);
    setTrainError(null);
    setTrainStatus("Creating bot…");

    try {
      const bot = await createBot(name);
      if (personality.trim()) {
        setTrainStatus("Saving personality…");
        await updateBot(bot.id, { description: personality.trim() });
      }

      const toIngest: File[] =
        knowledgeMode === "files" ? files.filter(isIngestableFile) : [textFileFromString(knowledgeText.trim())];

      for (let i = 0; i < toIngest.length; i++) {
        setTrainStatus(`Ingesting ${i + 1} of ${toIngest.length}: ${toIngest[i].name}…`);
        await ingestDocument(bot.id, toIngest[i]);
      }

      setActiveBot(bot.id, bot.name);
      router.push(`/chatbot-builder/trained?botId=${encodeURIComponent(bot.id)}`);
    } catch (e) {
      setTrainError(e instanceof Error ? e.message : "Training failed.");
      setTraining(false);
      setTrainStatus(null);
    }
  };

  return (
    <div className={wb.page}>
      <DashboardStyleBackNav href={hubBackHref} ariaLabel="Back" />
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
                  disabled={training}
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
                  disabled={training}
                />
                <p className={wb.kbHint}>Stored as bot description (PATCH /bots/:id).</p>
              </div>
            </article>

            <article className={`${wb.panel} ${wb.panelGap}`}>
              <h2 className={wb.panelTitle}>Add Knowledge Base</h2>
              <div className={wb.btnRow2}>
                <button
                  type="button"
                  className={`${wb.btnGhost} ${knowledgeMode === "files" ? wb.btnGhostActive : ""}`}
                  onClick={() => setKnowledgeMode("files")}
                  disabled={training}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  className={`${wb.btnGhost} ${knowledgeMode === "text" ? wb.btnGhostActive : ""}`}
                  onClick={() => setKnowledgeMode("text")}
                  disabled={training}
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
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files?.length) {
                        setKnowledgeMode("files");
                        addFiles(Array.from(e.dataTransfer.files));
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
                      disabled={training}
                      aria-label="Upload knowledge files (PDF, TXT)"
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
                            <button
                              type="button"
                              className={wb.fileRemove}
                              onClick={() => removeFile(key)}
                              disabled={training}
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
                  <label className={wb.label} htmlFor="cb-knowledge-text">
                    Knowledge text
                  </label>
                  <textarea
                    id="cb-knowledge-text"
                    className={wb.textarea}
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder="Paste or type product info, FAQs, policies, etc. Saved as knowledge.txt for ingest."
                    rows={8}
                    disabled={training}
                  />
                  <p className={wb.kbHint}>{knowledgeText.length} characters — uploaded as TXT on train.</p>
                </div>
              )}

              {trainError ? (
                <p className={wb.trainError} role="alert">
                  {trainError}
                </p>
              ) : null}
              {trainStatus ? <p className={wb.trainStatus}>{trainStatus}</p> : null}

              <button
                type="button"
                className={`${wb.btnBlack} ${wb.btnTop}`}
                disabled={training}
                onClick={() => void onTrain()}
              >
                {training ? "Training…" : "Train Chatbot"}
              </button>
            </article>
          </div>

          <article className={wb.previewShell}>
            <img className={wb.previewGif} src={PREVIEW_WAIT_GIF} alt="" width={800} height={600} decoding="async" />
            <div className={wb.previewScrim} aria-hidden />
            <div className={wb.previewMessage}>
              <h3 className={wb.previewHeading}>
                {training ? "Ingesting knowledge…" : "Your chatbot will appear here after training"}
              </h3>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
