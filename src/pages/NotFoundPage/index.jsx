import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

export const NotFoundPage = () => {
  return (
    <main className={styles.page}>
      <span className={styles.code} aria-hidden="true">404</span>
      <h1 className={styles.heading}>Página não encontrada</h1>
      <p className={styles.sub}>
        O endereço que você acessou não existe ou foi removido.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.btnPrimary}>
          Voltar pro Início
        </Link>
        <Link to="/cardapio" className={styles.btnSecondary}>
          Ver Cardápio
        </Link>
      </div>
    </main>
  );
};
