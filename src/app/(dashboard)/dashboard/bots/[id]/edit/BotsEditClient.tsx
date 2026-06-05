"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PlatformToast } from "../../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import styles from "../../../../../../components/chatbot/chatbot-platform.module.css";
import {
  fetchPlatformBot,
  ingestPlatformDocument,
  ingestPlatformUrl,
  updatePlatformBot,
} from "../../../../../../lib/chatbot/chatbot-platform-api";
import {
  buildBotDescription,
  PERSONALITY_PRESETS,
  type PersonalityPresetId,
} from "../../../../../../lib/chatbot/personality-presets";
import { INGEST_ACCEPT, INGEST_HINT, isIngestableFile, textFileFromString } from "../../../../../../lib/chatbot/ingest-files";
import { setActiveBot } from "../../../../../../lib/chatbot/session-storage";

type BotsEditClientProps = { botId: string };

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BotsEditClient({ botId }: BotsEditClientProps) {
  const { toast, showSuccess, showError } = usePlatformToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [presetId, setPresetId] = useState<PersonalityPresetId>("friendly");
  const [extraUrls, setExtraUrls] = useState<string[]>([""]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [customText, setCustomText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bot = await fetchPlatformBot(botId);
      setName(bot.name);
      setWelcomeMessage(bot.config?.welcomeMessage ?? "Hi! How can I help you today?");
      setPrimaryColor(bot.config?.primaryColor ?? "#6366f1");
      if (bot.config?.personalityPreset) setPresetId(bot.config.personalityPreset);
      const desc = bot.description ?? "";
      const purposeMatch = desc.match(/Purpose:\s*([\s\S]+)$/);
      setPurpose(purposeMatch?.[1]?.trim() ?? desc);
      setActiveBot(bot.id, bot.name);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Chatbot unavailable.");
    } finally {
      setLoading(false);
    }
  }, [botId, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updatePlatformBot(botId, {
        name: name.trim(),
        description: buildBotDescription(purpose, presetId),
        config: { welcomeMessage, primaryColor, personalityPreset: presetId },
      });
      for (const f of extraFiles.filter(isIngestableFile)) {
        await ingestPlatformDocument(botId, f);
      }
      for (const url of extraUrls.map((u) => u.trim()).filter(isValidUrl)) {
        await ingestPlatformUrl(botId, url);
      }
      if (customText.trim()) {
        await ingestPlatformDocument(botId, textFileFromString(customText.trim()));
      }
      showSuccess("Changes saved.");
      setExtraFiles([]);
      setExtraUrls([""]);
      setCustomText("");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.skeleton} style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <DashboardStyleBackNav href="/dashboard/bots" ariaLabel="Back" />
      <PlatformToast toast={toast} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Edit chatbot</h1>
          <p className={styles.sub}>Update how your assistant sounds and add more knowledge.</p>
        </header>

        <section className={styles.card}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>What should it help users with?</label>
            <textarea className={styles.textarea} rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} disabled={saving} />
          </div>
          <div className={styles.presetGrid}>
            {PERSONALITY_PRESETS.map((p: (typeof PERSONALITY_PRESETS)[number]) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.presetChip} ${presetId === p.id ? styles.presetChipActive : ""}`}
                onClick={() => setPresetId(p.id)}
                disabled={saving}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Welcome message</label>
            <input className={styles.input} value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} disabled={saving} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Brand color</label>
            <input type="color" className={styles.colorInput} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={saving} />
          </div>
        </section>

        <section className={`${styles.card}`} style={{ marginTop: "1.25rem" }}>
          <h2 className={styles.cardTitle}>Add more knowledge</h2>
          <p className={styles.hint}>{INGEST_HINT}</p>
          <input
            type="file"
            accept={INGEST_ACCEPT}
            multiple
            disabled={saving}
            onChange={(e) => {
              if (e.target.files?.length) setExtraFiles(Array.from(e.target.files));
            }}
          />
          {extraUrls.map((url, i) => (
            <div key={i} className={styles.urlRow}>
              <input
                className={styles.input}
                type="url"
                placeholder="https://…"
                value={url}
                onChange={(e) => {
                  const next = [...extraUrls];
                  next[i] = e.target.value;
                  setExtraUrls(next);
                }}
                disabled={saving}
              />
            </div>
          ))}
          <button type="button" className={styles.btnSecondary} onClick={() => setExtraUrls((p) => [...p, ""])} disabled={saving}>
            Add URL
          </button>
          <textarea
            className={styles.textarea}
            placeholder="Optional custom knowledge text…"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            disabled={saving}
            style={{ marginTop: "0.75rem" }}
          />
        </section>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.btnPrimary} style={{ width: "auto" }} disabled={saving} onClick={() => void onSave()}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href="/chatbot-testing" className={styles.btnSecondary}>
            Test chatbot
          </Link>
        </div>
      </div>
    </div>
  );
}
