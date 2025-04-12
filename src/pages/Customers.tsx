import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerService from '../lib/customerService'; 


const Customers = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [customers, setCustomers] = useState<CustomerType[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = async (page = 1, limit = 5) => {
    try {
      const response = await CustomerService.getCustomers(page, limit);
      setCustomers(response.data);
      setTotalPages(response.totalPages);
      // setPage(response.page);
    } catch (err) {
      console.error('Error fetching customers', err);
    }
  };
  
  

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this customer?');
    if (!confirm) return;
  
    try {
      await CustomerService.deleteCustomer(id);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Delete error', err);
    }
  };
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Customer
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(customers) && customers.map((customer: any) => (
            <tr key={customer._id}>
              <td className="p-2 border">{customer.name}</td>
              <td className="p-2 border">{customer.email}</td>
              <td className="p-2 border">{customer.phone}</td>
              <td className="p-2 border space-x-2">
  <button
    onClick={() => handleEdit(customer)}
    className="text-blue-500 underline"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(customer._id)}
    className="text-red-500 underline"
  >
    Delete
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4 space-x-2">
  <button
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Prev
  </button>
  <span className="px-3 py-1">{page} / {totalPages}</span>
  <button
    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={page === totalPages}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>


      <CustomerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCustomers}
        defaultValues={editingCustomer || undefined}
      />
    </div>
  );
};

export default Customers;
