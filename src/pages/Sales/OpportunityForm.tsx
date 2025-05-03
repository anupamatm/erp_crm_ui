import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../lib/auth';
import API from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  customer: z.string().min(1, 'Customer is required'),
  stage: z.string().min(1, 'Stage is required'),
  value: z.number().min(0, 'Value must be positive'),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  source: z.string().min(1, 'Source is required'),
  description: z.string().optional(),
  nextAction: z.string().min(1, 'Next action is required'),
  nextActionDate: z.string().optional()
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface Customer {
  _id: string;
  name: string;
}

const OpportunityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      stage: 'prospecting',
      probability: 0,
      source: 'website',
      nextAction: 'follow-up'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [customersResponse, opportunityResponse] = await Promise.all([
          API.get('/api/customers/'),  
          id ? API.get(`/api/sales/opportunities/${id}`) : Promise.resolve(null)
        ]);

        if (customersResponse.data?.data) {
          setCustomers(customersResponse.data.data.map(customer => ({
            _id: customer._id,
            name: customer.name
          })));
        }

        if (opportunityResponse?.data) {
          const opportunity = opportunityResponse.data;
          reset({
            title: opportunity.title,
            customer: opportunity.customer._id,
            stage: opportunity.stage,
            value: opportunity.value,
            probability: opportunity.probability,
            expectedCloseDate: new Date(opportunity.expectedCloseDate).toISOString().split('T')[0],
            source: opportunity.source,
            description: opportunity.description,
            nextAction: opportunity.nextAction,
            nextActionDate: opportunity.nextActionDate ? 
              new Date(opportunity.nextActionDate).toISOString().split('T')[0] : undefined
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: OpportunityFormData) => {
    try {
      setError(null);
      if (id) {
        await API.put(`/api/sales/opportunities/${id}`, {
          ...data,
          updatedBy: user?._id
        });
      } else {
        await API.post('/api/sales/opportunities', {
          ...data,
          assignedTo: user?._id,
          createdBy: user?._id
        });
      }
      navigate('/sales/opportunities');
      // Refresh statistics after saving
      fetchStatistics();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setError('Error saving opportunity. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-red-600">{error}</div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/sales/opportunities')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium mb-6">
            {id ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  {...register('title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <select
                  {...register('customer')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stage</label>
                <select
                  {...register('stage')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="prospecting">Prospecting</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
                {errors.stage && (
                  <p className="mt-1 text-sm text-red-600">{errors.stage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('value', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('probability', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.probability && (
                  <p className="mt-1 text-sm text-red-600">{errors.probability.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
                <input
                  type="date"
                  {...register('expectedCloseDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.expectedCloseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectedCloseDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <select
                  {...register('source')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="cold-call">Cold Call</option>
                  <option value="trade-show">Trade Show</option>
                  <option value="social-media">Social Media</option>
                  <option value="email-campaign">Email Campaign</option>
                  <option value="other">Other</option>
                </select>
                {errors.source && (
                  <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Next Action</label>
                <select
                  {...register('nextAction')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="follow-up">Follow Up</option>
                  <option value="meeting">Meeting</option>
                  <option value="proposal">Proposal</option>
                  <option value="presentation">Presentation</option>
                  <option value="contract">Contract</option>
                  <option value="none">None</option>
                </select>
                {errors.nextAction && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextAction.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Next Action Date</label>
                <input
                  type="date"
                  {...register('nextActionDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.nextActionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextActionDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/sales/opportunities')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {id ? 'Update' : 'Create'} Opportunity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpportunityForm;