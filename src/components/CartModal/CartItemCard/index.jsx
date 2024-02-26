import { MdDelete } from "react-icons/md";
import styles from "./CartItemCard.module.scss";

export const CartItemCard = ({ product, onRemove }) => {
  return (
    <li className={styles.cartItemCard}>
      <div className={styles.itemContainer}>
        <div className={styles.cartItemImg}>
          <img
            className={styles.itemImg}
            src={product.img}
            alt={product.name}
          />
        </div>
        <div className={styles.itemDetails}>
          <h3 className={styles.itemTitle}>{product.name}</h3>
          <p className={styles.itemQuantity}>Quantidade: {product.quantity}</p>
          <p className={styles.itemPrice}>
            Preço:{" "}
            {product.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className={styles.cartItemButton}>
          <button
            aria-label="Remover item"
            title="Remover item"
            onClick={() => onRemove(product.id)}
            className={styles.removeButton}
          >
            <MdDelete size={21} className={styles.icon} />
          </button>
        </div>
      </div>
    </li>
  );
};
