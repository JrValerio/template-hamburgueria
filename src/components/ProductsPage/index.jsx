import { useState, useEffect } from "react";
import { fetchProducts } from "../../services/api";
import { ProductList } from "./ProductList/index";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Não foi possível carregar os produtos.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      {error && <p>{error}</p>}
      {isLoading ? (
        <p>Carregando produtos...</p>
      ) : (
        <ProductList productList={products} />
      )}
    </>
  );
};
