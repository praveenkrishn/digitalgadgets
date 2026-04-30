import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const emptyCart = { items: [], subtotal: 0, count: 0 };
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [cart, setCart] = useState(emptyCart);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setCart(emptyCart);
      return;
    }

    const { data } = await api.get("/users/cart");
    setCart(data.cart);
  };

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const { data } = await api.get("/users/wishlist");
    setWishlist(data.wishlist);
  };

  useEffect(() => {
    const loadStore = async () => {
      if (!user) {
        setCart(emptyCart);
        setWishlist([]);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([refreshCart(), refreshWishlist()]);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/users/cart", { productId, quantity });
    setCart(data.cart);
    pushToast("Added to cart");
  };

  const updateCartItem = async (productId, quantity) => {
    const { data } = await api.put(`/users/cart/${productId}`, { quantity });
    setCart(data.cart);
  };

  const removeCartItem = async (productId) => {
    const { data } = await api.delete(`/users/cart/${productId}`);
    setCart(data.cart);
    pushToast("Removed from cart");
  };

  const toggleWishlist = async (productId) => {
    const { data } = await api.post(`/users/wishlist/${productId}`);
    setWishlist(data.wishlist);
    pushToast(data.message);
    return data.wishlist;
  };

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      loading,
      refreshCart,
      refreshWishlist,
      addToCart,
      updateCartItem,
      removeCartItem,
      toggleWishlist,
      isWishlisted: (productId) =>
        wishlist.some((item) => item._id === productId || item === productId)
    }),
    [cart, wishlist, loading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
