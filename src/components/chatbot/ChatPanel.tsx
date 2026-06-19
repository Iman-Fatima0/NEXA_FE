"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import wb from "../../app/website-builder/website-builder.module.css";
import { friendlyUserError } from "../../lib/api/friendly-user-error";
import {
  fetchChatHistory,
  sendChatMessage,
  startChatSession,
  type ChatHistoryMessage,
} from "../../lib/chatbot/chatbot-builder-api";
import {
  fetchPublicChatHistory,
  sendPublicChatMessage,
  startPublicChatSession,
} from "../../lib/chatbot/public-chat-api";
import {
  clearPublicChatSessionId,
  getPublicChatSessionId,
  setPublicChatSessionId,
} from "../../lib/chatbot/public-session-storage";
import {
  clearChatSessionId,
  getChatSessionBotId,
  getChatSessionId,
  setChatSessionId,
} from "../../lib/chatbot/session-storage";
import { themeToCssVars } from "../../lib/theme/theme-vars";
import type { ThemeTokens } from "../../lib/theme/types";
import { useBotTheme } from "../../lib/theme/use-bot-theme";
import ct from "./chat-themed.module.css";

export type ChatUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  /** Authenticated dashboard preview */
  botId?: string;
  /** Public live embed (no login) */
  publicSlug?: string;
  botName: string;
  tall?: boolean;
  greeting?: string;
  savedTheme?: ThemeTokens | null;
  /** Fill viewport on public embed page */
  fullPage?: boolean;
  /** Server-composed chat bootstrap — skips session + history fetch on mount. */
  initialChat?: {
    sessionId: string;
    messages: ChatUiMessage[];
  } | null;
};

function mapHistory(messages: ChatHistoryMessage[]): ChatUiMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

function headerThemeClass(style: ThemeTokens["headerStyle"]): string {
  if (style === "glass") return ct.headerGlass;
  if (style === "gradient") return ct.headerGradient;
  return ct.headerSolid;
}

export function ChatPanel({
  botId,
  publicSlug,
  botName,
  tall = false,
  greeting,
  savedTheme,
  fullPage = false,
  initialChat = null,
}: ChatPanelProps) {
  const isPublic = Boolean(publicSlug?.trim());
  const themeKey = (publicSlug?.trim() || botId?.trim()) ?? "chat";
  const theme = useBotTheme(themeKey, savedTheme);
  const themeStyle = themeToCssVars(theme);
  const headerClass = headerThemeClass(theme.headerStyle);

  const serverChatHydrated = Boolean(initialChat?.sessionId && botId);
  const [messages, setMessages] = useState<ChatUiMessage[]>(() => {
    if (initialChat?.messages.length) return initialChat.messages;
    if (initialChat && greeting) {
      return [{ id: "greeting", role: "assistant", content: greeting }];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => initialChat?.sessionId ?? null);
  const [loading, setLoading] = useState(!serverChatHydrated);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const bootstrapSession = useCallback(async (): Promise<string> => {
    if (isPublic && publicSlug) {
      let sid = getPublicChatSessionId(publicSlug);
      if (!sid) {
        const started = await startPublicChatSession(publicSlug);
        sid = started.sessionId;
        setPublicChatSessionId(publicSlug, sid);
      }
      return sid;
    }
    if (!botId) throw new Error("Chat is unavailable.");
    let sid = getChatSessionId();
    const sessionBotId = getChatSessionBotId();
    if (!sid || sessionBotId !== botId) {
      clearChatSessionId();
      const started = await startChatSession(botId);
      sid = started.sessionId;
      setChatSessionId(sid, botId);
    }
    return sid;
  }, [botId, isPublic, publicSlug]);

  const loadHistory = useCallback(
    async (sid: string): Promise<ChatUiMessage[]> => {
      if (isPublic && publicSlug) {
        return mapHistory(await fetchPublicChatHistory(publicSlug, sid));
      }
      return mapHistory(await fetchChatHistory(sid));
    },
    [isPublic, publicSlug],
  );

  useEffect(() => {
    if (!botId && !publicSlug) return;

    if (serverChatHydrated && initialChat && botId) {
      setChatSessionId(initialChat.sessionId, botId);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const sid = await bootstrapSession();
        if (cancelled) return;
        setSessionId(sid);
        const mapped = await loadHistory(sid);
        if (cancelled) return;
        if (mapped.length === 0 && greeting) {
          setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
        } else {
          setMessages(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(friendlyUserError(e, "Chat is unavailable. Please try again.", "chat"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [botId, publicSlug, greeting, bootstrapSession, loadHistory, initialChat, serverChatHydrated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setSending(true);
    setError(null);
    setLastFailedText(null);
    setInput("");
    const optimisticId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: optimisticId, role: "user", content: text }]);
    try {
      const res =
        isPublic && publicSlug
          ? await sendPublicChatMessage(publicSlug, sessionId, text, true)
          : await sendChatMessage(sessionId, text, true);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        { id: optimisticId, role: "user", content: res.userMessage.content },
        { id: `assistant-${Date.now()}`, role: "assistant", content: res.assistantMessage.content },
      ]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(text);
      setLastFailedText(text);
      setError(friendlyUserError(e, "Message could not be sent. Please try again.", "chat"));
    } finally {
      setSending(false);
    }
  };

  const restartSession = () => {
    if (isPublic && publicSlug) {
      clearPublicChatSessionId(publicSlug);
    } else {
      clearChatSessionId();
    }
    setSessionId(null);
    setMessages([]);
    setLoading(true);
    void (async () => {
      try {
        const sid = await bootstrapSession();
        setSessionId(sid);
        if (greeting) {
          setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
        }
      } catch (e) {
        setError(friendlyUserError(e, "Could not restart chat.", "chat"));
      } finally {
        setLoading(false);
      }
    })();
  };

  const rootClass = fullPage ? `${wb.chatDark} ${ct.themedRoot} ${ct.themedFullPage}` : `${wb.chatDark} ${ct.themedRoot}`;

  return (
    <div className={rootClass} style={themeStyle}>
      <div className={`${wb.chatDarkHeader} ${headerClass}`}>
        {botName} · {loading ? "connecting…" : sending ? "typing…" : "online"}
        <button
          type="button"
          className={wb.chatRestartBtn}
          onClick={restartSession}
          disabled={loading || sending}
          title="Start a new conversation"
        >
          New chat
        </button>
      </div>
      {error ? (
        <div className={wb.chatError} role="alert">
          <p style={{ margin: 0 }}>{error}</p>
          {lastFailedText ? (
            <button
              type="button"
              className={wb.chatRetryBtn}
              style={{ marginTop: "0.5rem" }}
              onClick={() => {
                setInput(lastFailedText);
                setLastFailedText(null);
                setError(null);
              }}
            >
              Retry message
            </button>
          ) : (
            <button
              type="button"
              className={wb.chatRetryBtn}
              style={{ marginTop: "0.5rem" }}
              onClick={restartSession}
            >
              Try again
            </button>
          )}
        </div>
      ) : null}
      <div
        ref={bodyRef}
        className={`${wb.chatDarkBody} ${tall || fullPage ? wb.chatDarkBodyTall : ""}`}
        aria-live="polite"
      >
        {loading ? (
          <div className={`${wb.chatDarkBubble} ${ct.themedBubble}`}>Connecting…</div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${wb.chatDarkBubble} ${ct.themedBubble} ${
                  m.role === "user" ? `${wb.chatDarkBubbleUser} ${ct.themedBubbleUser}` : ""
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending ? (
              <div className={wb.typingDots} aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className={wb.chatComposeBar}>
        <input
          className={wb.input}
          type="text"
          placeholder="Type your message…"
          value={input}
          disabled={loading || !sessionId || sending}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          autoComplete="off"
        />
        <button
          type="button"
          className={`${wb.chatComposeSend} ${ct.themedSend}`}
          aria-label="Send message"
          disabled={loading || !sessionId || sending || !input.trim()}
          onClick={() => void onSend()}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
      <div
        className={`${ct.themedBranding} ${theme.showBranding ? "" : ct.themedBrandingHidden}`}
        aria-hidden={!theme.showBranding}
      >
        Powered by NEXA
      </div>
    </div>
  );
}
