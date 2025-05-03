import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerService, { Customer } from '../services/customerService';

interface CustomerFormData extends Customer {
  password?: string;
  company: string;
  notes: string;
  status: 'active' | 'inactive' | 'pending';
}

interface CustomerFormProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  customerId?: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isModal = false,
  onClose,
  onSuccess,
  customerId
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    status: 'active'
  });

  const effectiveId = customerId || id;

  useEffect(() => {
    if (effectiveId) {
      fetchCustomer();
    }
  }, [effectiveId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const customer = await CustomerService.getCustomerById(effectiveId!);
      setFormData({
        ...customer,
        password: '',
        company: customer.company || '',
        notes: customer.notes || '',
        status: customer.status || 'active'
      });
    } catch (err: any) {
      setError(err.message || 'Error fetching customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.company) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (effectiveId) {
        // For updates, don't send password if it's empty
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await CustomerService.updateCustomer(effectiveId, updateData);
        setError('');
      } else {
        // For new customers, password is required
        if (!formData.password) {
          setError('Password is required for new customers');
          return;
        }
        await CustomerService.addCustomer(formData);
        setError('');
      }

      // Show success message and close form
      if (isModal) {
        alert('Customer saved successfully!');
        onSuccess?.();
        onClose?.();
      } else {
        alert('Customer saved successfully!');
        navigate('/customers');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading && effectiveId) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const formContent = (
    <form onSubmit={handleSubmit} className={isModal ? '' : 'max-w-2xl bg-white shadow-md rounded-lg p-6'}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* password (only for add) */}
        {!effectiveId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        )}

        {/* phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={isModal ? onClose : () => navigate('/customers')}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );

  return isModal ? formContent : (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{effectiveId ? 'Edit Customer' : 'Add New Customer'}</h1>
      {formContent}
    </div>
  );
};

export default CustomerForm;
