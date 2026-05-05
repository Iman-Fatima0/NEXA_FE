/**
 * Per-user profile icon from `usericon1.png` … `usericon15.png` in `public/assets/images/`.
 * Same identity → same icon (stable). Different emails / ids → different icons in practice.
 */

const USER_ICON_SLOT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

/** localStorage key: last successful login email (used when dashboard API omits `user.email`). */
export const NEXA_PROFILE_ICON_SEED_EMAIL_KEY = "nexa_profile_icon_seed_email";

const SEED_SALT = "nexa-avatar-v1";

export type ProfileIconUserLike = {
  id?: string;
  email?: string;
  displayName?: string;
} | null;

export function hashStringToUint32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function iconIndexFromSeed(seed: string): number {
  const h = hashStringToUint32(`${seed}\0${SEED_SALT}`);
  const mixed = h ^ (h >>> 16) ^ (h >>> 8);
  // JS `%` can be negative when `mixed` is signed; force unsigned before modulo.
  const u = mixed >>> 0;
  return u % USER_ICON_SLOT_IDS.length;
}

/** Stable icon URL for this seed string. */
export function userProfileIconPathForSeed(seed: string): string {
  const normalized = seed.trim().toLowerCase() || "guest";
  const idx = iconIndexFromSeed(normalized);
  const slot = USER_ICON_SLOT_IDS[idx] ?? 1;
  return `/assets/images/usericon${slot}.png`;
}

/** Remember login email so avatar can differ per account when `/api/dashboard` has no user block. */
export function rememberProfileIconSeedEmail(email: string): void {
  const e = email.trim().toLowerCase();
  if (!e || typeof globalThis === "undefined" || !("localStorage" in globalThis)) return;
  try {
    globalThis.localStorage.setItem(NEXA_PROFILE_ICON_SEED_EMAIL_KEY, e);
  } catch {
    /* quota / private mode */
  }
}

export function clearProfileIconSeedEmail(): void {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return;
  try {
    globalThis.localStorage.removeItem(NEXA_PROFILE_ICON_SEED_EMAIL_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Seed string for hashing. Pass `lastLoginEmail` from state that is filled in `useEffect`
 * so SSR + first client paint match (avoids hydration mismatch from reading localStorage during render).
 */
export function profileIconSeedFromUser(user: ProfileIconUserLike, lastLoginEmail?: string | null): string {
  const id = user?.id?.trim();
  if (id) return id;
  const em = user?.email?.trim().toLowerCase();
  const dn = user?.displayName?.trim().toLowerCase();
  if (em && dn) return `${em}\x1f${dn}`;
  if (em) return em;
  if (dn) return dn;
  const last = lastLoginEmail?.trim().toLowerCase();
  if (last) return last;
  return "guest";
}
