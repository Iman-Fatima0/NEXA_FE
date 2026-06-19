"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "../../components/chatbot/ConfirmModal";
import { PlatformToast } from "../../components/chatbot/PlatformToast";
import { usePlatformToast } from "../../components/chatbot/usePlatformToast";
import { friendlyUserError } from "../../lib/api/friendly-user-error";
import DashboardStyleBackNav from "../../components/gallery/DashboardStyleBackNav";
import styles from "../../components/chatbot/chatbot-platform.module.css";
import { innovateChatbotEntry } from "../../lib/dashboard-app-hubs";
import {
  deletePlatformBot,
  fetchDocumentCount,
  listPlatformBots,
} from "../../lib/chatbot/chatbot-platform-api";
import { setActiveBot } from "../../lib/chatbot/session-storage";
import type { PlatformBot } from "../../lib/chatbot/bot-types";

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

type BotRow = PlatformBot & { documentCount: number };

export default function BotsDashboardClient() {
  const router = useRouter();
  const { toast, showSuccess, showError } = usePlatformToast();
  const [bots, setBots] = useState<BotRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BotRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await listPlatformBots();
      const withCounts = await Promise.all(
        list.map(async (b) => ({
          ...b,
          documentCount: b.documentCount ?? (await fetchDocumentCount(b.id)),
        })),
      );
      setBots(withCounts);
      setError(null);
    } catch (e) {
      setBots([]);
      setError(friendlyUserError(e, "Could not load your chatbots.", "generic"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePlatformBot(deleteTarget.id);
      showSuccess(`${deleteTarget.name} was removed.`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      showError(friendlyUserError(e, "Could not delete this chatbot.", "generic"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <DashboardStyleBackNav href="/dashboard" ariaLabel="Back to dashboard" />
      <PlatformToast toast={toast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete chatbot?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onDelete()}
      />

      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.h1}>My chatbots</h1>
          <p className={styles.sub}>Create, test, publish, and manage your AI assistants.</p>
          <Link href={innovateChatbotEntry} className={styles.btnPrimary} style={{ width: "auto", marginTop: "1rem" }}>
            Create chatbot
          </Link>
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        {bots === null ? (
          <div className={styles.botGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className={styles.empty}>
            <p>No chatbots yet. Create your first one to get started.</p>
            <Link href="/chatbot-builder/create" className={styles.btnPrimary} style={{ width: "auto", marginTop: "1rem" }}>
              Create your first chatbot
            </Link>
          </div>
        ) : (
          <div className={styles.botGrid}>
            {bots.map((bot) => (
              <article key={bot.id} className={styles.botCard}>
                <div className={styles.botCardHead}>
                  <h2 className={styles.botCardName}>{bot.name}</h2>
                  <span
                    className={`${styles.badge} ${bot.status === "published" ? styles.badgePublished : styles.badgeDraft}`}
                  >
                    {bot.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <p className={styles.botCardMeta}>
                  Updated {formatUpdated(bot.updatedAt ?? bot.createdAt)} · {bot.documentCount} document
                  {bot.documentCount === 1 ? "" : "s"}
                </p>
                <div className={styles.botCardActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setActiveBot(bot.id, bot.name);
                      router.push("/chatbot-testing");
                    }}
                  >
                    Test
                  </button>
                  <Link
                    href={`/dashboard/bots/${encodeURIComponent(bot.id)}/publish`}
                    className={styles.btnSecondary}
                  >
                    Publish
                  </Link>
                  <Link
                    href={`/dashboard/bots/${encodeURIComponent(bot.id)}/edit`}
                    className={styles.btnSecondary}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/bots/${encodeURIComponent(bot.id)}/analytics`}
                    className={styles.btnSecondary}
                  >
                    Analytics
                  </Link>
                  <button type="button" className={styles.btnDanger} onClick={() => setDeleteTarget(bot)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
