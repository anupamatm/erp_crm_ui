import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';
import Papa from 'papaparse';


interface LeadStats {
  totalLeads: number;
  totalRevenue: number;
  statusCount: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
}

const getStatusColor = (status: string) => {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const LeadDashboard = () => {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, leadsData] = await Promise.all([
          LeadService.getLeadsStats(),
          LeadService.getAllLeads()
        ]);
        setStats(statsData);
        setRecentLeads(leadsData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const leads = results.data as Lead[];

        // Optional: Validate each lead before sending
        const validLeads = leads.filter(
          (lead) => lead.firstName && lead.email // Add more rules as needed
        );

        if (validLeads.length === 0) {
          setCsvError('No valid leads found in CSV.');
          return;
        }

        // Call backend API to import
        await LeadService.importLeads(validLeads);
        alert('Leads imported successfully!');
        window.location.reload(); // Refresh dashboard
      } catch (err) {
        console.error('Error importing CSV:', err);
        setCsvError('Failed to import leads.');
      }
    },
    error: (err) => {
      console.error('CSV Parse Error:', err);
      setCsvError('Invalid CSV format.');
    }
  });
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Lead Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Total Leads</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalLeads || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Converted Leads</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.statusCount?.converted || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Expected Revenue</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">${(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Conversion Rate</h2>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats?.totalLeads ?
              ((stats?.statusCount?.converted || 0) / stats.totalLeads * 100).toFixed(1) : 0}
            %
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">New Leads</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.statusCount?.new || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Contacted</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.statusCount?.contacted || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Qualified</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.statusCount?.qualified || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Lost</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats?.statusCount?.lost || 0}</p>
        </div>
      </div>

{/* Bulk Import CSV Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Import Leads</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {csvError && <p className="text-red-600 mb-4">{csvError}</p>}

      {/* {/* Sample CSV Download Link */}
        <div className="mb-6">
        <a 
          href="/path/to/sample-template.csv" 
          className="text-blue-600 hover:text-blue-800"
          download
        >
          Download Sample CSV Template
        </a>
      </div> 



      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Recent Leads</h2>
          <Link to="/leads/new" className="text-blue-600 hover:text-blue-800">
            Add New Lead
          </Link>
        </div>
        <div className="space-y-4 p-4">
          {recentLeads.map((lead) => (
            <div key={lead._id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                <div className="text-sm text-gray-600">{lead.email}</div>
                <div className="text-xs text-gray-500">{lead.source}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <Link to={`/leads/${lead._id}`} className="text-blue-600 hover:text-blue-800">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadDashboard;
