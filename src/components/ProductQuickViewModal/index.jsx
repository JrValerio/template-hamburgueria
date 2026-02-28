import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { useOutsideClick, useEscapePress } from "../../services/hooks";
import styles from "./ProductQuickViewModal.module.scss";

export const ProductQuickViewModal = ({ product, onAddToCart, onClose }) => {
  const modalRef = useRef();
  const closeTimeoutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade+scale-in after mount
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Animate out then unmount — ref prevents stale timeout on new instance
  const handleClose = () => {
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(onClose, 200);
  };

  useOutsideClick(modalRef, handleClose);
  useEscapePress(handleClose);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return createPortal(
    <>
      <div
        className={`${styles.backdrop} ${isVisible ? styles.backdropVisible : ""}`}
      />
      <div className={styles.wrapper}>
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className={`${styles.modal} ${isVisible ? styles.modalVisible : ""}`}
        >
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Fechar"
          >
            <MdClose size={20} />
          </button>

          {product.img && (
            <img
              src={product.img}
              alt={product.name}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          )}

          <div className={styles.body}>
            {product.category && (
              <p className={styles.category}>{product.category}</p>
            )}
            <h2 className={styles.name}>{product.name}</h2>
            {product.description && (
              <p className={styles.description}>{product.description}</p>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.price}>
              {product.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <button
              className={styles.addButton}
              onClick={() => {
                onAddToCart(product);
                handleClose();
              }}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
