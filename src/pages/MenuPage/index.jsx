import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../../data/categories";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./MenuPage.module.scss";

// Import things needed for the new SearchResults component
import { fetchProducts } from "../../services/api";
import { ProductCard } from "../../components/ProductsPage/ProductCard";
import { SkeletonCard } from "../../components/ProductsPage/SkeletonCard";
import productListStyles from "../../components/ProductsPage/ProductList/ProductList.module.scss";

// --- SearchResults Component ---
const SearchResults = ({ q, onAddToCart, onOpenProduct }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAndFilter = async () => {
      setIsLoading(true);
      try {
        const { products: allProducts } = await fetchProducts(); // Fetch all
        const filtered = allProducts.filter((p) =>
          `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase())
        );
        setProducts(filtered);
      } finally {
        setIsLoading(false);
      }
    };
    loadAndFilter();
  }, [q]);

  if (isLoading) {
    return (
      <ul className={productListStyles.productList}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </ul>
    );
  }
  if (products.length === 0) {
    return <p className={styles.emptyMsg}>Nenhum produto encontrado.</p>;
  }
  return (
    <ul className={productListStyles.productList}>
      {products.map((product) => (
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

// --- MenuPage Component ---
export const MenuPage = () => {
  const { addToCart, openQuickView } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  const q = params.get("q")?.trim() ?? "";
  const isSearching = q.length > 0;

  const clearSearch = () => {
    params.delete("q");
    setParams(params, { replace: true });
  };

  // IntersectionObserver for category bar
  useEffect(() => {
    if (isSearching) return;

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
  }, [isSearching]);

  const handleChipClick = (e, id) => {
    e.preventDefault();
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth" });
    // Intersection observer will update the active state
  };

  // --- Render Logic ---
  if (isSearching) {
    return (
      <main>
        <h1 className={styles.heading}>Cardápio</h1>
        <div className={styles.resultsHeader}>
          <p className={styles.resultsTitle}>
            Resultados para: <strong>"{q}"</strong>
          </p>
          <button className={styles.clearButton} onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
        <SearchResults q={q} onAddToCart={addToCart} onOpenProduct={openQuickView} />
      </main>
    );
  }

  return (
    <main>
      <h1 className={styles.heading}>Cardápio</h1>

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

      {CATEGORIES.map(({ id, label, match }) => (
        <section key={id} id={`cat-${id}`} className={styles.section}>
          <h2 className={styles.sectionTitle}>{label}</h2>
          <ProductList
            category={match}
            onAddToCart={addToCart}
            onOpenProduct={openQuickView}
          />
        </section>
      ))}
    </main>
  );
};
