import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdShoppingCart } from "react-icons/md";
import { CartItemCard } from "./CartItemCard";
import { useOutsideClick, useEscapePress } from "../../services/hooks";
import styles from "./CartModal.module.scss";

export const CartModal = ({
  cartList,
  setCartList,
  onClearCart,
  onClose,
}) => {
  const sidebarRef = useRef();
  const closeTimeoutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Trigger slide-in after mount (1 RAF frame to allow CSS transition)
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Animate out then unmount — ref prevents stale timeout closing a new instance
  const handleClose = () => {
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(onClose, 250);
  };

  useOutsideClick(sidebarRef, handleClose);
  useEscapePress(handleClose);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const total = cartList.reduce((acc, p) => acc + p.quantity * p.price, 0);

  const onIncrement = (productId) => {
    setCartList((prev) => {
      const next = prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cartList", JSON.stringify(next));
      return next;
    });
  };

  const onDecrement = (productId) => {
    setCartList((prev) => {
      const next = prev
        .map((item) => {
          if (item.id !== productId) return item;
          if (item.quantity <= 1) return null;
          return { ...item, quantity: item.quantity - 1 };
        })
        .filter(Boolean);
      localStorage.setItem("cartList", JSON.stringify(next));
      return next;
    });
  };

  const handleCheckout = () => {
    setCheckoutDone(true);
    setTimeout(() => {
      setCheckoutDone(false);
      handleClose();
    }, 1200);
  };

  const isEmpty = cartList.length === 0;

  return createPortal(
    <>
      <div
        className={`${styles.modalBackdrop} ${isVisible ? styles.backdropVisible : ""}`}
      />
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className={`${styles.cartSidebar} ${isVisible ? styles.cartSidebarOpen : ""}`}
      >
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>Carrinho de compras</h2>
          <button
            aria-label="Fechar carrinho"
            title="Fechar"
            className={styles.closeButton}
            onClick={handleClose}
          >
            <MdClose size={21} />
          </button>
        </div>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <MdShoppingCart size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Seu carrinho está vazio</p>
            <button className={styles.emptyCtaButton} onClick={handleClose}>
              Ver cardápio
            </button>
          </div>
        ) : (
          <>
            <ul role="list" className={styles.cartItems}>
              {cartList.map((product) => (
                <CartItemCard
                  key={product.id}
                  product={product}
                  onRemove={() => {
                    setCartList((prev) => {
                      const next = prev.filter((item) => item.id !== product.id);
                      localStorage.setItem("cartList", JSON.stringify(next));
                      return next;
                    });
                  }}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              ))}
            </ul>
            <div className={styles.cartFooter}>
              <div className={styles.cartTotal}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <button
                className={styles.checkoutButton}
                onClick={handleCheckout}
                disabled={checkoutDone}
              >
                {checkoutDone ? "Em breve..." : "Finalizar pedido"}
              </button>
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
          </>
        )}
      </div>
    </>,
    document.body
  );
};
