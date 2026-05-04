"use client";

import { useEffect, useState } from "react";
import { fetchDashboardPayload } from "../../lib/fetch-dashboard";
import type { DashboardUser } from "../../lib/dashboard-types";
import styles from "../../app/nexa-ss.module.css";
import { DashboardHubLayout } from "./DashboardHubLayout";

export function ProfileClient() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardPayload();
        if (cancelled) {
          return;
        }
        setUser(data.user ?? null);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initial = (user?.displayName?.trim()?.[0] ?? user?.email?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <DashboardHubLayout
      title="My profile"
      lead="Personal and account details from your dashboard API. Extra fields appear here when your backend provides them."
    >
      {loading ? <p className={styles.dashboardSub}>Loading…</p> : null}
      {error ? (
        <p className={styles.hubError} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className={styles.profileGrid}>
          <section className={styles.profileHeroCard}>
            <div className={styles.profileAvatar} aria-hidden>
              {initial}
            </div>
            <div>
              <h2 className={styles.profileName}>{user?.displayName?.trim() || "Your name"}</h2>
              <p className={styles.profileEmail}>{user?.email?.trim() || "—"}</p>
            </div>
          </section>

          <section className={styles.profileCard}>
            <h3 className={styles.profileCardTitle}>Contact</h3>
            <dl className={styles.profileDl}>
              <div>
                <dt>Phone</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Organization</dt>
                <dd>—</dd>
              </div>
            </dl>
          </section>

          <section className={styles.profileCard}>
            <h3 className={styles.profileCardTitle}>Workspace</h3>
            <p className={styles.profileHint}>
              Company, billing, and security preferences will map from your API when those endpoints are connected.
            </p>
          </section>
        </div>
      ) : null}
    </DashboardHubLayout>
  );
}
