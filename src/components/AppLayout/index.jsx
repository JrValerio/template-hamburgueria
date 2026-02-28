import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { fetchProducts } from "../../services/api";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { CartModal } from "../CartModal";
import { OfflineBanner } from "../OfflineBanner";
import { ProductQuickViewModal } from "../ProductQuickViewModal";
import styles from "./AppLayout.module.scss";

export function AppLayout() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const [cartList, setCartList] = useState(() => {
    try {
      const saved = localStorage.getItem("cartList");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartVisible, setIsCartVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { products, fromFallback } = await fetchProducts();
        setProductList(products);
        setIsOffline(fromFallback);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cartList") {
        try {
          setCartList(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = (product) => {
    setCartList((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      const next = exists
        ? prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem("cartList", JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setCartList([]);
    localStorage.removeItem("cartList");
  };

  const cartQuantity = cartList.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className={styles.appShell}>
      <Header
        cartQuantity={cartQuantity}
        onSearchSubmit={(term) => setSearchTerm(term.toLowerCase())}
        onCartClick={() => setIsCartVisible((v) => !v)}
        productList={productList}
        onAddToCart={addToCart}
      />

      {isOffline && <OfflineBanner />}

      <Outlet
        context={{
          productList,
          addToCart,
          searchTerm,
          isLoading,
          openQuickView: setSelectedProduct,
        }}
      />

      <Footer />

      {isCartVisible && (
        <CartModal
          cartList={cartList}
          setCartList={setCartList}
          onClearCart={clearCart}
          onClose={() => setIsCartVisible(false)}
        />
      )}

      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onAddToCart={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
