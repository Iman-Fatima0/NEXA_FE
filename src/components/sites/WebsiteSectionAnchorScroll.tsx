"use client";

import { useEffect } from "react";

function scrollParentOf(el: HTMLElement): HTMLElement | Window {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return window;
}

function readHeaderOffsetPx(): number {
  const header = document.querySelector<HTMLElement>(".nexa-ws-header");
  return header ? Math.ceil(header.getBoundingClientRect().height) : 76;
}

function syncHeaderOffset() {
  const px = `${readHeaderOffsetPx()}px`;
  const page = document.querySelector<HTMLElement>(".nexa-site-page");
  page?.style.setProperty("--nexa-ws-header-offset", px);
  const header = document.querySelector<HTMLElement>(".nexa-ws-header");
  if (header) {
    const sp = scrollParentOf(header);
    if (sp instanceof HTMLElement) sp.style.scrollPaddingTop = px;
  }
  document.documentElement.style.scrollPaddingTop = px;
}

function scrollToAnchorId(id: string, behavior: ScrollBehavior = "smooth") {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = readHeaderOffsetPx();
  const top = target.getBoundingClientRect().top - offset;
  const sp = scrollParentOf(target);
  if (sp instanceof Window) {
    window.scrollBy({ top, behavior });
  } else {
    sp.scrollBy({ top, behavior });
  }
}

/** Sticky-header-aware in-page anchor scrolling (preview + public sites). */
export function WebsiteSectionAnchorScroll() {
  useEffect(() => {
    syncHeaderOffset();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncHeaderOffset())
        : null;
    const header = document.querySelector(".nexa-ws-header");
    if (ro && header) ro.observe(header);
    window.addEventListener("resize", syncHeaderOffset);

    const onClick = (e: MouseEvent) => {
      const root = (e.target as HTMLElement).closest(".nexa-site-page");
      if (!root) return;
      const anchor = (e.target as HTMLElement).closest("a[href^='#']");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const raw = anchor.getAttribute("href") ?? "";
      if (!raw.startsWith("#")) return;
      const id = raw.slice(1).trim();
      if (!id || id === "top") return;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToAnchorId(id, "smooth");
    };

    document.addEventListener("click", onClick, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", syncHeaderOffset);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
