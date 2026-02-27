import { NavLink } from "react-router-dom";
import styles from "./Footer.module.scss";

const NAV_LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/delivery", label: "Delivery" },
  { to: "/contato", label: "Contato" },
];

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.brandName}>🍔 Kenzie Burguer</span>
          <p className={styles.tagline}>Sabor que não tem fim.</p>
        </div>

        <nav className={styles.nav} aria-label="Links do rodapé">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <span>© {year} Kenzie Burguer. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
