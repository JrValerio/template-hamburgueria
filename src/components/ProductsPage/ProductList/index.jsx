import { useEffect, useState } from "react";
import { fetchProducts } from "../../../services/api";
import { ProductCard } from "../ProductCard";
import { SkeletonCard } from "../SkeletonCard";
import styles from "./ProductList.module.scss";

export const ProductList = ({ onAddToCart, onOpenProduct, category }) => {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { products } = await fetchProducts({ category });
        setProductList(products);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [category]);

  if (isLoading) {
    return (
      <ul className={styles.productList}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </ul>
    );
  }

  if (productList.length === 0) {
    return <p>Nenhum produto encontrado nesta categoria.</p>;
  }

  return (
    <ul className={styles.productList}>
      {productList.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onOpenProduct={onOpenProduct}
        />
      ))}
    </ul>
  );
};
