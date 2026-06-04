"use client";

import { useEffect, useState } from "react";
import styles from "../../app/(auth)/auth.module.css";
import {
  fetchOAuthProviders,
  startOAuthSignIn,
  type OAuthProvider,
} from "../../lib/auth/oauth";
import { FacebookLogo, GitHubLogo, GoogleLogo } from "./icons";

type Props = {
  mode: "login" | "register";
};

export function SocialAuthButtons({ mode }: Props) {
  const [enabled, setEnabled] = useState<Record<OAuthProvider, boolean>>({
    google: true,
    github: true,
    facebook: true,
  });

  useEffect(() => {
    void fetchOAuthProviders().then((status) => {
      if (status) {
        setEnabled({
          google: status.google,
          github: status.github,
          facebook: status.facebook,
        });
      }
    });
  }, []);

  const verb = mode === "register" ? "Sign up" : "Sign in";

  const buttons: Array<{
    provider: OAuthProvider;
    label: string;
    Icon: typeof GoogleLogo;
  }> = [
    { provider: "google", label: `${verb} with Google`, Icon: GoogleLogo },
    { provider: "github", label: `${verb} with GitHub`, Icon: GitHubLogo },
    { provider: "facebook", label: `${verb} with Facebook`, Icon: FacebookLogo },
  ];

  return (
    <div className={styles.socialRowCyberIconsOnly}>
      {buttons.map(({ provider, label, Icon }) => (
        <button
          key={provider}
          type="button"
          className={styles.socialPillCyberIcon}
          aria-label={label}
          disabled={!enabled[provider]}
          title={
            enabled[provider]
              ? label
              : `${provider} sign-in is not configured on the server`
          }
          onClick={() => startOAuthSignIn(provider)}
        >
          <Icon className={styles.socialIconLg} />
        </button>
      ))}
    </div>
  );
}
