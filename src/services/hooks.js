import { useEffect, useState } from "react";


export const useEscapePress = (onClose) => {
  useEffect(() => {
    const handleEscapePress = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscapePress);
    return () => {
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, [onClose]);
};

export const useOutsideClick = (ref, onClose) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClose]);
};

// --- Novo Hook useCart ---

const CART_STORAGE_KEY = 'cartList';

// Validação básica do schema: verifica se é um array de objetos com id e quantidade.
const isValidCartData = (data) => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'quantity' in item &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
  );
};

export const useCart = () => {
  const [cartList, setCartList] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (isValidCartData(parsedCart)) {
          return parsedCart;
        }
      }
    } catch (error) {
      console.error("[useCart] Falha ao carregar ou analisar o carrinho do localStorage", error);
      return [];
    }
    return [];
  });

  // Persiste o carrinho no localStorage sempre que ele muda
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartList));
    } catch (error) {
      console.error("[useCart] Falha ao salvar o carrinho no localStorage", error);
    }
  }, [cartList]);

  const addToCart = (productToAdd) => {
    setCartList((prev) => {
      const existingProduct = prev.find((item) => item.id === productToAdd.id);
      if (existingProduct) {
        return prev.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartList((prev) => prev.filter((item) => item.id !== productId));
  };

  const incrementQuantity = (productId) => {
    setCartList((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId) => {
     setCartList((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          if (item.quantity <= 1) return null;
          return { ...item, quantity: item.quantity - 1 };
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartList([]);
  };

  return {
    cartList,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setCartList 
  };
};
