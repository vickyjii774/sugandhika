
import { Link } from 'react-router-dom';
import { formatPrice, getDiscountPercent } from '../../utils/format.js';

export default function ProductCard({ product }) {
  const discount = product?.discountPrice
    ? getDiscountPercent(product.price, product.discountPrice)
    : null;

  const displayPrice = product?.discountPrice || product?.price || 0;

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

        {/* Price and Product Details */}
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

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark transition-all active:scale-95 text-xs font-semibold"
            aria-label={`View details for ${product.name}`}
          >
            Details
          </Link>

        </div>
      </div>
    </div>
  );
}
