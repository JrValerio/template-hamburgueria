import { Link, useOutletContext } from "react-router-dom";
import { CATEGORIES } from "../../data/categories";
import { CategoryTile } from "../../components/CategoryTile";
import { ProductList } from "../../components/ProductsPage/ProductList";
import styles from "./HomePage.module.scss";

const FEATURED_IDS = new Set([1, 2, 54, 73, 90, 95]);

export const HomePage = () => {
  const { productList, addToCart, searchTerm, isLoading, openQuickView } = useOutletContext();

  // Search mode: flat filtered list
  if (searchTerm) {
    const filtered = productList.filter((p) =>
      (p.name ?? "").toLowerCase().includes(searchTerm)
    );
    return (
      <main>
        <ProductList
          productList={filtered}
          onAddToCart={addToCart}
          onOpenProduct={openQuickView}
          isLoading={isLoading}
        />
      </main>
    );
  }

  // Featured: prefer curated IDs; fall back to first 6 products if API returns different data
  const featured = productList.filter((p) => FEATURED_IDS.has(p.id));
  const displayFeatured = featured.length > 0 ? featured : productList.slice(0, 6);

  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Destaque">
        <div className={styles.heroContent}>
          <span className={styles.badge}>Delivery em até 30 min</span>
          <h1 className={styles.headline}>Burgers artesanais feitos pra você</h1>
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
        </div>
        <img
          src="/assets/menu/burgers/burger-021.jpg"
          alt="Burger artesanal em destaque"
          className={styles.heroImage}
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </section>

      {/* ── Categorias ── */}
      <section className={styles.categoriesSection} aria-label="Categorias">
        <h2 className={styles.sectionHeading}>Explorar por categoria</h2>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map(({ id, label }) => (
            <CategoryTile key={id} id={id} label={label} />
          ))}
        </div>
      </section>

      {/* ── Destaques ── */}
      <section className={styles.featuredSection} aria-label="Destaques">
        <div className={styles.featuredHeadingRow}>
          <h2 className={styles.featuredHeading}>Destaques</h2>
          <Link to="/cardapio" className={styles.viewAllLink}>
            Ver todos →
          </Link>
        </div>
        <ProductList
          productList={displayFeatured}
          onAddToCart={addToCart}
          onOpenProduct={openQuickView}
          isLoading={isLoading}
        />
      </section>
    </main>
  );
};
