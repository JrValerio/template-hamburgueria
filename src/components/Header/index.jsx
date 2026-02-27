import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.svg";
import { MdClose, MdMenu, MdSearch, MdShoppingCart } from "react-icons/md";
import { SearchModal } from "./SearchModal";
import { useEscapePress } from "../../services/hooks";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);

  useEscapePress(closeDrawer);

  useEffect(() => {
    if (!isDrawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  const desktopNavClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  const drawerNavClass = ({ isActive }) =>
    isActive ? `${styles.drawerLink} ${styles.drawerLinkActive}` : styles.drawerLink;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink to="/" aria-label="Início">
          <img src={Logo} alt="Logo Kenzie Burguer" className={styles.logo} />
        </NavLink>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopNavClass}>
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
          <form onSubmit={(e) => { e.preventDefault(); setIsSearchModalOpen(true); }} className={styles.searchForm}>
            <button className={styles.mdButton} type="submit" aria-label="Buscar produto">
              <MdSearch size={21} />
            </button>
          </form>
          <button
            className={styles.hamburger}
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-nav-drawer"
          >
            <MdMenu size={24} />
          </button>
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

      {isDrawerOpen &&
        createPortal(
          <>
            <div
              className={styles.drawerBackdrop}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <nav
              id="mobile-nav-drawer"
              className={styles.drawer}
              aria-label="Menu de navegação mobile"
            >
              <div className={styles.drawerHeader}>
                <img src={Logo} alt="Logo Kenzie Burguer" className={styles.drawerLogo} />
                <button
                  className={styles.drawerClose}
                  onClick={closeDrawer}
                  aria-label="Fechar menu"
                >
                  <MdClose size={21} />
                </button>
              </div>
              <ul className={styles.drawerLinks} role="list">
                {NAV_LINKS.map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={drawerNavClass}
                      onClick={closeDrawer}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </>,
          document.body
        )}
    </header>
  );
};
