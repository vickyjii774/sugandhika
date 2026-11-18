import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage.js';

const WISHLIST_KEY = 'sugandhika_wishlist';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => getItem(WISHLIST_KEY, []));

  useEffect(() => {
    setItem(WISHLIST_KEY, items);
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      if (prev.find((p) => p._id === product._id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p._id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId) => items.some((p) => p._id === productId),
    [items]
  );

  const toggleItem = useCallback(
    (product) => {
      if (isInWishlist(product._id)) {
        removeItem(product._id);
      } else {
        addItem(product);
      }
    },
    [isInWishlist, addItem, removeItem]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearWishlist,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

export default WishlistContext;
