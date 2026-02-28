import { useState, useRef, useEffect } from "react";
import { MdCheck } from "react-icons/md";
import styles from "./ProductCard.module.scss";

export const ProductCard = ({ product, onAddToCart, onOpen }) => {
  const [isAdded, setIsAdded] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleAddClick = () => {
    if (isAdded) return;
    onAddToCart(product);
    setIsAdded(true);
    timeoutRef.current = setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className={styles.cardContainer}>
      <div
        className={styles.productCard}
        onClick={onOpen ? () => onOpen(product) : undefined}
        onKeyDown={onOpen ? (e) => { if (e.currentTarget !== e.target) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(product); } } : undefined}
        tabIndex={onOpen ? 0 : undefined}
        role={onOpen ? "button" : undefined}
        aria-label={onOpen ? `Abrir detalhes de ${product.name}` : undefined}
        style={onOpen ? { cursor: "pointer" } : undefined}
      >
        <img
          src={product.img}
          alt={product.name}
          className={styles.productImage}
          loading="lazy"
          decoding="async"
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
            className={isAdded ? styles.addButtonAdded : styles.addButton}
            onClick={(e) => { e.stopPropagation(); handleAddClick(); }}
            aria-disabled={isAdded}
            aria-label={
              isAdded
                ? `${product.name} adicionado ao carrinho`
                : `Adicionar ${product.name} ao carrinho`
            }
          >
            {isAdded ? (
              <>
                <MdCheck size={16} />
                Adicionado
              </>
            ) : (
              "Adicionar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
