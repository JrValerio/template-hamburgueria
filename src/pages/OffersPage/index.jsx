import { useOutletContext } from "react-router-dom";
import { FeaturedOfferCard } from "../../components/FeaturedOfferCard";
import { OfferCard } from "../../components/OfferCard";
import styles from "./OffersPage.module.scss";

const OFFER_FEATURED = {
  id: "combo-bold-especial",
  name: "Combo BK Bold Especial",
  description:
    "Duplo smash blend da casa, cheddar cremoso e bacon artesanal defumado — acompanha batata frita grande crocante e milk shake artesanal 500ml à escolha.",
  price: 64.9,
  originalPrice: 84.9,
  img: "/assets/menu/burgers/burger-045.jpg",
};

const OFFERS = [
  {
    id: "combo-duplo",
    name: "Combo Duplo",
    description: "Dois smash com queijo americano + batata frita + refrigerante 350ml.",
    price: 44.9,
    originalPrice: 58.9,
    img: "/assets/menu/burgers/burger-007.jpg",
  },
  {
    id: "combo-picante",
    name: "Combo Picante",
    description: "Smash com jalapeño e molho sriracha + onion rings + suco natural 300ml.",
    price: 47.9,
    originalPrice: 61.9,
    img: "/assets/menu/burgers/burger-050.jpg",
  },
  {
    id: "combo-cheddar",
    name: "Combo Cheddar",
    description: "Smash com duplo cheddar derretido e picles artesanal + batata + refrigerante.",
    price: 45.9,
    originalPrice: 59.9,
    img: "/assets/menu/burgers/burger-048.jpg",
  },
  {
    id: "combo-bbq",
    name: "Combo BBQ",
    description: "Smash com molho barbecue defumado + onion rings crocante + milk shake 400ml.",
    price: 48.9,
    originalPrice: 63.9,
    img: "/assets/menu/burgers/burger-041.jpg",
  },
  {
    id: "combo-simples",
    name: "Combo Simples",
    description: "Smash clássico com queijo e alface + batata frita pequena + refrigerante 350ml.",
    price: 38.9,
    originalPrice: 48.9,
    img: "/assets/menu/burgers/burger-006.jpg",
  },
  {
    id: "combo-trufado",
    name: "Combo Trufado",
    description: "Smash com cogumelos salteados e aioli de trufa + batata rústica + bebida à escolha.",
    price: 52.9,
    originalPrice: 67.9,
    img: "/assets/menu/burgers/burger-049.jpg",
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

      <div className={styles.featuredSection}>
        <FeaturedOfferCard offer={OFFER_FEATURED} onAddToCart={addToCart} />
      </div>

      <h2 className={styles.regularHeading}>Mais combos</h2>

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
