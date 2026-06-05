"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import wb from "../../app/website-builder/website-builder.module.css";
import {
  fetchChatHistory,
  sendChatMessage,
  startChatSession,
  type ChatHistoryMessage,
} from "../../lib/chatbot/chatbot-builder-api";
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
  botId: string;
  botName: string;
  /** Taller scroll area (testing page) */
  tall?: boolean;
  /** Optional greeting when history is empty */
  greeting?: string;
  /** Pre-loaded theme from bot fetch (skips extra request when provided) */
  savedTheme?: ThemeTokens | null;
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

export function ChatPanel({ botId, botName, tall = false, greeting, savedTheme }: ChatPanelProps) {
  const theme = useBotTheme(botId, savedTheme);
  const themeStyle = themeToCssVars(theme);
  const headerClass = headerThemeClass(theme.headerStyle);

  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let sid = getChatSessionId();
        const sessionBotId = getChatSessionBotId();
        if (!sid || sessionBotId !== botId) {
          clearChatSessionId();
          const started = await startChatSession(botId);
          sid = started.sessionId;
          setChatSessionId(sid, botId);
        }
        if (cancelled) return;
        setSessionId(sid);
        const history = await fetchChatHistory(sid);
        if (cancelled) return;
        const mapped = mapHistory(history);
        if (mapped.length === 0 && greeting) {
          setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
        } else {
          setMessages(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Chat is unavailable. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [botId, greeting]);

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
      const res = await sendChatMessage(sessionId, text, true);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticId),
        { id: optimisticId, role: "user", content: res.userMessage.content },
        { id: `assistant-${Date.now()}`, role: "assistant", content: res.assistantMessage.content },
      ]);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(text);
      setLastFailedText(text);
      setError(e instanceof Error ? e.message : "Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const restartSession = () => {
    clearChatSessionId();
    setSessionId(null);
    setMessages([]);
    setLoading(true);
    void (async () => {
      try {
        const started = await startChatSession(botId);
        setChatSessionId(started.sessionId, botId);
        setSessionId(started.sessionId);
        if (greeting) {
          setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not restart chat.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className={`${wb.chatDark} ${ct.themedRoot}`} style={themeStyle}>
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
        className={`${wb.chatDarkBody} ${tall ? wb.chatDarkBodyTall : ""}`}
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
