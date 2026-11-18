import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import useCart from '../hooks/useCart.js';
import useToast from '../hooks/useToast.js';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const toast = useToast();
  const total = getTotal();

  const buildWhatsAppMessage = () => {
    if (!cart.length) return '';
    const lines = cart.map((item, i) => `${i + 1}. ${item.name} x${item.quantity} - Rs.${(item.price * item.quantity).toLocaleString()}`);
    return `Hello! I would like to place an order:\n${lines.join('\n')}\n\nTotal: Rs.${total.toLocaleString()}`;
  };

  const handleWhatsAppOrder = () => {
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/9779801234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
          <nav className="text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Cart</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Add some products to get started."
            action={<Link to="/products" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-dark transition-colors"><ArrowLeft className="w-4 h-4" />Continue Shopping</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                <button onClick={() => { clearCart(); toast.info('Cart cleared'); }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                  <Trash2 className="w-4 h-4" />Clear Cart
                </button>
              </div>

              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-4">
                  <Link to={`/products/${item.slug}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-brand-cream overflow-hidden border border-gray-100">
                      {item.mainImage ? (
                        <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-brand/20" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-brand transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-brand-gold font-bold mt-1">Rs. {item.price?.toLocaleString()} each</p>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="font-bold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => { removeFromCart(item.id); toast.info('Item removed'); }}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span className="line-clamp-1 flex-1 mr-2">{item.name} ×{item.quantity}</span>
                      <span className="shrink-0 font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900 mb-6">
                  <span>Total</span>
                  <span className="text-brand-gold">Rs. {total.toLocaleString()}</span>
                </div>
                <button onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors mb-3">
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </button>
                <Link to="/products"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
