import { useState } from "react";
import styles from "./ContactPage.module.scss";

export const ContactPage = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className={styles.page}>
      <h1>Contato</h1>
      {sent ? (
        <p className={styles.successMsg}>
          Mensagem enviada! Em breve entraremos em contato.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Seu nome"
            required
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            className={styles.input}
          />
          <textarea
            placeholder="Sua mensagem"
            rows={4}
            required
            className={styles.textarea}
          />
          <button type="submit" className={styles.submitButton}>
            Enviar
          </button>
        </form>
      )}
    </main>
  );
};
