import { useEffect, useState, useRef } from "react";
import { MdClose } from "react-icons/md";
import styles from "./SearchModal.module.scss";
import { useEscapePress, useOutsideClick } from "../../../services/hooks";

export const SearchModal = ({ onClose, onSearchSubmit }) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const modalContentRef = useRef(null);

  useEscapePress(onClose);
  useOutsideClick(modalContentRef, onClose);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchValue) {
        const results = await onSearchSubmit(searchValue);
        setSearchResults(results || []);
      } else {
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [searchValue, onSearchSubmit]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearchSubmit(searchValue);
      onClose();
    }
  };

  return (
    <div className={styles.searchModal}>
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
        />
      </div>
    </div>
  );
};


