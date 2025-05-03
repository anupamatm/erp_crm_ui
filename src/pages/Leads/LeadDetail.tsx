import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';
import { format } from 'date-fns';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (id) {
          const data = await LeadService.getLeadById(id);
          setLead(data);
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!lead) return <div className="p-6">Lead not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lead Details</h2>
        <div className="flex gap-4">
          <Link
            to={`/leads/${lead._id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Edit
          </Link>
          <Link
            to="/leads"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{lead.firstName} {lead.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{lead.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{lead.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <p className="mt-1 text-gray-900">{lead.company || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <p className="mt-1 text-gray-900">{lead.website || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Lead Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <p className="mt-1 text-gray-900 capitalize">{lead.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 px-2 py-1 rounded-full text-sm font-medium" 
                 className={`mt-1 px-2 py-1 rounded-full text-sm font-medium ${
                   lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                   lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                   lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                   'bg-gray-100 text-gray-800'
                 }`}
              >
                {lead.status.replace('_', ' ').replace('-', ' ').toUpperCase()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Revenue</label>
              <p className="mt-1 text-gray-900">${lead.expectedRevenue || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <p className="mt-1 text-gray-900">
                {format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {format(new Date(lead.updatedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {lead.notes && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <div className="prose max-w-none text-gray-700">
            {lead.notes}
          </div>
        </div>
      )}

      {lead.assignedTo && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Assigned To</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">{lead.assignedTo.name}</p>
              <p className="text-sm text-gray-600">{lead.assignedTo.email}</p>
            </div>
          </div>
        </div>
      )}

      {lead.user && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Created By</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">{lead.user.name}</p>
              <p className="text-sm text-gray-600">{lead.user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
