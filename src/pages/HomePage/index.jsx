import React, { useState, useEffect } from "react";
import { api } from "/src/services/api.js";
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

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/products");
        setProductList(response.data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError(
          "Não foi possível carregar os produtos. Por favor, tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
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

  const handleCloseModal = () => {
    setIsCartVisible(false);
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
