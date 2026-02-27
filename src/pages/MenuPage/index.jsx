import { useOutletContext } from "react-router-dom";
import { ProductList } from "../../components/ProductsPage/ProductList";

export const MenuPage = () => {
  const { productList, addToCart, searchTerm, isLoading } = useOutletContext();

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  return (
    <main>
      <h1 style={{ padding: "2rem 1rem 1rem", color: "var(--color-text, #f0f0f0)" }}>
        Cardápio
      </h1>
      {isLoading ? (
        <p style={{ padding: "1rem" }}>Carregando produtos...</p>
      ) : (
        <ProductList
          productList={filteredProducts}
          onAddToCart={addToCart}
          isLoading={isLoading}
        />
      )}
    </main>
  );
};
