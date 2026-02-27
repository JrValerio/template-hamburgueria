import { useState } from "react";

export const ContactPage = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main style={{ padding: "2rem 1rem", color: "var(--color-text, #f0f0f0)", maxWidth: "32rem" }}>
      <h1>Contato</h1>
      {sent ? (
        <p style={{ marginTop: "1rem", color: "#27ae60", fontWeight: 600 }}>
          Mensagem enviada! Em breve entraremos em contato.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Seu nome"
            required
            style={{ padding: "0.625rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "#2e2e2e", color: "#f0f0f0" }}
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            required
            style={{ padding: "0.625rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "#2e2e2e", color: "#f0f0f0" }}
          />
          <textarea
            placeholder="Sua mensagem"
            rows={4}
            required
            style={{ padding: "0.625rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)", background: "#2e2e2e", color: "#f0f0f0", resize: "vertical" }}
          />
          <button
            type="submit"
            style={{ padding: "0.625rem 1.5rem", background: "#27ae60", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
          >
            Enviar
          </button>
        </form>
      )}
    </main>
  );
};
