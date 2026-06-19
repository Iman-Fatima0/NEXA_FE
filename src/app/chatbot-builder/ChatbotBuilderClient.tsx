"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ChatPanel } from "../../components/chatbot/ChatPanel";
import { friendlyUserError } from "../../lib/api/friendly-user-error";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import wb from "../website-builder/website-builder.module.css";
import {
  createPlatformBot,
  ingestPlatformDocument,
  ingestPlatformUrl,
  updatePlatformBot,
} from "../../lib/chatbot/chatbot-platform-api";
import { INGEST_ACCEPT, INGEST_HINT, isIngestableFile, textFileFromString } from "../../lib/chatbot/ingest-files";
import {
  buildBotDescription,
  PERSONALITY_PRESETS,
  presetById,
  type PersonalityPresetId,
} from "../../lib/chatbot/personality-presets";
import { clearChatSessionId, setActiveBot, setBotTrainSummary } from "../../lib/chatbot/session-storage";
import { TRAIN_STEPS, type TrainStepId } from "../../lib/chatbot/train-steps";

const PREVIEW_WAIT_GIF = "/assets/images/redcirclesquare.gif";

const PLACEHOLDER_NAME = "e.g. Customer Support Assistant";
const PLACEHOLDER_PURPOSE =
  "Example: Answer product questions, help with bookings, and explain your return policy.";
const DEFAULT_WELCOME = "Hi! How can I help you today?";
const DEFAULT_COLOR = "#6366f1";

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function statusLabel(step: TrainStepId): string {
  return TRAIN_STEPS.find((s) => s.id === step)?.label ?? "Working…";
}

type ChatbotBuilderClientProps = Readonly<{
  hubBackHref: string;
}>;

type TrainedPreview = {
  botId: string;
  botName: string;
  greeting: string;
};

export default function ChatbotBuilderClient({ hubBackHref }: ChatbotBuilderClientProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatbotName, setChatbotName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [presetId, setPresetId] = useState<PersonalityPresetId>("friendly");

  const [knowledgeMode, setKnowledgeMode] = useState<"files" | "text">("files");
  const [files, setFiles] = useState<File[]>([]);
  const [knowledgeText, setKnowledgeText] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);

  const [dragActive, setDragActive] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);
  const [trainedPreview, setTrainedPreview] = useState<TrainedPreview | null>(null);

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
      const list = e.currentTarget.files;
      if (list?.length) {
        setKnowledgeMode("files");
        addFiles(Array.from(list));
        e.currentTarget.value = "";
      }
      setDragActive(false);
    },
    [addFiles],
  );

  const onDropZoneDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types?.includes("Files")) setDragActive(true);
  }, []);

  const onDropZoneDragLeave = useCallback((e: DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDragActive(false);
  }, []);

  const validUrls = urls.map((u) => u.trim()).filter(isValidUrl);

  const onTrain = async () => {
    const name = chatbotName.trim();
    if (!name) {
      setTrainError("Enter a chatbot name.");
      return;
    }
    if (!purpose.trim()) {
      setTrainError("Tell us what your chatbot should help users with.");
      return;
    }

    const hasFiles = files.length > 0;
    const hasText = knowledgeMode === "text" && knowledgeText.trim().length > 0;
    const hasUrls = validUrls.length > 0;
    if (!hasFiles && !hasText && !hasUrls) {
      setTrainError("Add at least one document, website URL, or knowledge text.");
      return;
    }

    setTraining(true);
    setTrainError(null);
    setTrainStatus(statusLabel("creating"));
    setTrainedPreview(null);
    clearChatSessionId();

    try {
      const bot = await createPlatformBot(name);

      const displayName = name.trim();
      setTrainStatus(statusLabel("saving_settings"));
      await updatePlatformBot(bot.id, {
        name: displayName,
        description: buildBotDescription(purpose, presetId),
        config: {
          welcomeMessage: welcomeMessage.trim() || DEFAULT_WELCOME,
          primaryColor,
          personalityPreset: presetId,
        },
      });

      const docFiles = files.filter(isIngestableFile);
      if (docFiles.length > 0) {
        setTrainStatus(statusLabel("uploading_documents"));
        for (let i = 0; i < docFiles.length; i++) {
          setTrainStatus(`${statusLabel("uploading_documents")} (${i + 1}/${docFiles.length})…`);
          await ingestPlatformDocument(bot.id, docFiles[i]!);
        }
      }

      if (validUrls.length > 0) {
        setTrainStatus(statusLabel("processing_websites"));
        for (let i = 0; i < validUrls.length; i++) {
          setTrainStatus(`${statusLabel("processing_websites")} (${i + 1}/${validUrls.length})…`);
          await ingestPlatformUrl(bot.id, validUrls[i]!);
        }
      }

      if (hasText) {
        setTrainStatus(statusLabel("training_knowledge"));
        await ingestPlatformDocument(bot.id, textFileFromString(knowledgeText.trim()));
      }

      setTrainStatus(statusLabel("finalizing"));

      const preset = presetById(presetId);
      setActiveBot(bot.id, displayName);
      setBotTrainSummary({
        name: displayName,
        personalityLabel: preset.label,
        purpose: purpose.trim(),
        fileCount: docFiles.length + (hasText ? 1 : 0),
        urlCount: validUrls.length,
        createdAt: new Date().toISOString(),
      });

      const greeting = welcomeMessage.trim() || DEFAULT_WELCOME;
      setTrainedPreview({ botId: bot.id, botName: displayName, greeting });
      setTraining(false);
      setTrainStatus(null);
    } catch (e) {
      setTrainError(friendlyUserError(e, "Training could not be completed. Please try again.", "train"));
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
                <label className={wb.label} htmlFor="cb-purpose">
                  What should your chatbot help users with?
                </label>
                <textarea
                  id="cb-purpose"
                  className={wb.textarea}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={PLACEHOLDER_PURPOSE}
                  rows={3}
                  disabled={training}
                />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-welcome">
                  Welcome Message
                </label>
                <input
                  id="cb-welcome"
                  className={wb.input}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  disabled={training}
                />
              </div>
              <div className={wb.field}>
                <label className={wb.label} htmlFor="cb-color">
                  Brand Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <input
                    id="cb-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={training}
                    style={{ width: 44, height: 36, border: "none", cursor: "pointer" }}
                    aria-label="Brand color"
                  />
                  <input
                    className={wb.input}
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={training}
                    aria-label="Brand color hex"
                  />
                </div>
              </div>
              <div className={wb.field}>
                <span className={wb.label}>Personality</span>
                <div className={wb.btnRow2} style={{ flexWrap: "wrap" }}>
                  {PERSONALITY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${wb.btnGhost} ${presetId === p.id ? wb.btnGhostActive : ""}`}
                      onClick={() => setPresetId(p.id)}
                      disabled={training}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
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
                    onDragOver={(e) => e.preventDefault()}
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
                      aria-label="Upload knowledge files"
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
                    Custom knowledge
                  </label>
                  <textarea
                    id="cb-knowledge-text"
                    className={wb.textarea}
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder="Paste or type product info, FAQs, policies, etc."
                    rows={8}
                    disabled={training}
                  />
                  <p className={wb.kbHint}>{knowledgeText.length} characters — added when you train.</p>
                </div>
              )}

              <div className={wb.field} style={{ marginTop: "1rem" }}>
                <span className={wb.label}>Website URLs</span>
                {urls.map((url, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      className={wb.input}
                      type="url"
                      placeholder="https://yoursite.com/help"
                      value={url}
                      onChange={(e) => {
                        const next = [...urls];
                        next[i] = e.target.value;
                        setUrls(next);
                      }}
                      disabled={training}
                    />
                    {urls.length > 1 ? (
                      <button
                        type="button"
                        className={wb.fileRemove}
                        disabled={training}
                        onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))}
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
                  disabled={training}
                  onClick={() => setUrls((prev) => [...prev, ""])}
                >
                  Add URL
                </button>
              </div>

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
                {training ? "Training…" : "Create My Chatbot"}
              </button>
            </article>
          </div>

          {trainedPreview ? (
            <article className={wb.previewPanel}>
              <div className={wb.previewHeader}>
                <span>Chatbot preview</span>
                <Link href="/chatbot-testing" className={wb.previewMeta}>
                  Full test →
                </Link>
              </div>
              <ChatPanel
                botId={trainedPreview.botId}
                botName={trainedPreview.botName}
                greeting={trainedPreview.greeting}
                tall
              />
            </article>
          ) : (
            <article className={wb.previewShell}>
              <img className={wb.previewGif} src={PREVIEW_WAIT_GIF} alt="" width={800} height={600} decoding="async" />
              <div className={wb.previewScrim} aria-hidden />
              <div className={wb.previewMessage}>
                <h3 className={wb.previewHeading}>
                  {training ? "Training your chatbot…" : "Your chatbot will appear here after training"}
                </h3>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
