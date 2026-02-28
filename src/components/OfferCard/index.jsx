import styles from "./OfferCard.module.scss";

export function OfferCard({ offer, onAddToCart }) {
  const discount = Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100
  );

  return (
    <article className={styles.card}>
      <span className={styles.badge} aria-label={`${discount}% de desconto`}>
        -{discount}%
      </span>

      <div className={styles.info}>
        <h2 className={styles.name}>{offer.name}</h2>
        <p className={styles.description}>{offer.description}</p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.prices}>
          <span className={styles.originalPrice}>
            R$ {offer.originalPrice.toFixed(2).replace(".", ",")}
          </span>
          <span className={styles.price}>
            R$ {offer.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <button
          className={styles.addButton}
          onClick={() => onAddToCart(offer)}
          aria-label={`Adicionar ${offer.name} ao carrinho`}
        >
          Adicionar
        </button>
      </footer>
    </article>
  );
}
