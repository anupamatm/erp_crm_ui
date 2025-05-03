import { useEffect, useState } from 'react';
import LeadService from '@/services/leadService';
import { Lead } from '@/types/Lead';
import { Link } from 'react-router-dom';

const LeadList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const data = await LeadService.getAllLeads();
      setLeads(data);
    };
    fetchLeads();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Leads</h1>
        <Link
          to="/leads/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + New Lead
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Source</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-t">
                <td className="py-2 px-4">{lead.firstName} {lead.lastName}</td>
                <td className="py-2 px-4">{lead.email}</td>
                <td className="py-2 px-4 capitalize">{lead.status}</td>
                <td className="py-2 px-4 capitalize">{lead.source}</td>
                <td className="py-2 px-4 space-x-2">
                  <Link
                    to={`/leads/${lead._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    to={`/leads/edit/${lead._id}`}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async (e) => {
                      e.preventDefault(); // Prevent any default link behavior
                      if (window.confirm('Are you sure you want to delete this lead?')) {
                        try {
                          await LeadService.deleteLead(lead._id);
                          setLeads(leads.filter((l) => l._id !== lead._id));
                        } catch (error) {
                          console.error('Error deleting lead:', error);
                          alert('Failed to delete lead. Please try again.');
                        }
                      }
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadList;
