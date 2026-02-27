import { useOutletContext } from "react-router-dom";
import { ProductList } from "../../components/ProductsPage/ProductList";

export const HomePage = () => {
  const { productList, addToCart, searchTerm, isLoading } = useOutletContext();

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  return (
    <main>
      {isLoading ? (
        <p>Carregando produtos...</p>
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
