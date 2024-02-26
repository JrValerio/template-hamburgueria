import { ProductCard } from "../ProductCard/index";
import styles from "./ProductList.module.scss";

export const ProductList = ({ productList, onAddToCart, isLoading }) => {
  if (isLoading) {
    return <p>Carregando produtos...</p>;
  }

  if (productList.length === 0) {
    return <p>Não há produtos disponíveis.</p>;
  }

  return (
    <div className={styles.productList}>
      {productList.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
