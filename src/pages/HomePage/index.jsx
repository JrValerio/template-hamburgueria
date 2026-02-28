import { Link, useOutletContext } from "react-router-dom";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./HomePage.module.scss";

export const HomePage = () => {
  const { productList, addToCart, searchTerm, isLoading } = useOutletContext();

  const filteredProducts = productList.filter((p) =>
    (p.name ?? "").toLowerCase().includes(searchTerm)
  );

  return (
    <main>
      {!searchTerm && (
        <section className={styles.hero} aria-label="Destaque">
          <h1 className={styles.headline}>
            Burgers artesanais feitos pra você
          </h1>
          <p className={styles.sub}>
            Ingredientes frescos, sabor de verdade — entregues na sua porta.
          </p>
          <div className={styles.actions}>
            <Link to="/cardapio" className={styles.ctaPrimary}>
              Ver cardápio
            </Link>
            <Link to="/ofertas" className={styles.ctaSecondary}>
              Ver ofertas
            </Link>
          </div>
        </section>
      )}

      <ProductList
        productList={filteredProducts}
        onAddToCart={addToCart}
        isLoading={isLoading}
      />
    </main>
  );
};
