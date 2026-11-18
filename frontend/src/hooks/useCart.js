import { useCart as useCartContext } from '../context/CartContext.jsx';

export default function useCart() {
  return useCartContext();
}

export { useCartContext as useCart };
