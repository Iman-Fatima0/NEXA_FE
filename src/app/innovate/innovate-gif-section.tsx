import styles from "./innovate.module.css";

export function InnovateGifSection() {
  return (
    <section id="innovate-gif" className={styles.gifSection} aria-label="Smile transition">
      <img src="/assets/images/smiletransition.gif" alt="" className={styles.gif} />
    </section>
  );
}
