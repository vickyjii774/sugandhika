import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productsService, categoriesService } from '../../services/api.service.js';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  sku: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  stockQty: '',
  availability: 'IN_STOCK',
  isFeatured: false,
  isPublished: false,
  seoTitle: '',
  seoDescription: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Fetch categories
  useEffect(() => {
    categoriesService.adminGetAll().then((res) => {
      const data = res?.data;
      setCategories(Array.isArray(data) ? data : data?.items ?? data?.categories ?? []);
    });
  }, []);

  // Fetch product if editing
  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    productsService.getById(id).then((res) => {
      const p = res?.data?.product ?? res?.data;
      if (!p) return;
      setForm({
        name: p.name ?? '',
        slug: p.slug ?? '',
        sku: p.sku ?? '',
        shortDescription: p.shortDescription ?? '',
        description: p.description ?? '',
        categoryId: p.categoryId ?? p.category?.id ?? '',
        price: p.price ?? '',
        discountPrice: p.discountPrice ?? '',
        stockQty: p.stockQty ?? 0,
        availability: p.availability ?? 'IN_STOCK',
        isFeatured: p.isFeatured ?? false,
        isPublished: p.isPublished ?? false,
        seoTitle: p.seoTitle ?? '',
        seoDescription: p.seoDescription ?? '',
      });
      if (p.mainImage) setImagePreview(p.mainImage);
      setSlugEdited(true); // don't auto-generate slug on edit
    }).catch(() => {
      toast.error('Failed to load product.');
    }).finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Auto-generate slug from name
      if (name === 'name' && !slugEdited) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleImageSelect = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Name, price and category are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        sku: form.sku,
        shortDescription: form.shortDescription,
        description: form.description,
        categoryId: form.categoryId || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice !== '' ? Number(form.discountPrice) : undefined,
        stockQty: form.stockQty !== '' ? Number(form.stockQty) : 0,
        availability: form.availability.toUpperCase() === 'PRE_ORDER' ? 'PREORDER' : form.availability.toUpperCase(),
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
      };

      let productId = id;
      if (isEditing) {
        await productsService.update(id, payload);
      } else {
        const res = await productsService.create(payload);
        productId = res?.data?.product?.id ?? res?.data?.id;
      }

      // Upload image if selected
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await productsService.uploadImage(productId, formData);
      }

      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="e.g. Himalayan Herbs Blend"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  value={form.slug}
                  onChange={handleSlugChange}
                  className={inputClass}
                  placeholder="auto-generated from name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. HHB-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                rows={2}
                className={inputClass}
                placeholder="Brief product summary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className={inputClass}
                placeholder="Detailed product description"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Price (NPR) <span className="text-red-500">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price (NPR)
                </label>
                <input
                  name="discountPrice"
                  type="number"
                  value={form.discountPrice}
                  onChange={handleChange}
                  min="0"
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  name="stockQty"
                  type="number"
                  value={form.stockQty}
                  onChange={handleChange}
                  min="0"
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="PREORDER">Pre Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
              SEO
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                name="seoTitle"
                value={form.seoTitle}
                onChange={handleChange}
                className={inputClass}
                placeholder="SEO title (defaults to product name)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={form.seoDescription}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="SEO meta description"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
              Publish Settings
            </h2>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3 mb-4">
              Category
            </h2>
            <select
              name="categoryId"
              value={form.categoryId}
              required
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3 mb-4">
              Main Image
            </h2>
            <ImageUpload
              preview={imagePreview}
              onFileSelect={handleImageSelect}
              label="Upload product image"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
