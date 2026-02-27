import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.svg";
import { MdSearch, MdShoppingCart } from "react-icons/md";
import { SearchModal } from "./SearchModal";
import styles from "./Header.module.scss";

const NAV_LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/delivery", label: "Delivery" },
  { to: "/contato", label: "Contato" },
];

export const Header = ({ cartQuantity, onSearchSubmit, onCartClick, productList, onAddToCart }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearchModalOpen(true);
  };

  const navClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink to="/" aria-label="Início">
          <img src={Logo} alt="Logo Kenzie Burguer" className={styles.logo} />
        </NavLink>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.cartButton}
            onClick={onCartClick}
            aria-label={`Carrinho, ${cartQuantity} ${cartQuantity === 1 ? "item" : "itens"}`}
          >
            <MdShoppingCart size={21} />
            <span className={styles.cartCount}>{cartQuantity}</span>
          </button>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <button className={styles.mdButton} type="submit" aria-label="Buscar produto">
              <MdSearch size={21} />
            </button>
          </form>
        </div>
      </div>

      {isSearchModalOpen && (
        <SearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onSearchSubmit={onSearchSubmit}
          productList={productList}
          onAddToCart={onAddToCart}
        />
      )}
    </header>
  );
};
