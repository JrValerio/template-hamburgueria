import { useOutletContext } from "react-router-dom";
import { OfferCard } from "../../components/OfferCard";
import styles from "./OffersPage.module.scss";

const OFFERS = [
  {
    id: "combo-classic",
    name: "Combo Clássico",
    description: "Burger clássico + batata frita média + refrigerante 350ml.",
    price: 39.9,
    originalPrice: 49.9,
  },
  {
    id: "combo-double",
    name: "Combo Double",
    description: "Double smash burger + onion rings + milk shake 400ml.",
    price: 54.9,
    originalPrice: 69.9,
  },
  {
    id: "combo-veggie",
    name: "Combo Veggie",
    description: "Burger de grão-de-bico + salada verde + suco natural 300ml.",
    price: 42.9,
    originalPrice: 52.9,
  },
  {
    id: "combo-family",
    name: "Combo Família",
    description: "2 burgers clássicos + 2 batatas + 2 refrigerantes 350ml.",
    price: 79.9,
    originalPrice: 99.9,
  },
];

export const OffersPage = () => {
  const { addToCart } = useOutletContext();

  return (
    <main className={styles.page}>
      <h1>Ofertas</h1>
      <p className={styles.subtitle}>
        Combos especiais com o melhor preço. Por tempo limitado.
      </p>

      <ul className={styles.grid} role="list">
        {OFFERS.map((offer) => (
          <li key={offer.id}>
            <OfferCard offer={offer} onAddToCart={addToCart} />
          </li>
        ))}
      </ul>
    </main>
  );
};
