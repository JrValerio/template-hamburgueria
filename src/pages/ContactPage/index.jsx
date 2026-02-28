import { useRef, useState } from "react";
import { MdAccessTime, MdLocationOn, MdPhone } from "react-icons/md";
import { STORE_ADDRESS, STORE_HOURS, STORE_PHONE_DISPLAY, STORE_PHONE_TEL } from "../../data/store";
import styles from "./ContactPage.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { name: "", email: "", message: "" };
const EMPTY_ERRORS = { name: "", email: "", message: "" };

function validate({ name, email, message }) {
  const errors = { ...EMPTY_ERRORS };
  if (name.trim().length < 2) errors.name = "Nome deve ter ao menos 2 caracteres.";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Informe um e-mail válido.";
  if (message.trim().length < 10) errors.message = "Mensagem deve ter ao menos 10 caracteres.";
  return errors;
}

function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export const ContactPage = () => {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const successRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate(fields);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSent(true);
      setFields(EMPTY);
      setErrors(EMPTY_ERRORS);
      successRef.current?.focus();
    }, 800);
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Contato</h1>

      <div className={styles.grid}>
        <div className={styles.formCol}>
        {sent ? (
        <div
          ref={successRef}
          tabIndex={-1}
          className={styles.successBox}
          role="status"
          aria-live="polite"
        >
          <p className={styles.successTitle}>Mensagem enviada!</p>
          <p className={styles.successSub}>
            Em breve nossa equipe entrará em contato.
          </p>
          <button
            className={styles.resetButton}
            onClick={() => setSent(false)}
          >
            Enviar outra mensagem
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>
              Nome
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              value={fields.name}
              onChange={handleChange}
              placeholder="Seu nome"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            />
            {errors.name && (
              <p id="err-name" className={styles.errorText} role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-email" className={styles.label}>
              E-mail
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            />
            {errors.email && (
              <p id="err-email" className={styles.errorText} role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message" className={styles.label}>
              Mensagem
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={fields.message}
              onChange={handleChange}
              placeholder="Como podemos ajudar?"
              rows={5}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "err-message" : undefined}
              className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
            />
            {errors.message && (
              <p id="err-message" className={styles.errorText} role="alert">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
        )}
        </div>

        <aside className={styles.infoCol}>
          <section className={styles.infoSection}>
            <h2 className={styles.infoTitle}>
              <MdLocationOn size={18} aria-hidden="true" />
              Endereço
            </h2>
            <p className={styles.infoText}>{STORE_ADDRESS}</p>
          </section>

          <section className={styles.infoSection}>
            <h2 className={styles.infoTitle}>
              <MdAccessTime size={18} aria-hidden="true" />
              Horários
            </h2>
            <ul className={styles.hoursList}>
              {STORE_HOURS.map(({ days, time }) => (
                <li key={days} className={styles.hoursItem}>
                  <span className={styles.hoursDay}>{days}</span>
                  <span className={styles.hoursTime}>{time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.infoSection}>
            <h2 className={styles.infoTitle}>
              <MdPhone size={18} aria-hidden="true" />
              Telefone
            </h2>
            <a href={`tel:${STORE_PHONE_TEL}`} className={styles.infoLink}>
              {STORE_PHONE_DISPLAY}
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
};
