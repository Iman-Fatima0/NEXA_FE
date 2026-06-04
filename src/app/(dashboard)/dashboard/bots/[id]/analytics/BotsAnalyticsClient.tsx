"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DashboardStyleBackNav from "../../../../../../components/gallery/DashboardStyleBackNav";
import styles from "../../../../../../components/chatbot/chatbot-platform.module.css";
import {
  fetchBotAnalyticsSummary,
  fetchBotUnansweredQuestions,
} from "../../../../../../lib/chatbot/chatbot-platform-api";
import type { AnalyticsSummary, UnansweredQuestion } from "../../../../../../lib/chatbot/bot-types";

type BotsAnalyticsClientProps = { botId: string };

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n <= 1 ? `${Math.round(n * 100)}%` : `${Math.round(n)}%`;
}

function MiniBars({ series, label }: { series?: { date: string; count: number }[]; label: string }) {
  if (!series?.length) return <p className={styles.hint}>No {label.toLowerCase()} data yet.</p>;
  const max = Math.max(...series.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginTop: 8 }}>
      {series.slice(-14).map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          style={{
            flex: 1,
            height: `${Math.max(8, (d.count / max) * 100)}%`,
            background: "linear-gradient(180deg, #818cf8, #4f46e5)",
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
}

export default function BotsAnalyticsClient({ botId }: BotsAnalyticsClientProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        fetchBotAnalyticsSummary(botId),
        fetchBotUnansweredQuestions(botId),
      ]);
      setSummary(s);
      setUnanswered(u);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analytics are not available right now.");
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.page}>
      <DashboardStyleBackNav href="/dashboard/bots" ariaLabel="Back" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Chatbot insights</h1>
          <p className={styles.sub}>See how customers engage and which questions need better answers.</p>
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        {loading ? (
          <div className={styles.skeleton} style={{ height: 180 }} />
        ) : (
          <>
            <div className={styles.analyticsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total conversations</div>
                <div className={styles.statValue}>{summary?.totalConversations ?? "—"}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total messages</div>
                <div className={styles.statValue}>{summary?.totalMessages ?? "—"}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Success rate</div>
                <div className={styles.statValue}>{pct(summary?.successRate)}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Avg. confidence</div>
                <div className={styles.statValue}>{pct(summary?.averageConfidence)}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Unanswered</div>
                <div className={styles.statValue}>{summary?.unansweredCount ?? unanswered.length}</div>
              </div>
            </div>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Daily conversations</h2>
              <MiniBars series={summary?.dailyConversations} label="Conversations" />
            </section>

            <section className={`${styles.card}`} style={{ marginTop: "1rem" }}>
              <h2 className={styles.cardTitle}>Daily messages</h2>
              <MiniBars series={summary?.dailyMessages} label="Messages" />
            </section>

            <section className={`${styles.card}`} style={{ marginTop: "1rem" }}>
              <h2 className={styles.cardTitle}>Questions to improve</h2>
              {unanswered.length === 0 ? (
                <p className={styles.hint}>No unanswered questions recorded yet.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Date</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unanswered.map((row, i) => (
                      <tr key={row.id ?? i}>
                        <td>{row.question}</td>
                        <td>{row.date ? new Date(row.date).toLocaleDateString() : "—"}</td>
                        <td>{row.confidence != null ? pct(row.confidence) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        <Link href="/dashboard/bots" className={styles.btnSecondary} style={{ marginTop: "1.25rem" }}>
          Back to My Chatbots
        </Link>
      </div>
    </div>
  );
}
