"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { PlatformToast } from "../../../../../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../../../../../components/chatbot/usePlatformToast";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import { WidgetPreview } from "../../../../../../components/widget/WidgetPreview";
import { parsePlatformBot } from "../../../../../../lib/chatbot/bot-parse";
import {
  fetchPlatformBotRaw,
  publishPlatformBot,
  savePlatformBotTheme,
} from "../../../../../../lib/chatbot/chatbot-platform-api";
import { defaultBotTheme, parseBotTheme } from "../../../../../../lib/theme/parse-theme";
import {
  invalidateBotThemeCache,
  setBotThemeCache,
} from "../../../../../../lib/theme/use-bot-theme";
import { PRESET_META, PRESET_MAP, presetTokens, themeToOverrides } from "../../../../../../lib/theme/presets";
import type {
  AnimationStyle,
  BubbleShape,
  ChatPosition,
  HeaderStyle,
  LauncherStyle,
  ThemeFontFamily,
  ThemePreset,
  ThemeTokens,
} from "../../../../../../lib/theme/types";
import tb from "./theme-builder.module.css";

type BotThemeBuilderClientProps = { botId: string };

function patchTheme(prev: ThemeTokens, patch: Partial<ThemeTokens>): ThemeTokens {
  return { ...prev, ...patch };
}

export default function BotThemeBuilderClient({ botId }: Readonly<BotThemeBuilderClientProps>) {
  const { toast, showSuccess, showError } = usePlatformToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [botName, setBotName] = useState("My Bot");
  const [greeting, setGreeting] = useState("Hi! How can I help you today?");
  const [preset, setPreset] = useState<ThemePreset>("modern");
  const [theme, setTheme] = useState<ThemeTokens>(presetTokens("modern"));
  const [mobilePreview, setMobilePreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetchPlatformBotRaw(botId);
      const bot = parsePlatformBot(raw);
      if (!bot) throw new Error("Chatbot unavailable.");
      setBotName(bot.name);
      if (bot.config?.welcomeMessage) setGreeting(bot.config.welcomeMessage);

      const parsed = parseBotTheme(raw) ?? parseBotTheme({ primaryColor: bot.config?.primaryColor });
      if (parsed) {
        setPreset(parsed.preset);
        setTheme(parsed.theme);
      } else {
        const fallback = defaultBotTheme();
        if (bot.config?.primaryColor) {
          fallback.theme.primaryColor = bot.config.primaryColor;
        }
        setPreset(fallback.preset);
        setTheme(fallback.theme);
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not load bot theme.");
      const fallback = defaultBotTheme();
      setPreset(fallback.preset);
      setTheme(fallback.theme);
    } finally {
      setLoading(false);
    }
  }, [botId, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPresetSelect = (id: ThemePreset) => {
    setPreset(id);
    setTheme(PRESET_MAP[id]);
  };

  const onResetPreset = () => {
    setTheme(PRESET_MAP[preset]);
    showSuccess("Reset to preset defaults.");
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await savePlatformBotTheme(botId, {
        preset,
        overrides: themeToOverrides(theme, preset),
      });
      setBotThemeCache(botId, theme);
      showSuccess("Theme saved.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not save theme.");
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    try {
      await savePlatformBotTheme(botId, {
        preset,
        overrides: themeToOverrides(theme, preset),
      });
      setBotThemeCache(botId, theme);
      await publishPlatformBot(botId);
      invalidateBotThemeCache(botId);
      setBotThemeCache(botId, theme);
      showSuccess("Theme published — frozen into config snapshot.");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not publish theme.");
    } finally {
      setPublishing(false);
    }
  };

  const detailHref = `/dashboard/bots/${encodeURIComponent(botId)}`;

  return (
    <div className={tb.page}>
      <DashboardStyleBackNav href={detailHref} ariaLabel="Back to bot" />
      <PlatformToast toast={toast} />

      <div className={tb.topActions}>
        <Link href={detailHref} className={tb.topLink}>
          Bot detail
        </Link>
        <Link href={`/dashboard/bots/${encodeURIComponent(botId)}/publish`} className={tb.topLink}>
          Publish & embed
        </Link>
      </div>

      <main className={tb.main}>
        <header className={tb.header}>
          <h1 className={tb.title}>Theme builder</h1>
          <p className={tb.sub}>
            Customize your widget appearance. Preview updates instantly — nothing is sent to the server until you save.
          </p>
        </header>

        {loading ? (
          <p className={tb.loading}>Loading theme…</p>
        ) : (
          <div className={tb.split}>
            <aside className={tb.controls}>
              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Theme presets</h2>
                <div className={tb.presetGrid}>
                  {PRESET_META.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${tb.presetCard} ${preset === p.id ? tb.presetCardActive : ""}`}
                      style={{ "--card-accent": p.swatch } as CSSProperties}
                      onClick={() => onPresetSelect(p.id)}
                    >
                      <span className={tb.presetSwatch} style={{ background: p.previewBg }} />
                      <span className={tb.presetLabel}>{p.label}</span>
                      <span className={tb.presetDesc}>{p.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Colors</h2>
                <div className={tb.colorGrid}>
                  {(
                    [
                      ["primaryColor", "Primary"],
                      ["secondaryColor", "Secondary"],
                      ["textColor", "Text"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className={tb.colorField}>
                      <span className={tb.colorLabel}>{label}</span>
                      <input
                        type="color"
                        className={tb.colorInput}
                        value={theme[key]}
                        onChange={(e) => setTheme((t) => patchTheme(t, { [key]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Chat appearance</h2>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="bubble-shape">
                    Bubble shape
                  </label>
                  <select
                    id="bubble-shape"
                    className={tb.select}
                    value={theme.bubbleShape}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { bubbleShape: e.target.value as BubbleShape }))
                    }
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="header-style">
                    Header style
                  </label>
                  <select
                    id="header-style"
                    className={tb.select}
                    value={theme.headerStyle}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { headerStyle: e.target.value as HeaderStyle }))
                    }
                  >
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient</option>
                    <option value="glass">Glass</option>
                  </select>
                </div>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="launcher-style">
                    Launcher style
                  </label>
                  <select
                    id="launcher-style"
                    className={tb.select}
                    value={theme.launcherStyle}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { launcherStyle: e.target.value as LauncherStyle }))
                    }
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Layout</h2>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="chat-position">
                    Chat position
                  </label>
                  <select
                    id="chat-position"
                    className={tb.select}
                    value={theme.chatPosition}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { chatPosition: e.target.value as ChatPosition }))
                    }
                  >
                    <option value="bottom-right">Bottom right</option>
                    <option value="bottom-left">Bottom left</option>
                  </select>
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Typography</h2>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="font-family">
                    Font family
                  </label>
                  <select
                    id="font-family"
                    className={tb.select}
                    value={theme.fontFamily}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { fontFamily: e.target.value as ThemeFontFamily }))
                    }
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Animation</h2>
                <div className={tb.field}>
                  <label className={tb.label} htmlFor="animation">
                    Transition style
                  </label>
                  <select
                    id="animation"
                    className={tb.select}
                    value={theme.animation}
                    onChange={(e) =>
                      setTheme((t) => patchTheme(t, { animation: e.target.value as AnimationStyle }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="smooth">Smooth</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>
              </section>

              <section className={tb.panel}>
                <h2 className={tb.panelTitle}>Branding</h2>
                <div className={tb.toggleRow}>
                  <span className={tb.label} style={{ margin: 0 }}>
                    Show NEXA branding
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={theme.showBranding}
                    className={`${tb.toggle} ${theme.showBranding ? tb.toggleOn : ""}`}
                    onClick={() => setTheme((t) => patchTheme(t, { showBranding: !t.showBranding }))}
                  >
                    <span className={tb.toggleKnob} />
                  </button>
                </div>
              </section>

              <div className={tb.actions}>
                <button type="button" className={tb.btnGhost} onClick={onResetPreset}>
                  Reset to preset
                </button>
                <button type="button" className={tb.btnPrimary} disabled={saving} onClick={() => void onSave()}>
                  {saving ? "Saving…" : "Save theme"}
                </button>
                <button
                  type="button"
                  className={tb.btnPublish}
                  disabled={publishing}
                  onClick={() => void onPublish()}
                >
                  {publishing ? "Publishing…" : "Save & publish"}
                </button>
              </div>
            </aside>

            <div className={tb.previewCol}>
              <section className={tb.previewPanel}>
                <div className={tb.previewHead}>
                  <span className={tb.previewTitle}>Live preview</span>
                  <span className={tb.liveBadge}>Instant</span>
                </div>
                <button
                  type="button"
                  className={tb.btnGhost}
                  style={{ alignSelf: "flex-start", marginBottom: "0.5rem" }}
                  onClick={() => setMobilePreview((v) => !v)}
                >
                  {mobilePreview ? "Desktop preview" : "Mobile preview"}
                </button>
                <div className={tb.previewBody}>
                  <WidgetPreview
                    theme={theme}
                    botName={botName}
                    greeting={greeting}
                    mobile={mobilePreview}
                  />
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
