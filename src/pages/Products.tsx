import React, { useState, useEffect } from 'react';
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
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/products?page=${page}&limit=${limit}`);
      setProducts(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'out_of_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {['admin', 'product_manager'].includes(user?.role || '') && (
          <button
            onClick={() => handleAddEdit()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
          >
            <PlusCircle size={20} />
            Add Product
          </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                  >
                    <Eye size={16} /> View
                  </Link>
                  {['admin', 'product_manager'].includes(user?.role || '') && (
                    <>
                      <button
                        onClick={() => handleAddEdit(product._id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
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

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md ${page === 1 ? 'bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            Previous
          </button>
          
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md ${page === totalPages ? 'bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Showing {products.length} of {totalItems} products
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProductForm
          onClose={() => setIsModalOpen(false)}
          productId={selectedProductId}
          onSuccess={fetchProducts}
        />
      </Modal>
    </div>
  );
};

export default Products;
