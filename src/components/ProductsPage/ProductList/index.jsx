import { ProductCard } from "../ProductCard/index";
import { SkeletonCard } from "../SkeletonCard";
import styles from "./ProductList.module.scss";

const SKELETON_COUNT = 6;

export const ProductList = ({ productList, onAddToCart, onOpenProduct, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.productList} aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
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
          onOpen={onOpenProduct}
        />
      ))}
    </div>
  );
};
