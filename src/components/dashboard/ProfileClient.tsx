"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dashboardBotHub,
  dashboardIntegrationHub,
  dashboardWebsiteHub,
} from "../../lib/dashboard-app-hubs";
import { logoutAndRedirectHome } from "../../lib/auth-api";
import { fetchDashboardPayload } from "../../lib/fetch-dashboard";
import type { DashboardUser } from "../../lib/dashboard-types";
import {
  NEXA_PROFILE_ICON_SEED_EMAIL_KEY,
  profileIconSeedFromUser,
  userProfileIconPathForSeed,
} from "../../lib/user-profile-icon";
import css from "./profile-dashboard.module.css";

function profileUsername(u: DashboardUser | null): string {
  const dn = u?.displayName?.trim();
  if (dn) return dn;
  const em = u?.email?.trim();
  if (em) {
    const local = em.split("@")[0]?.trim();
    return local || em;
  }
  return "User";
}

function displayHeadingName(u: DashboardUser | null): string {
  return u?.displayName?.trim() || profileUsername(u);
}

function ArrowNE({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" aria-hidden={true}>
      <path
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        d="M7 17L17 7M9 7h8v8"
      />
    </svg>
  );
}

export function ProfileClient() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Read after mount so SSR + hydration match (localStorage is not on the server). */
  const [lastLoginEmail, setLastLoginEmail] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    await logoutAndRedirectHome();
  }, []);

  useEffect(() => {
    try {
      const raw = globalThis.localStorage?.getItem(NEXA_PROFILE_ICON_SEED_EMAIL_KEY)?.trim();
      setLastLoginEmail(raw ? raw.toLowerCase() : null);
    } catch {
      setLastLoginEmail(null);
    }
  }, []);

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

  const headingName = useMemo(() => displayHeadingName(user), [user]);

  const profileIconSrc = useMemo(() => {
    const seed = profileIconSeedFromUser(user, lastLoginEmail);
    return userProfileIconPathForSeed(seed);
  }, [user, lastLoginEmail]);

  return (
    <div className={css.page}>
      <div className={css.topChrome}>
        <Link href="/dashboard">
          Dashboard
        </Link>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </div>

      {loading ? <p className={css.status}>Loading…</p> : null}
      {error ? (
        <p className={`${css.status} ${css.error}`} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <h1 className={css.srOnly}>Profile</h1>
          <div className={css.stageArea}>
            <div className={css.stage}>
              <div className={css.centralWrap}>
                <div className={css.heroShell} aria-label={`Profile: ${headingName}`}>
                  <div className={css.profileHeroAvatar}>
                    <img
                      key={profileIconSrc}
                      src={profileIconSrc}
                      alt=""
                      className={css.profileHeroImg}
                      width={172}
                      height={172}
                      decoding="async"
                    />
                  </div>
                </div>
              </div>

              <Link
                href={dashboardWebsiteHub}
                className={`${css.card} ${css.cardWebsites}`}
                aria-label="Open websites — Web Verse"
              >
                <div className={css.cardWebsitesHero}>
                  <h2 className={css.webVerseBigName}>WEB VERSE</h2>
                </div>
              </Link>

              <Link
                href={dashboardBotHub}
                className={`${css.card} ${css.cardBots}`}
                aria-label="Open bots — Bot Vault"
              >
                <div className={`${css.cardHeader} ${css.cardBotsHeader}`}>
                  <ArrowNE className={css.cardArrow} stroke="rgba(248,250,252,0.9)" />
                </div>
                <div className={css.cardBotsHero}>
                  <h2 className={css.botVaultBigName}>BOT VAULT</h2>
                </div>
                <div className={css.cardFooter}>
                  <span className={css.miniAvatar} aria-hidden>
                    <img
                      key={profileIconSrc}
                      src={profileIconSrc}
                      alt=""
                      className={css.miniAvatarImg}
                      width={24}
                      height={24}
                      decoding="async"
                    />
                  </span>
                  <span className={css.footerName}>{headingName}</span>
                  <span className={css.footerPct}>76%</span>
                </div>
              </Link>

              <Link
                href={dashboardIntegrationHub}
                className={`${css.card} ${css.cardIntegrations}`}
                aria-label="Open integrations — Integration Vault"
              >
                <div className={`${css.cardHeader} ${css.cardIntegrationsHeader}`}>
                  <ArrowNE className={css.cardArrow} stroke="#0f172a" />
                </div>
                <div className={css.cardIntegrationsHero}>
                  <h2 className={css.integrationVaultBigName}>INTEGRATION VAULT</h2>
                </div>
                <div className={css.cardFooter}>
                  <span className={css.miniAvatar} aria-hidden>
                    <img
                      key={profileIconSrc}
                      src={profileIconSrc}
                      alt=""
                      className={css.miniAvatarImg}
                      width={24}
                      height={24}
                      decoding="async"
                    />
                  </span>
                  <span className={css.footerName}>{headingName}</span>
                </div>
              </Link>
            </div>
          </div>
          <div className={css.brandFooter}>NEXA</div>
        </>
      ) : null}
    </div>
  );
}
