"use client";

import Link from "next/link";
import nexa from "../../app/nexa-ss.module.css";

type DashboardStyleBackNavProps = Readonly<{
  href: string;
  ariaLabel?: string;
}>;

/** Matches the dashboard upper-left app library (ripples + frosted pill + soft blue pulse). */
export default function DashboardStyleBackNav({ href, ariaLabel = "Back to dashboard" }: DashboardStyleBackNavProps) {
  return (
    <nav className={nexa.dashboardHubBackNav} aria-label={ariaLabel}>
      <Link href={href} className={nexa.dashboardHubBackLink} aria-label={ariaLabel}>
        <div className={nexa.dashboardAppLibraryPulseWrap}>
          <span className={nexa.dashboardAppLibraryRipple} aria-hidden />
          <span className={`${nexa.dashboardAppLibraryRipple} ${nexa.dashboardAppLibraryRippleDelay}`} aria-hidden />
          <div className={nexa.dashboardAppLibraryShell}>
            <span className={nexa.dashboardHubBackGlyph} aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                <path
                  fill="currentColor"
                  d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </nav>
  );
}
