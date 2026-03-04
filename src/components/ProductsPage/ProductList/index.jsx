import { useEffect, useState } from "react";
import { fetchProducts } from "../../../services/api";
import { ProductCard } from "../ProductCard";
import { SkeletonCard } from "../SkeletonCard";
import styles from "./ProductList.module.scss";
import axios from "axios";

// Cache in-memory para armazenar os produtos por categoria.
const productsCache = new Map();

export const ProductList = ({ onAddToCart, onOpenProduct, category }) => {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      // 1. Verifica o cache antes de fazer a requisição.
      if (productsCache.has(category)) {
        setProductList(productsCache.get(category));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { products } = await fetchProducts({
          category,
          signal: controller.signal,
        });
        // 2. Atualiza o estado e o cache com os novos produtos.
        setProductList(products);
        productsCache.set(category, products);
      } catch (err) {
        // 3. Ignora o erro se a requisição foi cancelada.
        if (axios.isCancel(err)) {
          return;
        }
        // 4. Define uma mensagem de erro para outras falhas.
        setError(
          "Não foi possível carregar os produtos. Tente novamente mais tarde."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();

    // 5. Função de limpeza que cancela a requisição ao desmontar ou trocar de categoria.
    return () => {
      controller.abort();
    };
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

  if (error) {
    return <p className="error-message">{error}</p>;
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
