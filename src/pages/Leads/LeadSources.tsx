import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';

interface SourceStats {
  source: string;
  count: number;
  conversionRate: number;
  averageRevenue: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
}

const LeadSources = () => {
  const [sources, setSources] = useState<SourceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  useEffect(() => {
    fetchSourceStats();
  }, []);

  const fetchSourceStats = async () => {
    try {
      const allLeads = await LeadService.getAllLeads();
      const stats: { [key: string]: {
        count: number;
        converted: number;
        revenue: number;
        new: number;
        contacted: number;
        qualified: number;
        lost: number;
      } } = {};

      allLeads.forEach((lead) => {
        if (!stats[lead.source]) {
          stats[lead.source] = {
            count: 0,
            converted: 0,
            revenue: 0,
            new: 0,
            contacted: 0,
            qualified: 0,
            lost: 0,
          };
        }
        stats[lead.source].count++;
        stats[lead.source][lead.status]++;
        if (lead.status === 'converted') {
          stats[lead.source].converted++;
          stats[lead.source].revenue += lead.expectedRevenue || 0;
        }
      });

      const sourceStats = Object.entries(stats).map(([source, data]) => ({
        source,
        count: data.count,
        conversionRate: data.count ? (data.converted / data.count) * 100 : 0,
        averageRevenue: data.count ? data.revenue / data.count : 0,
        newLeads: data.new,
        contactedLeads: data.contacted,
        qualifiedLeads: data.qualified,
        convertedLeads: data.converted,
        lostLeads: data.lost,
      }));

      setSources(sourceStats.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Error fetching source stats:', error);
      alert('Failed to fetch source statistics');
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

  const filteredSources = sources.filter(source =>
    source.source.toLowerCase().includes(searchText.toLowerCase()) &&
    (selectedFilter === '' || source.source === selectedFilter)
  );

  const displaySources = selectedFilter
    ? sources.filter(s => s.source === selectedFilter)
    : ['website', 'referral', 'trade_show', 'cold_call'].map(src => sources.find(s => s.source === src)).filter(Boolean);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Sources</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search sources..."
            value={searchText}
            onChange={handleSearch}
            className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedFilter}
            onChange={handleFilter}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="trade_show">Trade Show</option>
            <option value="cold_call">Cold Call</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Performance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Source Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSources.map((source) => (
                    <tr key={source.source} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/leads/source/${source.source}`} className="text-blue-600 hover:text-blue-900">
                          {source.source}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{source.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{source.conversionRate.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">${source.averageRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Breakdown Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Status Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {displaySources.map((s) => (
                      <th key={s.source} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {s.source}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {['newLeads', 'contactedLeads', 'qualifiedLeads', 'convertedLeads', 'lostLeads'].map((statusKey) => (
                    <tr key={statusKey} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(statusKey.replace('Leads', ''))}`}>
                          {statusKey.replace('Leads', '')[0].toUpperCase() + statusKey.replace('Leads', '').slice(1)}
                        </span>
                      </td>
                      {displaySources.map((s) => (
                        <td key={s.source} className="px-6 py-4 whitespace-nowrap">
                          {s[statusKey as keyof SourceStats] as number}
                        </td>
                      ))}
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

export default LeadSources;
