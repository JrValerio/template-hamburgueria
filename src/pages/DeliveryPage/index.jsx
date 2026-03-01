import { Link } from "react-router-dom";
import { MdAccessTime, MdDeliveryDining, MdLocationOn } from "react-icons/md";
import { STORE_HOURS } from "../../data/store";
import styles from "./DeliveryPage.module.scss";

const NEIGHBORHOODS = [
  "Centro",
  "Jardim América",
  "Vila Nova",
  "Santa Cecília",
  "Boa Vista",
  "São Judas",
  "Ipiranga",
  "Saúde",
];

export const DeliveryPage = () => {
  return (
    <main className={styles.page}>
      <h1>Delivery</h1>
      <p className={styles.subtitle}>
        Entregamos na sua porta. Rápido, quente e no ponto certo.
      </p>

      <div className={styles.infoGrid}>
        <section className={styles.card} aria-labelledby="hours-title">
          <div className={styles.cardHeader}>
            <MdAccessTime size={22} aria-hidden="true" />
            <h2 id="hours-title" className={styles.cardTitle}>
              Horários
            </h2>
          </div>
          <ul className={styles.list}>
            {STORE_HOURS.map(({ days, time }) => (
              <li key={days} className={styles.listItem}>
                <span className={styles.listLabel}>{days}</span>
                <span className={styles.listValue}>{time}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card} aria-labelledby="fee-title">
          <div className={styles.cardHeader}>
            <MdDeliveryDining size={22} aria-hidden="true" />
            <h2 id="fee-title" className={styles.cardTitle}>
              Taxa e prazo
            </h2>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listLabel}>Taxa de entrega</span>
              <span className={styles.listValue}>R$ 5,99</span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listLabel}>Pedido mínimo</span>
              <span className={styles.listValue}>R$ 25,00</span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listLabel}>Prazo estimado</span>
              <span className={styles.listValue}>30 – 50 min</span>
            </li>
            <li className={styles.listItem}>
              <span className={styles.listLabel}>Pagamento</span>
              <span className={styles.listValue}>Cartão ou Pix</span>
            </li>
          </ul>
          <div className={styles.ctaWrap}>
            <Link to="/cardapio" className={styles.cta}>
              Pedir agora
            </Link>
            <p className={styles.microCopy}>Você será levado ao cardápio</p>
          </div>
        </section>

        <section
          className={`${styles.card} ${styles.cardFull}`}
          aria-labelledby="area-title"
        >
          <div className={styles.cardHeader}>
            <MdLocationOn size={22} aria-hidden="true" />
            <h2 id="area-title" className={styles.cardTitle}>
              Área de cobertura
            </h2>
          </div>
          <ul className={styles.neighborhoods}>
            {NEIGHBORHOODS.map((n) => (
              <li key={n} className={styles.neighborhoodTag}>
                {n}
              </li>
            ))}
          </ul>
          <p className={styles.areaNote}>
            Não encontrou seu bairro? Entre em contato pelo{" "}
            <Link to="/contato" className={styles.inlineLink}>
              formulário de contato
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
};
