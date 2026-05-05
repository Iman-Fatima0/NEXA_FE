type IconProps = Readonly<{ className?: string }>;

export function GoogleLogo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GitHubLogo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/** 2×2 app tiles — “library / launcher” glyph; uses `currentColor`. */
export function AppLibraryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" opacity={0.95} />
      <rect x="13" y="3" width="8" height="8" rx="1.5" opacity={0.95} />
      <rect x="3" y="13" width="8" height="8" rx="1.5" opacity={0.95} />
      <rect x="13" y="13" width="8" height="8" rx="1.5" opacity={0.95} />
    </svg>
  );
}

/** Compact user silhouette; uses `currentColor` — size via `className` / CSS. */
export function ProfileMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/** Chat / AI (GPT-style); uses `currentColor`. */
export function GptMiniIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    >
      <path d="M6.25 5.75h9.5a1.75 1.75 0 0 1 1.75 1.75v4.75a1.75 1.75 0 0 1-1.75 1.75h-3.9L8.25 18.25V14.5h-2a1.75 1.75 0 0 1-1.75-1.75V7.5a1.75 1.75 0 0 1 1.75-1.75z" />
      <circle cx="9.25" cy="10.25" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.25" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="14.75" cy="10.25" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Small robot / bot glyph for chatbot launcher; uses `currentColor`. */
export function BotMiniIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.75v2" />
      <circle cx="12" cy="2.25" r="0.85" fill="currentColor" stroke="none" />
      <rect x="6" y="5.25" width="12" height="9" rx="2.25" />
      <rect x="9.15" y="8.35" width="1.85" height="1.85" rx="0.35" fill="currentColor" stroke="none" />
      <rect x="13" y="8.35" width="1.85" height="1.85" rx="0.35" fill="currentColor" stroke="none" />
      <path d="M9.5 12.35h5" />
      <path d="M9 14.75h6v3.1a1.2 1.2 0 0 1-1.2 1.2h-3.6a1.2 1.2 0 0 1-1.2-1.2z" />
      <path d="M7.75 16.25H6.25v2.4h1.5M16.25 16.25H17.75v2.4h-1.5" />
    </svg>
  );
}

/** Simple browser / site window; uses `currentColor`. */
export function WebsiteMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9.5h17" />
      <circle cx="7" cy="7.25" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="7.25" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Plug / integration; uses `currentColor`. */
export function IntegrationMiniIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11V7a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v4" />
      <path d="M12.5 11V8.5A1.5 1.5 0 0 1 14 7h1a2 2 0 0 1 2 2v2" />
      <rect x="6" y="11" width="12" height="8" rx="2" />
      <path d="M10 19v2M14 19v2" />
    </svg>
  );
}

export function FacebookLogo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}
