export type TrainStepId =
  | "creating"
  | "saving_settings"
  | "uploading_documents"
  | "processing_websites"
  | "training_knowledge"
  | "finalizing";

export const TRAIN_STEPS: { id: TrainStepId; label: string }[] = [
  { id: "creating", label: "Creating chatbot" },
  { id: "saving_settings", label: "Saving settings" },
  { id: "uploading_documents", label: "Uploading documents" },
  { id: "processing_websites", label: "Processing website content" },
  { id: "training_knowledge", label: "Training knowledge" },
  { id: "finalizing", label: "Finalizing" },
];

export function stepIndex(id: TrainStepId): number {
  return TRAIN_STEPS.findIndex((s) => s.id === id);
}
