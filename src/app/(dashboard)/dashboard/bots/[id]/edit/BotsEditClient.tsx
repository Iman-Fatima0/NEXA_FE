"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlatformToast } from "../../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import cp from "../../../../../../components/chatbot/chatbot-platform.module.css";
import wb from "../../../../../website-builder/website-builder.module.css";
import type { PlatformBot } from "../../../../../../lib/chatbot/bot-types";
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
import { chatbotTestingHref, dashboardBotDetail } from "../../../../../../lib/dashboard-app-hubs";

type BotsEditClientProps = {
  botId: string;
  initialBot?: PlatformBot | null;
};

function readPurpose(description?: string | null): string {
  const desc = description ?? "";
  const purposeMatch = desc.match(/Purpose:\s*([\s\S]+)$/);
  return purposeMatch?.[1]?.trim() ?? desc;
}

function formFromBot(bot: PlatformBot | null | undefined) {
  if (!bot) {
    return {
      name: "",
      purpose: "",
      welcomeMessage: "Hi! How can I help you today?",
      primaryColor: "#6366f1",
      presetId: "friendly" as PersonalityPresetId,
    };
  }
  return {
    name: bot.name,
    purpose: readPurpose(bot.description),
    welcomeMessage: bot.config?.welcomeMessage ?? "Hi! How can I help you today?",
    primaryColor: bot.config?.primaryColor ?? "#6366f1",
    presetId: (bot.config?.personalityPreset ?? "friendly") as PersonalityPresetId,
  };
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BotsEditClient({ botId, initialBot = null }: BotsEditClientProps) {
  const { toast, showSuccess, showError } = usePlatformToast();
  const initialForm = useMemo(() => formFromBot(initialBot), [initialBot]);
  const detailHref = dashboardBotDetail(botId);
  const testHref = chatbotTestingHref(botId, detailHref);

  const [loading, setLoading] = useState(!initialBot);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialForm.name);
  const [purpose, setPurpose] = useState(initialForm.purpose);
  const [welcomeMessage, setWelcomeMessage] = useState(initialForm.welcomeMessage);
  const [primaryColor, setPrimaryColor] = useState(initialForm.primaryColor);
  const [presetId, setPresetId] = useState<PersonalityPresetId>(initialForm.presetId);
  const [extraUrls, setExtraUrls] = useState<string[]>([""]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [customText, setCustomText] = useState("");

  const applyBot = useCallback((bot: PlatformBot) => {
    const next = formFromBot(bot);
    setName(next.name);
    setPurpose(next.purpose);
    setWelcomeMessage(next.welcomeMessage);
    setPrimaryColor(next.primaryColor);
    setPresetId(next.presetId);
    setActiveBot(bot.id, bot.name);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bot = await fetchPlatformBot(botId);
      applyBot(bot);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Chatbot unavailable.");
    } finally {
      setLoading(false);
    }
  }, [applyBot, botId, showError]);

  useEffect(() => {
    if (initialBot) {
      setActiveBot(initialBot.id, initialBot.name);
      return;
    }
    void load();
  }, [initialBot, load]);

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

  return (
    <div className={`${wb.page} ${wb.botReviewPage}`}>
      <DashboardStyleBackNav href={detailHref} ariaLabel="Back to bot" />
      <PlatformToast toast={toast} />

      <main className={`${wb.main} ${wb.mainToolbarSpace}`}>
        <article className={wb.panel}>
          {loading ? (
            <div className={cp.skeleton} style={{ height: 200 }} />
          ) : (
            <>
              <h2 className={wb.panelTitle}>Edit chatbot</h2>
              <p className={wb.kbHint}>Update how your assistant sounds and add more knowledge.</p>

              <section className={wb.field}>
                <label className={wb.label} htmlFor="bot-edit-name">
                  Name
                </label>
                <input
                  id="bot-edit-name"
                  className={wb.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </section>

              <section className={wb.field}>
                <label className={wb.label} htmlFor="bot-edit-purpose">
                  What should it help users with?
                </label>
                <textarea
                  id="bot-edit-purpose"
                  className={wb.textarea}
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={saving}
                />
              </section>

              <div className={cp.presetGrid} style={{ marginBottom: "1rem" }}>
                {PERSONALITY_PRESETS.map((p: (typeof PERSONALITY_PRESETS)[number]) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${cp.presetChip} ${presetId === p.id ? cp.presetChipActive : ""}`}
                    onClick={() => setPresetId(p.id)}
                    disabled={saving}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <section className={wb.field}>
                <label className={wb.label} htmlFor="bot-edit-welcome">
                  Welcome message
                </label>
                <input
                  id="bot-edit-welcome"
                  className={wb.input}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  disabled={saving}
                />
              </section>

              <section className={wb.field}>
                <label className={wb.label} htmlFor="bot-edit-color">
                  Brand color
                </label>
                <input
                  id="bot-edit-color"
                  type="color"
                  className={cp.colorInput}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={saving}
                />
              </section>

              <h3 className={wb.panelTitle} style={{ fontSize: "1.1rem", marginTop: "1.5rem" }}>
                Add more knowledge
              </h3>
              <p className={wb.kbHint}>{INGEST_HINT}</p>
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
                <div key={i} className={wb.field}>
                  <input
                    className={wb.input}
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
              <button
                type="button"
                className={wb.btnGhost}
                onClick={() => setExtraUrls((p) => [...p, ""])}
                disabled={saving}
              >
                Add URL
              </button>
              <textarea
                className={wb.textarea}
                placeholder="Optional custom knowledge text…"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                disabled={saving}
                style={{ marginTop: "0.75rem" }}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className={wb.btnBlack}
                  style={{ width: "auto", flex: "1 1 12rem" }}
                  disabled={saving}
                  onClick={() => void onSave()}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <Link href={testHref} className={`${wb.btnGhost} ${wb.linkAsBtn}`} style={{ flex: "0 1 auto" }}>
                  Test chatbot
                </Link>
              </div>
            </>
          )}
        </article>
      </main>
    </div>
  );
}
