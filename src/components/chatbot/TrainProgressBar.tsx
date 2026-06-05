"use client";

import { TRAIN_STEPS, stepIndex, type TrainStepId } from "../../lib/chatbot/train-steps";
import styles from "./chatbot-platform.module.css";

type TrainProgressBarProps = {
  currentStep: TrainStepId;
  completedThrough: TrainStepId | null;
};

export function TrainProgressBar({ currentStep, completedThrough }: TrainProgressBarProps) {
  const currentIdx = stepIndex(currentStep);
  const doneIdx = completedThrough ? stepIndex(completedThrough) : -1;
  const pct = Math.round(((doneIdx + 1) / TRAIN_STEPS.length) * 100);

  return (
    <div className={`${styles.card} ${styles.progressCard}`}>
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${Math.max(pct, 8)}%` }} />
      </div>
      <ul className={styles.stepList}>
        {TRAIN_STEPS.map((step, i) => {
          const done = i <= doneIdx;
          const current = step.id === currentStep;
          return (
            <li
              key={step.id}
              className={`${styles.stepItem} ${done ? styles.stepDone : ""} ${current ? styles.stepCurrent : ""}`}
            >
              <span aria-hidden>{done ? "✓" : current ? "○" : "·"}</span>
              {step.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
