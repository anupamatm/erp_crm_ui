import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuotationSummary from './QuotationSummary';
import QuotationForm from './QuotationForm';
import axios from 'axios';

const QuotationView = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5007/api/quotations/")
      .then(res => setQuotations(res.data))
      .catch(err => console.error('Failed to fetch quotations:', err));
  }, []);

  const handleEdit = (id: string) => navigate(`/sales/quotations/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await axios.delete(`http://localhost:5007/api/quotations/${id}`);
        setQuotations(prev => prev.filter(q => q._id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete quotation.');
      }
    }
  };

  const handleConvertToOrder = (id: string) => {
    alert(`Converted quotation ID ${id} to order`);
  };

  const handleAddNew = () => setShowModal(true);

  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quotations</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + New Quote
        </button>
      </div>

      <QuotationSummary quotations={quotations} />

      {/* Styled Table */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 mt-6">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-light-600 text-dark">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations.map((q, index) => (
              <tr key={q._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{q.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{q.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                    q.status === 'Approved'
                      ? 'bg-green-500'
                      : q.status === 'Pending'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${(q.totalAmount || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => handleEdit(q._id)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(q._id)} className="text-red-600 hover:underline">Delete</button>
                  <button onClick={() => handleConvertToOrder(q._id)} className="text-green-600 hover:underline">Convert</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white p-6 rounded shadow-lg w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="mb-4 text-right w-full text-red-600 font-bold text-xl" 
              onClick={handleCloseModal}
            >
              &times; Close
            </button>
            <QuotationForm onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationView;

