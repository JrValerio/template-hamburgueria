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
    img: "/assets/menu/burgers/burger-013.jpg",
  },
  {
    id: "combo-bacon",
    name: "Combo Bacon",
    description: "Double smash burger com bacon crocante + onion rings + milk shake 400ml.",
    price: 46.9,
    originalPrice: 59.9,
    img: "/assets/menu/burgers/burger-014.jpg",
  },
  {
    id: "combo-veggie",
    name: "Combo Veggie",
    description: "Burger vegetariano + salada verde + suco natural 300ml.",
    price: 42.9,
    originalPrice: 54.9,
    img: "/assets/menu/burgers/burger-016.jpg",
  },
  {
    id: "combo-premium",
    name: "Combo Premium",
    description: "Burger premium em pão pretzel + batata rústica + bebida à escolha.",
    price: 58.9,
    originalPrice: 74.9,
    img: "/assets/menu/burgers/burger-017.jpg",
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
