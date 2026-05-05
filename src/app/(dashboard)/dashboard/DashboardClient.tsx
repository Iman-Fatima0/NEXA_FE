"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BotMiniIcon,
  IntegrationMiniIcon,
  ProfileMiniIcon,
  WebsiteMiniIcon,
} from "../../../components/auth/icons";
import { logoutAndRedirectHome } from "../../../lib/auth-api";
import {
  dashboardBotHub,
  dashboardIntegrationHub,
  dashboardWebsiteHub,
} from "../../../lib/dashboard-app-hubs";
import { fetchDashboardPayload } from "../../../lib/fetch-dashboard";
import type { DashboardUser } from "../../../lib/dashboard-types";
import {
  NEXA_PROFILE_ICON_SEED_EMAIL_KEY,
  profileIconSeedFromUser,
  userProfileIconPathForSeed,
} from "../../../lib/user-profile-icon";
import styles from "../../nexa-ss.module.css";

function greetingName(u?: DashboardUser): string {
  const dn = u?.displayName?.trim();
  if (dn) return dn;
  const em = u?.email?.trim();
  if (em) {
    const local = em.split("@")[0]?.trim();
    return local || em;
  }
  return "";
}

export default function DashboardClient() {
  /** Avoid flashing the dashboard shell before `/api/dashboard` confirms the session. */
  const [sessionReady, setSessionReady] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  /** Read after mount so SSR + hydration match (localStorage is not on the server). */
  const [lastLoginEmail, setLastLoginEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
        if (cancelled) return;
        setUser(data.user ?? null);
        const n = greetingName(data.user);
        setUserName(n || "there");
        setSessionReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message === "Unauthorized") {
          return;
        }
        setUser(null);
        setUserName("there");
        setSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const profileIconSrc = useMemo(
    () => userProfileIconPathForSeed(profileIconSeedFromUser(user, lastLoginEmail)),
    [user, lastLoginEmail],
  );

  const onLogout = useCallback(async () => {
    setLoggingOut(true);
    await logoutAndRedirectHome();
  }, []);

  const greetingText = useMemo(
    () => (userName === null ? "Hi , … u've been missed !" : `Hi , ${userName} u've been missed !`),
    [userName],
  );

  const welcomeTypingSteps = useMemo(() => Math.max(12, greetingText.length), [greetingText]);

  if (!sessionReady) {
    return (
      <div
        className={styles.dashboardLoopOnly}
        aria-busy="true"
        aria-label="Loading dashboard"
      />
    );
  }

  return (
    <div className={styles.dashboardLoopOnly}>
      <nav className={styles.dashboardAppLibraryCorner} aria-label="App library">
        <div className={styles.dashboardAppLibraryPulseWrap}>
          <span className={styles.dashboardAppLibraryRipple} aria-hidden />
          <span className={`${styles.dashboardAppLibraryRipple} ${styles.dashboardAppLibraryRippleDelay}`} aria-hidden />
          <div className={styles.dashboardAppLibraryShell}>
            <div className={styles.dashboardAppLibraryGrid2}>
              <span className={styles.dashboardIconHoverWrap}>
                <Link href="/profile" className={styles.dashboardAppLibraryCell} aria-label="Profile" prefetch={false}>
                  <ProfileMiniIcon className={styles.dashboardAppLibraryCellSvg} />
                </Link>
                <span
                  className={`${styles.dashboardIconHoverBubble} ${styles.dashboardIconHoverBubbleEast}`}
                  aria-hidden
                >
                  Profile
                </span>
              </span>
              <span className={styles.dashboardIconHoverWrap}>
                <Link
                  href={dashboardBotHub}
                  className={styles.dashboardAppLibraryCell}
                  aria-label="Bot and chatbots"
                  prefetch={false}
                >
                  <BotMiniIcon className={styles.dashboardAppLibraryCellSvg} />
                </Link>
                <span
                  className={`${styles.dashboardIconHoverBubble} ${styles.dashboardIconHoverBubbleEast}`}
                  aria-hidden
                >
                  Bot
                </span>
              </span>
              <span className={styles.dashboardIconHoverWrap}>
                <Link
                  href={dashboardWebsiteHub}
                  className={styles.dashboardAppLibraryCell}
                  aria-label="Website builder"
                  prefetch={false}
                >
                  <WebsiteMiniIcon className={styles.dashboardAppLibraryCellSvg} />
                </Link>
                <span
                  className={`${styles.dashboardIconHoverBubble} ${styles.dashboardIconHoverBubbleEast}`}
                  aria-hidden
                >
                  Website
                </span>
              </span>
              <span className={styles.dashboardIconHoverWrap}>
                <Link
                  href={dashboardIntegrationHub}
                  className={styles.dashboardAppLibraryCell}
                  aria-label="Integrations"
                  prefetch={false}
                >
                  <IntegrationMiniIcon className={styles.dashboardAppLibraryCellSvg} />
                </Link>
                <span
                  className={`${styles.dashboardIconHoverBubble} ${styles.dashboardIconHoverBubbleEast}`}
                  aria-hidden
                >
                  Integrations
                </span>
              </span>
            </div>
          </div>
        </div>
      </nav>
      <div className={styles.dashboardProfileCorner}>
        <div className={styles.dashboardProfileMenuWrap}>
          <span className={styles.dashboardProfileHoverWrap}>
            <button
              id="dashboard-profile-trigger"
              type="button"
              className={`${styles.dashboardProfileCornerLink} ${styles.dashboardProfileCornerTrigger}`}
              aria-label="Account"
              aria-haspopup="true"
              aria-controls="dashboard-profile-menu"
            >
              <img
                key={profileIconSrc}
                src={profileIconSrc}
                alt=""
                className={styles.dashboardProfileCornerAvatarImg}
                width={42}
                height={42}
                decoding="async"
              />
            </button>
            <span
              className={`${styles.dashboardIconHoverBubble} ${styles.dashboardIconHoverBubbleWest}`}
              aria-hidden
            >
              Account
            </span>
          </span>
          <div
            id="dashboard-profile-menu"
            role="menu"
            className={styles.dashboardProfileMenu}
            aria-labelledby="dashboard-profile-trigger"
          >
            <button
              type="button"
              role="menuitem"
              className={styles.dashboardProfileMenuSignOut}
              disabled={loggingOut}
              onClick={() => void onLogout()}
            >
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      </div>
      <img
        src="/assets/images/looppantagon.gif"
        alt=""
        className={styles.dashboardLoopOnlyImg}
        width={480}
        height={480}
        decoding="async"
      />
      <div className={styles.dashboardWelcomeCorner}>
        <div className={styles.dashboardWelcomeBubble}>
          <span
            className={styles.dashboardWelcomeTyping}
            style={
              {
                "--welcome-ch": welcomeTypingSteps,
                "--welcome-steps": welcomeTypingSteps,
              } as CSSProperties
            }
          >
            {greetingText}
          </span>
          <img
            src="/assets/images/pixelheart.svg"
            alt=""
            className={styles.dashboardWelcomeHeart}
            width={32}
            height={24}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
