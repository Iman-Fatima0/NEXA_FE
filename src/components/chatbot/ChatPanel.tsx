"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import wb from "../../app/website-builder/website-builder.module.css";
import {
  fetchChatHistory,
  sendChatMessage,
  startChatSession,
  type ChatHistoryMessage,
} from "../../lib/chatbot/chatbot-builder-api";
import { clearChatSessionId, getChatSessionId, setChatSessionId } from "../../lib/chatbot/session-storage";

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

export function ChatPanel({ botId, botName, tall = false, greeting }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        if (!sid) {
          const started = await startChatSession(botId);
          sid = started.sessionId;
          setChatSessionId(sid);
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
          setError(e instanceof Error ? e.message : "Could not start chat.");
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
      setError(e instanceof Error ? e.message : "Send failed.");
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
        setChatSessionId(started.sessionId);
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
    <div className={wb.chatDark}>
      <div className={wb.chatDarkHeader}>
        {botName} · {loading ? "connecting…" : sending ? "typing…" : "online"}
        <button
          type="button"
          className={wb.chatRestartBtn}
          onClick={restartSession}
          disabled={loading || sending}
          title="Start a new chat session"
        >
          New session
        </button>
      </div>
      {error ? (
        <p className={wb.chatError} role="alert">
          {error}
        </p>
      ) : null}
      <div
        ref={bodyRef}
        className={`${wb.chatDarkBody} ${tall ? wb.chatDarkBodyTall : ""}`}
        aria-live="polite"
      >
        {loading ? (
          <div className={wb.chatDarkBubble}>Starting chat session…</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`${wb.chatDarkBubble} ${m.role === "user" ? wb.chatDarkBubbleUser : ""}`}
            >
              {m.content}
            </div>
          ))
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
          className={wb.chatComposeSend}
          aria-label="Send message"
          disabled={loading || !sessionId || sending || !input.trim()}
          onClick={() => void onSend()}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
