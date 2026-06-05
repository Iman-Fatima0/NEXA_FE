export type PersonalityPresetId =
  | "friendly"
  | "professional"
  | "customer_support"
  | "sales_assistant"
  | "technical_expert";

export type PersonalityPreset = {
  id: PersonalityPresetId;
  label: string;
  tone: string;
};

export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: "friendly",
    label: "Friendly",
    tone: "Warm, approachable, and conversational. Uses clear language and occasional light encouragement.",
  },
  {
    id: "professional",
    label: "Professional",
    tone: "Polished, concise, and respectful. Focuses on clarity and credibility.",
  },
  {
    id: "customer_support",
    label: "Customer Support",
    tone: "Patient, empathetic, and solution-oriented. Confirms understanding before suggesting next steps.",
  },
  {
    id: "sales_assistant",
    label: "Sales Assistant",
    tone: "Helpful and persuasive without being pushy. Highlights benefits and guides toward action.",
  },
  {
    id: "technical_expert",
    label: "Technical Expert",
    tone: "Precise and knowledgeable. Explains concepts step by step when needed.",
  },
];

export function presetById(id: PersonalityPresetId): PersonalityPreset {
  return PERSONALITY_PRESETS.find((p) => p.id === id) ?? PERSONALITY_PRESETS[0]!;
}

export function buildBotDescription(purpose: string, presetId: PersonalityPresetId): string {
  const preset = presetById(presetId);
  const purposeTrim = purpose.trim();
  const parts = [`Personality: ${preset.label}. ${preset.tone}`];
  if (purposeTrim) parts.push(`Purpose: ${purposeTrim}`);
  return parts.join("\n\n");
}
