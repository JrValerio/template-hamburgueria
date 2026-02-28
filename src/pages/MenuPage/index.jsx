import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../../data/categories";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./MenuPage.module.scss";

export const MenuPage = () => {
  const { productList, addToCart, isLoading, openQuickView } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);

  const q = params.get("q")?.trim() ?? "";
  const isSearching = q.length > 0;

  const filteredProducts = isSearching
    ? productList.filter((p) => {
        const hay = `${p.name ?? ""} ${p.category ?? ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : productList;

  const isEmpty = !isLoading && filteredProducts.length === 0;

  const clearSearch = () => {
    params.delete("q");
    setParams(params, { replace: true });
  };

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (isSearching || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    CATEGORIES.forEach(({ id }) => {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isSearching, isLoading]);

  const handleChipClick = (e, id) => {
    e.preventDefault();
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <h1 className={styles.heading}>Cardápio</h1>

      {!isSearching && !isLoading && (
        <nav className={styles.categoryBar} aria-label="Categorias do cardápio">
          {CATEGORIES.map(({ id, label }) => (
            <a
              key={id}
              href={`#cat-${id}`}
              className={`${styles.categoryChip} ${activeCategory === id ? styles.categoryChipActive : ""}`}
              onClick={(e) => handleChipClick(e, id)}
              aria-current={activeCategory === id ? "true" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      )}

      {isSearching && (
        <div className={styles.resultsHeader}>
          <p className={styles.resultsTitle}>
            Resultados para: <strong>"{q}"</strong>
          </p>
          <button className={styles.clearButton} onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
      )}

      {isSearching || isLoading ? (
        <ProductList
          productList={filteredProducts}
          onAddToCart={addToCart}
          onOpenProduct={openQuickView}
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
                onOpenProduct={openQuickView}
                isLoading={false}
              />
            </section>
          );
        })
      )}
    </main>
  );
};
