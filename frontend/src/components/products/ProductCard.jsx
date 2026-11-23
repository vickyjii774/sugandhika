
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings.js';
import { formatPrice, getDiscountPercent } from '../../utils/format.js';
import { openWhatsApp, getOrderMessage } from '../../utils/whatsapp.js';

export default function ProductCard({ product }) {
  const { settings } = useSettings();

  const discount = product?.discountPrice
    ? getDiscountPercent(product.price, product.discountPrice)
    : null;

  const displayPrice = product?.discountPrice || product?.price || 0;

  const handleWhatsApp = (e) => {
    e.preventDefault();

    const msg = getOrderMessage(product, 1, displayPrice);

    openWhatsApp(
      settings?.whatsapp || '9779801234567',
      msg
    );
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col">

      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg">
            Save {discount}%
          </span>
        </div>
      )}

      {/* Product Image */}
      <Link
        to={`/products/${product.slug}`}
        className="block relative overflow-hidden aspect-square bg-brand-cream"
      >
        <img
          src={
            product.mainImage ||
            'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80'
          }
          alt={product.name || 'Sugandhika product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col">

        {product.category && (
          <span className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-1">
            {product.category.name}
          </span>
        )}

        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-gray-800 group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.shortDescription}
          </p>
        )}

        {/* Price and Enquiry */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-gray-900">
                {formatPrice(displayPrice)}
              </span>

              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {product.availability === 'OUT_OF_STOCK' && (
              <span className="text-[10px] text-red-500 font-semibold">
                Out of Stock
              </span>
            )}
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 text-xs font-semibold"
            title="Enquire via WhatsApp"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire
          </button>

        </div>
      </div>
    </div>
  );
}
