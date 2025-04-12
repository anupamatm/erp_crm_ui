import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import CustomerService from '../lib/customerService'; 

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultValues?: CustomerFormData & { _id?: string };
}

const CustomerFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, defaultValues }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {},
  });

  useEffect(() => {
    reset(defaultValues || {});
  }, [defaultValues, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (defaultValues?._id) {
        await CustomerService.updateCustomer(defaultValues._id, data);
      } else {
        await CustomerService.addCustomer(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error submitting customer form:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {defaultValues?._id ? 'Edit Customer' : 'Add Customer'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Name</label>
            <input {...register('name')} className="w-full p-2 border rounded" />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label>Email</label>
            <input {...register('email')} className="w-full p-2 border rounded" />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label>Phone</label>
            <input {...register('phone')} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Address</label>
            <textarea {...register('address')} className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              {defaultValues?._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
