import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../../services/api";
import { useCart } from "../../services/hooks";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { ScrollToTop } from "../ScrollToTop";
import { CartModal } from "../CartModal";
import { OfflineBanner } from "../OfflineBanner";
import { ProductQuickViewModal } from "../ProductQuickViewModal";
import { Toast } from "../Toast";
import styles from "./AppLayout.module.scss";

export function AppLayout() {
  const [productList, setProductList] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const { cartList, addToCart: addToCartHook, ...cartActions } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { products } = await fetchProducts();
      setProductList(products);
    };
    load();
  }, []);

  const showToast = (message) => {
    const id = Date.now();
    setToastMessage({ id, message });
    setTimeout(() => setToastMessage((t) => (t?.id === id ? null : t)), 3000);
  };

  const addToCart = (product) => {
    addToCartHook(product);
    showToast(`${product.name} adicionado ao carrinho`);
  };

  useEffect(() => {
    // A simple polling to detect online/offline status
    const interval = setInterval(async () => {
      try {
        await fetch("/");
        if (isOffline) setIsOffline(false);
      } catch (e) {
        if (!isOffline) setIsOffline(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOffline]);

  useEffect(() => {
    if (isOffline) setIsBannerDismissed(false);
  }, [isOffline]);

  const { pathname } = useLocation();
  useEffect(() => {
    setIsCartVisible(false);
    setSelectedProduct(null);
  }, [pathname]);

  const handleSearch = (term) => {
    const params = new URLSearchParams({ q: term });
    navigate(`/menu?${params.toString()}`);
  };

  const cartQuantity = cartList.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className={styles.appShell}>
      <ScrollToTop />
      <Header
        cartQuantity={cartQuantity}
        onSearchSubmit={handleSearch}
        onCartClick={() => setIsCartVisible((v) => !v)}
        productList={productList}
        onAddToCart={addToCart}
      />

      {isOffline && !isBannerDismissed && <OfflineBanner onDismiss={() => setIsBannerDismissed(true)} />}

      <Outlet
        context={{
          addToCart,
          openQuickView: setSelectedProduct,
          isOffline,
        }}
      />

      <Footer />

      {isCartVisible && (
        <CartModal
          cartList={cartList}
          onClose={() => setIsCartVisible(false)}
          onClearCart={cartActions.clearCart}
          onRemoveItem={cartActions.removeFromCart}
          onIncrementItem={cartActions.incrementQuantity}
          onDecrementItem={cartActions.decrementQuantity}
        />
      )}

      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onAddToCart={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Toast message={toastMessage?.message} />
    </div>
  );
}
