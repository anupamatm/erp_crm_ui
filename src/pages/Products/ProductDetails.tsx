import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // Import useNavigate
import { API } from '../../lib/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();  // Initialize useNavigate
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data?.data || res.data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-2xl">
      {/* Back Button */}
      <button
        onClick={() => navigate('/products')}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
      >
        &larr; Back
      </button>

      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">Product Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailItem label="Name" value={product.name} />
        <DetailItem label="Category" value={product.category} />
        <DetailItem label="Price" value={`₹${product.price}`} />
        <DetailItem label="Status" value={product.status} />
        <DetailItem label="Stock" value={product.stock} />
        <DetailItem label="SKU" value={product.sku || 'N/A'} />
        <DetailItem label="Brand" value={product.brand || 'N/A'} />
        <DetailItem label="Description" value={product.description || 'No description'} />
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-lg font-semibold text-gray-700">{value}</span>
  </div>
);

export default ProductDetails;
