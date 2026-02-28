import styles from "./Toast.module.scss";

export function Toast({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`${styles.toast} ${message ? styles.open : ""}`}
    >
      {message}
    </div>
  );
}
