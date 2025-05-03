import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';

interface StatusStats {
  status: string;
  count: number;
  averageAge: number;
  conversionRate: number;
  averageRevenue: number;
  topSources: string[];
}

const LeadStatus = () => {
  const [statusStats, setStatusStats] = useState<StatusStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  useEffect(() => {
    fetchStatusStats();
  }, []);

  const fetchStatusStats = async () => {
    try {
      const allLeads = await LeadService.getAllLeads();
      const stats: { [key: string]: {
        count: number;
        totalAge: number;
        converted: number;
        revenue: number;
        sources: string[];
      } } = {};

      const today = new Date();
      allLeads.forEach((lead) => {
        if (!stats[lead.status]) {
          stats[lead.status] = {
            count: 0,
            totalAge: 0,
            converted: 0,
            revenue: 0,
            sources: []
          };
        }
        stats[lead.status].count++;
        stats[lead.status].totalAge += Math.floor(
          (today.getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (lead.status === 'converted') {
          stats[lead.status].converted++;
          stats[lead.status].revenue += lead.expectedRevenue || 0;
        }
        if (!stats[lead.status].sources.includes(lead.source)) {
          stats[lead.status].sources.push(lead.source);
        }
      });

      const statusStats = Object.entries(stats).map(([status, data]) => ({
        status,
        count: data.count,
        averageAge: data.count ? Math.round(data.totalAge / data.count) : 0,
        conversionRate: status === 'converted' ? 100 : data.converted / data.count * 100,
        averageRevenue: data.count ? data.revenue / data.count : 0,
        topSources: data.sources.slice(0, 3)
      }));

      setStatusStats(statusStats.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Error fetching status stats:', error);
      alert('Failed to fetch status statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
  };

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

  const getStatusIcon = (status: string) => {
    const icons = {
      new: '🔹',
      contacted: '🔸',
      qualified: '🔹',
      converted: '✅',
      lost: '❌'
    };
    return icons[status] || '🔹';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Status</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search status..."
              value={searchText}
              onChange={handleSearch}
              className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={handleFilter}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Status Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Age (days)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statusStats
                    .filter((status) =>
                      status.status.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((status) => (
                      <tr key={status.status} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getStatusIcon(status.status)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.averageAge} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.conversionRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${status.averageRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Top Sources by Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top Sources
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statusStats
                    .filter((status) =>
                      status.status.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((status) => (
                      <tr key={status.status} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getStatusIcon(status.status)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.topSources.length > 0 ? status.topSources.join(', ') : 'No data'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadStatus;
