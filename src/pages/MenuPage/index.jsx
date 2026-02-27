import { useOutletContext } from "react-router-dom";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./MenuPage.module.scss";

export const MenuPage = () => {
  const { productList, addToCart, searchTerm, isLoading } = useOutletContext();

  const filteredProducts = productList.filter((p) =>
    (p.name ?? "").toLowerCase().includes(searchTerm)
  );

  return (
    <main>
      <h1 className={styles.heading}>Cardápio</h1>
      <ProductList
        productList={filteredProducts}
        onAddToCart={addToCart}
        isLoading={isLoading}
      />
    </main>
  );
};
