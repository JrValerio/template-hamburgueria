import { MdClose } from "react-icons/md";
import styles from "./OfflineBanner.module.scss";

export function OfflineBanner({ onDismiss }) {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <strong className={styles.title}>Modo offline</strong>
      <span className={styles.text}>
        Exibindo dados locais. Algumas informações podem estar desatualizadas.
      </span>
      <button
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Fechar aviso offline"
        title="Fechar"
      >
        <MdClose size={16} />
      </button>
    </div>
  );
}
