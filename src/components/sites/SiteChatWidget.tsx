"use client";

import { useState, type CSSProperties } from "react";
import { ChatPanel } from "../chatbot/ChatPanel";
import type { ChatIntegrationMeta } from "../../lib/integration/chat-integration";

type SiteChatWidgetProps = Readonly<{
  integration: ChatIntegrationMeta;
}>;

const POSITION_STYLE: Record<ChatIntegrationMeta["position"], CSSProperties> = {
  "bottom-right": { right: 20, bottom: 20 },
  "bottom-left": { left: 20, bottom: 20 },
  "top-right": { right: 20, top: 20 },
};

export function SiteChatWidget({ integration }: SiteChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const size = integration.widgetSize > 0 ? integration.widgetSize : 60;
  const pos = POSITION_STYLE[integration.position] ?? POSITION_STYLE["bottom-right"];

  if (!integration.showBubble) {
    return (
      <div
        style={{
          position: "fixed",
          zIndex: 2147482000,
          width: 380,
          maxWidth: "calc(100vw - 2rem)",
          height: 520,
          maxHeight: "calc(100vh - 2rem)",
          ...pos,
        }}
      >
        <ChatPanel publicSlug={integration.publicSlug} botName={integration.botName ?? "Chat"} tall />
      </div>
    );
  }

  return (
    <>
      {open ? (
        <div
          style={{
            position: "fixed",
            zIndex: 2147482000,
            width: 380,
            maxWidth: "calc(100vw - 2rem)",
            height: 520,
            maxHeight: "calc(100vh - 6rem)",
            ...pos,
          }}
        >
          <ChatPanel publicSlug={integration.publicSlug} botName={integration.botName ?? "Chat"} tall />
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          zIndex: 2147483000,
          width: size,
          height: size,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "#6366f1",
          color: "#fff",
          fontSize: Math.round(size * 0.42),
          boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
          ...pos,
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
