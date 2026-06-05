/** Grayscale design tokens for the superadmin dashboard (matches product palette). */
export const SUPERADMIN_PALETTE = {
  base: "#FFFFFF",
  50: "#FAFAFA",
  100: "#F5F5F5",
  200: "#E5E5E5",
  300: "#D4D4D4",
  400: "#A3A3A3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  950: "#0A0A0A",
} as const;

export type SuperadminTabId = "users" | "websites" | "chatbots" | "integrations";

export type SuperadminTabDef = {
  id: SuperadminTabId;
  title: string;
  description: string;
  href: string;
  swatch: keyof typeof SUPERADMIN_PALETTE;
};

export const SUPERADMIN_TABS: SuperadminTabDef[] = [
  {
    id: "users",
    title: "Users",
    description: "Accounts signed in across the platform",
    href: "/superadmin/users",
    swatch: 700,
  },
  {
    id: "websites",
    title: "Websites",
    description: "All websites — create, edit, and remove",
    href: "/superadmin/websites",
    swatch: 500,
  },
  {
    id: "chatbots",
    title: "Chatbots",
    description: "Chatbot records and lifecycle",
    href: "/superadmin/chatbots",
    swatch: 600,
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Chatbot ↔ website connections",
    href: "/superadmin/integrations",
    swatch: 800,
  },
];
