import styles from "./FeaturedOfferCard.module.scss";

export function FeaturedOfferCard({ offer, onAddToCart }) {
  const discount =
    offer.originalPrice > 0
      ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
      : 0;

  return (
    <article className={styles.card}>
      {offer.img && (
        <div className={styles.imageWrapper}>
          <img
            src={offer.img}
            alt={offer.name}
            className={styles.image}
            loading="lazy"
          />
          <span className={styles.badge} aria-label={`${discount}% de desconto`}>
            -{discount}%
          </span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.info}>
          <h2 className={styles.name}>{offer.name}</h2>
          <p className={styles.description}>{offer.description}</p>
        </div>

        <div className={styles.footer}>
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
        </div>
      </div>
    </article>
  );
}
