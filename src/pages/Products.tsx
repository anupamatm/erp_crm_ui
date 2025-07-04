import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { API } from '../lib/api';
import Modal from '../components/Modal';
import ProductForm from '../pages/Products/ProductForm';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

const LOW_STOCK_THRESHOLD = 5;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(
        `/api/products?page=${page}&limit=${limit}&category=${categoryFilter}`
      );
      setProducts(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error deleting product');
    }
  };

  const handleAddEdit = (productId?: string) => {
    setSelectedProductId(productId || null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status?: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'out_of_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'not_set':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status?: string) => {
    if (!status || status.trim() === '') return 'Not Set';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const filteredProducts = showLowStockOnly
    ? products.filter((p) => p.stock < LOW_STOCK_THRESHOLD)
    : products;

  const lowStockProducts = products.filter((p) => p.stock < LOW_STOCK_THRESHOLD);

  if (loading)
    return (
      <div className="flex justify-center p-8 text-gray-600 text-lg font-semibold">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 p-6 bg-red-100 rounded-md max-w-3xl mx-auto shadow-md">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Products</h1>
        {['admin', 'product_manager'].includes(user?.role || '') && (
          <button
            onClick={() => handleAddEdit()}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-white px-5 py-3 rounded-md transition"
          >
            <PlusCircle size={20} />
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <label htmlFor="category" className="text-sm font-semibold text-gray-700">
            Category:
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Dress">Dress</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="lowStockOnly"
            checked={showLowStockOnly}
            onChange={() => setShowLowStockOnly((prev) => !prev)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <label
            htmlFor="lowStockOnly"
            className="text-sm font-semibold text-gray-700 select-none"
          >
            Show Low Stock Only (below {LOW_STOCK_THRESHOLD})
          </label>
        </div>
      </div>

      {/* Low Stock Banner */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-md font-semibold shadow-sm">
          ⚠️ <span className="font-bold">Attention:</span> The following products have low stock:{' '}
          <span className="text-red-800 font-medium">
            {lowStockProducts.map((p) => p.name).join(', ')}
          </span>{' '}
          Please restock soon!
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr
                key={product._id}
                className={`transition-colors ${
                  product.stock < LOW_STOCK_THRESHOLD ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                }`}
                title={product.stock < LOW_STOCK_THRESHOLD ? 'Low Stock' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ₹{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {formatStatus(product.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex items-center">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 transition"
                  >
                    <Eye size={16} /> View
                  </Link>
                  {['admin', 'product_manager'].includes(user?.role || '') && (
                    <>
                      <button
                        onClick={() => handleAddEdit(product._id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 transition"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className={`px-5 py-2 rounded-md font-semibold ${
              page === 1
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white transition'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 font-semibold text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className={`px-5 py-2 rounded-md font-semibold ${
              page === totalPages
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white transition'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 text-center text-sm text-gray-500">
        Showing {filteredProducts.length} of {totalItems} products
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProductForm
          isModal={true}
          onClose={() => setIsModalOpen(false)}
          productId={selectedProductId}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      </Modal>
    </div>
  );
};

export default Products;
