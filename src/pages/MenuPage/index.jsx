import { useOutletContext } from "react-router-dom";
import { CATEGORIES } from "../../data/categories";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./MenuPage.module.scss";

export const MenuPage = () => {
  const { productList, addToCart, searchTerm, isLoading } = useOutletContext();

  const filteredProducts = productList.filter((p) =>
    (p.name ?? "").toLowerCase().includes(searchTerm)
  );

  const isEmpty = !isLoading && filteredProducts.length === 0;
  const isSearching = searchTerm.length > 0;

  return (
    <main>
      <h1 className={styles.heading}>Cardápio</h1>

      {!isSearching && !isLoading && (
        <nav className={styles.categoryBar} aria-label="Categorias do cardápio">
          {CATEGORIES.map(({ id, label }) => (
            <a key={id} href={`#cat-${id}`} className={styles.categoryChip}>
              {label}
            </a>
          ))}
        </nav>
      )}

      {isSearching || isLoading ? (
        <ProductList
          productList={filteredProducts}
          onAddToCart={addToCart}
          isLoading={isLoading}
        />
      ) : isEmpty ? (
        <p className={styles.emptyMsg}>Nenhum produto encontrado.</p>
      ) : (
        CATEGORIES.map(({ id, label, match }) => {
          const items = filteredProducts.filter((p) => p.category === match);
          if (items.length === 0) return null;
          return (
            <section key={id} id={`cat-${id}`} className={styles.section}>
              <h2 className={styles.sectionTitle}>{label}</h2>
              <ProductList
                productList={items}
                onAddToCart={addToCart}
                isLoading={false}
              />
            </section>
          );
        })
      )}
    </main>
  );
};
