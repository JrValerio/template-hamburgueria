import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../services/api";
import { CartModal } from "../../components/CartModal";
import { Header } from "../../components/Header";
import { ProductList } from "../../components/ProductsPage/ProductList";

export const HomePage = () => {
  const [productList, setProductList] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartList, setCartList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const { products, fromFallback } = await fetchProducts();
        setProductList(products);
        setIsOffline(fromFallback);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "cartList") {
        setCartList(JSON.parse(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const savedCartList = localStorage.getItem("cartList");
    if (savedCartList) {
      setCartList(JSON.parse(savedCartList));
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const addToCart = (productToAdd) => {
    setCartList((prevCartList) => {
      const existingProduct = prevCartList.find(
        (item) => item.id === productToAdd.id
      );
      const newCartList = existingProduct
        ? prevCartList.map((item) =>
            item.id === productToAdd.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCartList, { ...productToAdd, quantity: 1 }];

      localStorage.setItem("cartList", JSON.stringify(newCartList));
      return newCartList;
    });
  };

  const removeFromCart = (productId) => {
    setCartList((prevCartList) => {
      const newCartList = prevCartList.reduce((acc, item) => {
        if (item.id === productId) {
          if (item.quantity === 1) {
            return acc;
          }
          return [...acc, { ...item, quantity: item.quantity - 1 }];
        } else {
          return [...acc, item];
        }
      }, []);

      localStorage.setItem("cartList", JSON.stringify(newCartList));
      return newCartList;
    });
  };

  const clearCart = () => {
    setCartList([]);
    localStorage.removeItem("cartList");
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue.toLowerCase());
  };

  const filteredProductList = productList.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      <Header
        onSearchSubmit={handleSearch}
        onCartClick={() => setIsCartVisible(!isCartVisible)}
        cartQuantity={cartList.reduce(
          (total, item) => total + item.quantity,
          0
        )}
      />

      {isOffline && (
        <div
          role="status"
          style={{
            background: "#fff3cd",
            borderBottom: "1px solid #ffc107",
            color: "#856404",
            fontSize: "0.85rem",
            padding: "8px 16px",
            textAlign: "center",
          }}
        >
          Catálogo em modo offline — exibindo dados locais. Funcionalidade completa disponível quando a conexão for restabelecida.
        </div>
      )}

      <main>
        {isLoading ? (
          <p>Carregando produtos...</p>
        ) : (
          <ProductList
            productList={filteredProductList}
            onAddToCart={addToCart}
            isLoading={isLoading}
          />
        )}

        {isCartVisible && (
          <CartModal
            cartList={cartList}
            setCartList={setCartList}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onClose={() => setIsCartVisible(false)}
          />
        )}
        {error && <p>{error}</p>}
      </main>
    </>
  );
};
