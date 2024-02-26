import styles from "./ProductCard.module.scss";

export const ProductCard = ({ product, onAddToCart }) => {
  const handleAddClick = () => {
    onAddToCart(product);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.productCard}>
        <img
          src={product.img}
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productCategory}>{product.category}</p>
          <p className={styles.productPrice}>
            {product.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
