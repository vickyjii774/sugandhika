import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  Package,
} from 'lucide-react';

import { productsService } from '../services/api.service.js';
import ProductCard from '../components/products/ProductCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useSettings } from '../hooks/useSettings.js';

const TABS = [
  'Description',
  'Ingredients',
  'Benefits',
  'Directions',
  'Specifications',
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);
    setMainImage(0);
    setQty(1);

    productsService
      .getBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        const p = res.data?.product || res.data;
        setProduct(p);
      })
      .catch(() => {
        if (isMounted) setError('Product not found.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    productsService
      .getRelated(slug)
      .then((res) => {
        if (!isMounted) return;
        setRelated(res.data?.products || res.data || []);
      })
      .catch(() => {
        if (isMounted) setRelated([]);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500 text-lg">
          {error || 'Product not found'}
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const images = [
    ...(product.mainImage
      ? [{ url: product.mainImage, alt: product.name }]
      : []),
    ...(product.images || []).map((img) => ({
      url: img.url || img,
      alt: product.name,
    })),
  ];

  if (!images.length) {
    images.push({ url: null, alt: product.name });
  }

  // The API product price field is "price" (not "regularPrice").
  const hasDiscount =
    product.discountPrice != null &&
    product.price != null &&
    Number(product.discountPrice) < Number(product.price);

  const displayPrice = hasDiscount
    ? product.discountPrice
    : product.price;

  const unitPrice = displayPrice != null ? Number(displayPrice) : null;
  const totalPrice = unitPrice != null ? unitPrice * qty : null;
  const formatRs = (value) =>
    `Rs. ${Number(value).toLocaleString('en-IN')}`;

  const whatsappText = `Hello! I would like to enquire about: ${product.name}
Quantity: ${qty}
Unit Price: ${unitPrice != null ? formatRs(unitPrice) : 'Please confirm price'}
Total Price: ${totalPrice != null ? formatRs(totalPrice) : 'Please confirm price'}`;

  const whatsappNumber = String(
    settings?.whatsapp || settings?.phone || ''
  ).replace(/\D/g, '');

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`
    : '';

  const stockQuantity = Number(product.stockQuantity);
  const isInStock =
    product.availability === 'in_stock' || stockQuantity > 0;
  const isPreOrder = product.availability === 'pre_order';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <nav className="max-w-6xl mx-auto text-sm text-gray-500 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {images[mainImage]?.url ? (
                <img
                  src={images[mainImage].url}
                  alt={images[mainImage].alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-cream">
                  <Package className="w-24 h-24 text-brand/30" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setMainImage((i) => Math.max(0, i - 1))
                    }
                    disabled={mainImage === 0}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setMainImage((i) =>
                        Math.min(images.length - 1, i + 1)
                      )
                    }
                    disabled={mainImage === images.length - 1}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors disabled:opacity-40"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-colors ${
                      i === mainImage
                        ? 'border-brand'
                        : 'border-gray-200'
                    }`}
                  >
                    {img.url ? (
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-cream" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            {(product.featured || hasDiscount) && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {product.featured && (
                  <span className="px-3 py-1 bg-brand-gold text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}

                {hasDiscount && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                    Sale
                  </span>
                )}
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-brand-gold">
                {displayPrice != null
                  ? `Rs. ${Number(displayPrice).toLocaleString()}`
                  : 'Price on enquiry'}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round(
                      (1 -
                        Number(product.discountPrice) /
                          Number(product.price)) *
                        100
                    )}
                    % off
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-4">
              {isInStock ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  In Stock
                </span>
              ) : isPreOrder ? (
                <span className="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                  Pre-Order
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Out of Stock
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed mb-5">
                {product.shortDescription}
              </p>
            )}

            {/* Enquiry Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-medium text-gray-700">
                Enquiry Quantity:
              </span>

              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-12 text-center text-sm font-semibold">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty((q) =>
                      Math.min(
                        stockQuantity > 0 ? stockQuantity : 99,
                        q + 1
                      )
                    )
                  }
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {totalPrice != null && (
              <div className="mb-5 flex items-center justify-between rounded-lg bg-brand-cream/60 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">Total for {qty}:</span>
                <span className="text-lg font-bold text-brand-dark">{formatRs(totalPrice)}</span>
              </div>
            )}

            {/* WhatsApp Enquiry */}
            <div className="flex flex-col gap-3 mb-6">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enquire via WhatsApp
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  WhatsApp contact number is not configured yet.
                </p>
              )}
            </div>

            {/* Meta */}
            {product.sku && (
              <p className="text-xs text-gray-400">
                SKU: {product.sku}
              </p>
            )}

            {product.category && (
              <p className="text-xs text-gray-400 mt-1">
                Category:{' '}
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="text-brand hover:underline"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-brand border-b-2 border-brand bg-brand-cream/40'
                    : 'text-gray-600 hover:text-brand'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 prose prose-sm max-w-none text-gray-700">
            {activeTab === 'Description' && (
              <p>
                {product.fullDescription ||
                  product.shortDescription ||
                  'No description available.'}
              </p>
            )}

            {activeTab === 'Ingredients' && (
              <p>
                {product.ingredients ||
                  'Ingredient information not available.'}
              </p>
            )}

            {activeTab === 'Benefits' && (
              <p>
                {product.benefits ||
                  'Benefits information not available.'}
              </p>
            )}

            {activeTab === 'Directions' && (
              <p>
                {product.directionsForUse ||
                  'Directions not available.'}
              </p>
            )}

            {activeTab === 'Specifications' && (
              <p>
                {product.specifications ||
                  'Specifications not available.'}
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id || p._id}
                  product={p}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
