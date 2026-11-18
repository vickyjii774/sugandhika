import { useWishlist as useWishlistContext } from '../context/WishlistContext.jsx';

export default function useWishlist() {
  return useWishlistContext();
}

export { useWishlistContext as useWishlist };
