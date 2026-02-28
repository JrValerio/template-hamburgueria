import styles from "./SkeletonCard.module.scss";

export const SkeletonCard = () => (
  <div className={styles.cardContainer} aria-hidden="true">
    <div className={styles.productCard}>
      <div className={styles.image} />
      <div className={styles.details}>
        <div className={styles.lineLong} />
        <div className={styles.lineShort} />
        <div className={styles.lineMid} />
        <div className={styles.button} />
      </div>
    </div>
  </div>
);
