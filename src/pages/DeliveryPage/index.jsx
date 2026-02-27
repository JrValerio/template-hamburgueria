import { Link } from "react-router-dom";
import styles from "./DeliveryPage.module.scss";

export const DeliveryPage = () => {
  return (
    <main className={styles.page}>
      <h1>Delivery</h1>
      <p className={styles.subtitle}>
        Entregamos na sua porta. Rápido, quente e no ponto certo.
      </p>
      <Link to="/cardapio" className={styles.cta}>
        Pedir agora
      </Link>
    </main>
  );
};
