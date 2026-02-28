import { MdDelete } from "react-icons/md";
import styles from "./CartItemCard.module.scss";

export const CartItemCard = ({ product, onRemove, onIncrement, onDecrement }) => {
  const subtotal = product.price * product.quantity;

  return (
    <li className={styles.cartItemCard}>
      {product.img ? (
        <img
          src={product.img}
          alt={product.name}
          className={styles.itemImg}
          loading="lazy"
        />
      ) : (
        <div className={styles.itemImg} role="presentation" aria-hidden="true" />
      )}
      <div className={styles.itemDetails}>
        <span className={styles.itemName}>{product.name}</span>
        <span className={styles.itemUnitPrice}>
          {product.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>
      <div className={styles.itemActions}>
        <span className={styles.itemSubtotal}>
          {subtotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <div className={styles.stepper}>
          <button
            className={styles.stepperBtn}
            onClick={() => onDecrement(product.id)}
            aria-label={`Diminuir quantidade de ${product.name}`}
          >
            −
          </button>
          <span
            className={styles.stepperCount}
            aria-label={`Quantidade: ${product.quantity}`}
          >
            {product.quantity}
          </span>
          <button
            className={styles.stepperBtn}
            onClick={() => onIncrement(product.id)}
            aria-label={`Aumentar quantidade de ${product.name}`}
          >
            +
          </button>
          <button
            className={styles.removeBtn}
            onClick={onRemove}
            aria-label={`Remover ${product.name} do carrinho`}
            title="Remover item"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </li>
  );
};
