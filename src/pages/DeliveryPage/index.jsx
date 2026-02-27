import { Link } from "react-router-dom";

export const DeliveryPage = () => {
  return (
    <main style={{ padding: "2rem 1rem", color: "var(--color-text, #f0f0f0)" }}>
      <h1>Delivery</h1>
      <p style={{ color: "var(--color-text-muted, #9e9e9e)", marginTop: "0.5rem" }}>
        Entregamos na sua porta. Rápido, quente e no ponto certo.
      </p>
      <Link
        to="/cardapio"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          padding: "0.625rem 1.5rem",
          background: "#27ae60",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Pedir agora
      </Link>
    </main>
  );
};
