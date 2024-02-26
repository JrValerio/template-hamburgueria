import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import { CartItemCard } from "./CartItemCard";
import { useOutsideClick, useEscapePress } from "../../services/hooks";
import styles from "./CartModal.module.scss";

export const CartModal = ({
  cartList,
  setCartList,
  onRemoveItem,
  onClearCart,
  onClose,
}) => {
  const modalRef = useRef();

  useOutsideClick(modalRef, onClose);
  useEscapePress(onClose);

  useEffect(() => {
    document.body.classList.add(styles.bodyNoScroll);

    return () => {
      document.body.classList.remove(styles.bodyNoScroll);
    };
  }, []);

  const total = cartList.reduce((prevValue, product) => {
    return prevValue + product.quantity * product.price;
  }, 0);

  return (
    <>
      <div className={styles.modalBackdrop} />
      <div role="dialog" className={styles.cartModal} >
        <div className={styles.cartContent} ref={modalRef}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Carrinho de compras</h2>
            <button
              aria-label="Fechar"
              title="Fechar"
              className={styles.closeButton}
              onClick={onClose}
            >
              <MdClose size={21} />
            </button>
          </div>
          <ul className={styles.cartItems}>
            {cartList.map((product) => (
              <CartItemCard
                key={product.id}
                product={product}
                onRemove={() => {
                  const updatedCartList = cartList.filter(
                    (item) => item.id !== product.id
                  );
                  setCartList(updatedCartList);
                  onRemoveItem(product.id);
                }}
              />
            ))}
          </ul>
          <div className={styles.cartFooter}>
            <div className={styles.cartTotal}>
              <h3>Total</h3>
              <span>
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <button
              className={styles.clearButton}
              onClick={() => {
                setCartList([]);
                onClearCart();
              }}
            >
              Remover todos
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


