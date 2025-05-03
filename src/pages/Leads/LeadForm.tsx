import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../lib/auth';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';

// Validation schema
const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  status: z.string().min(1, 'Status is required'),
  expectedRevenue: z.string().optional(),
  notes: z.string().optional(),
  user: z.string().min(1, 'User is required')
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  lead?: Partial<Lead>;
}

const LeadForm = ({ lead: initialLead }: LeadFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<LeadFormData>({
      resolver: zodResolver(leadSchema),
      mode: 'onBlur',
      defaultValues: {
        firstName: initialLead?.firstName || '',
        lastName: initialLead?.lastName || '',
        email: initialLead?.email || '',
        phone: initialLead?.phone || '',
        company: initialLead?.company || '',
        website: initialLead?.website || '',
        source: initialLead?.source || 'website',
        status: initialLead?.status || 'new',
        expectedRevenue: initialLead?.expectedRevenue || '',
        notes: initialLead?.notes || '',
        user: user?.id || ''
      }
    });

  if (!user) return <div>Loading...</div>;

  // Fetch lead data if we're editing an existing lead
  useEffect(() => {
    const fetchLeadData = async () => {
      if (id) {
        try {
          setLoading(true);
          const leadData = await LeadService.getLeadById(id);
          reset({
            ...leadData,
            user: user?.id || ''
          });
        } catch (error) {
          console.error('Error fetching lead data:', error);
          alert('Failed to load lead data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeadData();
  }, [id, user, reset]);

  const onSubmit = async (data: LeadFormData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const leadData = {
      ...data,
      user: user.id.toString()
    };

    try {
      if (id) {
        await LeadService.updateLead(id, leadData);
        console.log('Lead updated successfully');
      } else {
        const response = await LeadService.createLead(leadData);
        console.log('Lead created:', response);
      }
      navigate('/leads');
    } catch (err: any) {
      console.error('Error saving lead:', err);
      alert(err.message || 'Failed to save lead');
      throw err;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Lead' : 'Create New Lead'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              {...register('lastName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              {...register('company')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              id="website"
              {...register('website')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <select
            id="source"
            {...register('source')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="trade_show">Trade Show</option>
            <option value="cold_call">Cold Call</option>
            <option value="other">Other</option>
          </select>
          {errors.source && (
            <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="expectedRevenue" className="block text-sm font-medium text-gray-700">
            Expected Revenue
          </label>
          <input
            type="number"
            id="expectedRevenue"
            {...register('expectedRevenue')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : id ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>

        {id && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to convert this lead to a customer?')) {
                  const convertToCustomer = async () => {
                    try {
                      if (!id) {
                        throw new Error('No lead ID provided');
                      }

                      // Get the current lead data
                      const leadData = await LeadService.getLeadById(id);
                      
                      // Convert to customer
                      const response = await LeadService.convertToCustomer(id);
                      console.log('Lead converted to customer:', response);
                      alert('Lead has been successfully converted to customer!');
                      navigate('/customers');
                    } catch (err: any) {
                      console.error('Error converting lead to customer:', err);
                      alert(err.message || 'Failed to convert lead to customer');
                    }
                  };
                  convertToCustomer();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Convert to Customer
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LeadForm;
