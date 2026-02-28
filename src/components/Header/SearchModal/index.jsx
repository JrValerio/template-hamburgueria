import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdCheckCircle } from "react-icons/md";
import styles from "./SearchModal.module.scss";
import { useEscapePress, useOutsideClick } from "../../../services/hooks";

export const SearchModal = ({ onClose, onSearchSubmit, productList = [], onAddToCart = () => {} }) => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const inputRef = useRef(null);
  const modalContentRef = useRef(null);

  useEscapePress(onClose);
  useOutsideClick(modalContentRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(searchValue), 200);
    return () => clearTimeout(id);
  }, [searchValue]);

  // Filter locally from productList (name + category)
  useEffect(() => {
    const term = debouncedValue.trim().toLowerCase();
    if (term) {
      const results = productList.filter((p) => {
        const name = p.name?.toLowerCase() ?? "";
        const cat = p.category?.toLowerCase() ?? "";
        return name.includes(term) || cat.includes(term);
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [debouncedValue, productList]);

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      onSearchSubmit?.(searchValue);
      handleAddToCart(searchResults[0]);
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" className={styles.searchModal}>
      <div ref={modalContentRef} className={styles.searchContent}>
        <div className={styles.searchHeader}>
          <h2 className={styles.searchTitle}>Buscar Produto</h2>
          <button
            aria-label="Fechar"
            title="Fechar"
            className={styles.closeButton}
            onClick={onClose}
          >
            <MdClose size={21} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Digite sua busca..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={styles.searchInput}
          onKeyDown={handleKeyDown}
          aria-label="Buscar produto"
        />

        {searchValue.trim() && (
          <ul className={styles.resultsList} role="listbox">
            {searchResults.length === 0 ? (
              <li className={styles.emptyState}>Nenhum resultado encontrado</li>
            ) : (
              searchResults.slice(0, 6).map((product) => (
                <li key={product.id} className={styles.resultItem} role="option">
                  <img
                    src={product.img}
                    alt={product.name}
                    className={styles.resultImg}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{product.name}</span>
                    <span className={styles.resultCategory}>{product.category}</span>
                  </div>
                  <span className={styles.resultPrice}>
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <button
                    className={`${styles.addButton} ${addedId === product.id ? styles.added : ""}`}
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Adicionar ${product.name} ao carrinho`}
                  >
                    {addedId === product.id ? (
                      <MdCheckCircle size={20} />
                    ) : (
                      "+"
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
};
