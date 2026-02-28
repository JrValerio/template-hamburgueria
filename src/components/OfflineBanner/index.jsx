import styles from "./OfflineBanner.module.scss";

export function OfflineBanner() {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <strong className={styles.title}>Modo offline</strong>
      <span className={styles.text}>
        Exibindo dados locais. Algumas informações podem estar desatualizadas.
      </span>
    </div>
  );
}
