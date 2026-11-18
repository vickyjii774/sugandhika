import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage.js';
import { getCartMessage } from '../utils/whatsapp.js';

const CART_KEY = 'sugandhika_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getItem(CART_KEY, []));

  useEffect(() => {
    setItem(CART_KEY, items);
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const total = subtotal; // Add shipping logic here if needed

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const getWhatsAppMessage = useCallback(
    () => getCartMessage(items, subtotal, total),
    [items, subtotal, total]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        total,
        itemCount,
        getWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
