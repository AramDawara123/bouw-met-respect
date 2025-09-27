import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  [key: string]: number;
}

const CART_STORAGE_KEY = 'webshop_cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = useCallback((productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] = newCart[productId] - 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getItemCount = useCallback((productId: string) => {
    return cart[productId] || 0;
  }, [cart]);

  const getTotalItemCount = useCallback(() => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getTotalItemCount
  };
};