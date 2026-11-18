import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import useWishlist from '../hooks/useWishlist.js';
import useCart from '../hooks/useCart.js';
import useToast from '../hooks/useToast.js';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = (item) => {
    const price = item.discountPrice || item.regularPrice || item.price;
    addToCart({ ...item, price }, 1);
    removeFromWishlist(item.id);
    toast.success(`${item.name} moved to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <nav className="text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {wishlist.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love for later."
            action={<Link to="/products" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-dark transition-colors"><ArrowRight className="w-4 h-4" />Browse Products</Link>}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
              <button onClick={clearWishlist}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            <div className="space-y-4">
              {wishlist.map(item => {
                const price = item.discountPrice || item.regularPrice || item.price;
                const hasDiscount = item.discountPrice && item.regularPrice && item.discountPrice < item.regularPrice;
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-4">
                    <Link to={`/products/${item.slug}`} className="shrink-0">
                      <div className="w-20 h-20 rounded-lg bg-brand-cream overflow-hidden border border-gray-100">
                        {item.mainImage ? (
                          <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-brand/20" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-brand transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-brand-gold font-bold">Rs. {price?.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">Rs. {item.regularPrice?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleMoveToCart(item)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand-dark transition-colors">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                      <button onClick={() => { removeFromWishlist(item.id); toast.info('Removed from wishlist'); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
