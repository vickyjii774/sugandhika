import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { productsService } from '../../services/api.service.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import useToast from '../../hooks/useToast.js';

const PAGE_SIZE = 15;

export default function AdminProducts() {
  const navigate = useNavigate();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // product to delete
  const [actionLoading, setActionLoading] = useState({}); // { [productId]: true }

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsService.adminGetAll({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      const data = res?.data;
      const rows = data?.products ?? data?.items ?? (Array.isArray(data) ? data : []);
      setProducts(rows);
      setTotal(Number(data?.total ?? rows.length));
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const setAction = (id, val) =>
    setActionLoading((prev) => ({ ...prev, [id]: val }));

  const handleTogglePublish = async (product) => {
    setAction(product.id, true);
    try {
      await productsService.togglePublish(product.id);
      toast.success(
        product.isPublished ? 'Product unpublished.' : 'Product published.'
      );
      fetchProducts();
    } catch {
      toast.error('Failed to toggle publish status.');
    } finally {
      setAction(product.id, false);
    }
  };

  const handleToggleFeatured = async (product) => {
    setAction(product.id + '_feat', true);
    try {
      await productsService.toggleFeatured(product.id);
      toast.success(
        product.isFeatured ? 'Removed from featured.' : 'Marked as featured.'
      );
      fetchProducts();
    } catch {
      toast.error('Failed to toggle featured status.');
    } finally {
      setAction(product.id + '_feat', false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await productsService.delete(confirmDelete.id);
      toast.success('Product deleted.');
      setConfirmDelete(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-14">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price (NPR)</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Published</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {p.mainImage ? (
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</div>
                      {p.sku && <div className="text-xs text-gray-400">{p.sku}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium">
                        {p.price != null ? `NPR ${Number(p.price).toLocaleString()}` : '—'}
                      </div>
                      {p.discountPrice != null && (
                        <div className="text-xs text-green-600">
                          Sale: NPR {Number(p.discountPrice).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {p.stockQty ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        disabled={!!actionLoading[p.id + '_feat']}
                        title={p.isFeatured ? 'Remove from featured' : 'Mark featured'}
                        className={`transition ${p.isFeatured ? 'text-brand-gold' : 'text-gray-300'} hover:text-brand-gold disabled:opacity-50`}
                      >
                        <Star className="w-5 h-5" fill={p.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        disabled={!!actionLoading[p.id]}
                        title={p.isPublished ? 'Unpublish' : 'Publish'}
                        className={`transition ${p.isPublished ? 'text-brand' : 'text-gray-400'} hover:text-brand-dark disabled:opacity-50`}
                      >
                        {p.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="text-brand hover:text-brand-dark transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="mt-5">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
}
