"use client";

import styles from "../../nexa-ss.module.css";

export default function DashboardClient() {
  return (
    <div className={styles.dashboardLoopOnly}>
      <img
        src="/assets/images/looppantagon.gif"
        alt=""
        className={styles.dashboardLoopOnlyImg}
        width={480}
        height={480}
        decoding="async"
      />
    </div>
  );
}
