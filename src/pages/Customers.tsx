// pages/Customers.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../lib/auth';
import Modal from '../components/Modal';
import CustomerForm from './CustomerForm';
import CustomerService from '../services/customerService';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getCustomers(page);
      setCustomers(data.data);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await CustomerService.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error deleting customer');
    }
  };

  const handleAddEdit = (customerId?: string) => {
    setSelectedCustomerId(customerId || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomerId(null);
    fetchCustomers(); // refresh list after add/edit
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Customers</h2>
        <button
          onClick={() => handleAddEdit()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusCircle className="mr-2" /> Add Customer
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Company</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust) => (
              <tr key={cust._id}>
                <td className="border p-2">{cust.name}</td>
                <td className="border p-2">{cust.email}</td>
                <td className="border p-2">{cust.phone}</td>
                <td className="border p-2">{cust.company}</td>
                <td className="border p-2">{cust.status}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleAddEdit(cust._id)} className="text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cust._id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal with Form */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <CustomerForm customerId={selectedCustomerId} onSuccess={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Customers;
