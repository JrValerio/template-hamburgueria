import { useState } from "react";
import Logo from "../../assets/Logo.svg";
import { MdSearch, MdShoppingCart } from "react-icons/md";
import { SearchModal } from "./SearchModal";
import styles from "./Header.module.scss";

export const Header = ({ cartQuantity, onSearchSubmit, onCartClick }) => {
  const [value, setValue] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearchModalOpen(true);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <img src={Logo} alt="Logo Kenzie Burguer" className={styles.logo} />
        <div className={styles.actions}>
          <div>
            <button className={styles.cartButton} onClick={onCartClick}>
              <MdShoppingCart size={21} />
              <span className={styles.cartCount}>{cartQuantity}</span>
            </button>
          </div>
          <div>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <input
                id="search"
                className={styles.searchInput}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button className={styles.mdButton} type="submit">
                <MdSearch size={21} />
              </button>
            </form>
          </div>
        </div>
      </div>
      {isSearchModalOpen && (
        <SearchModal
          onClose={handleCloseSearchModal}
          onSearchSubmit={onSearchSubmit}
        />
      )}
    </header>
  );
};
