import React from 'react';
import { Download, Calendar } from 'lucide-react';

const Reports = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Reports</h1>
        <div className="flex space-x-4">
          <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50">
            <Calendar size={20} className="mr-2" />
            Last 30 Days
          </button>
          <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50">
            <Download size={20} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Revenue Overview</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No data available</p>
            </div>
          </div>
        </div>

        {/* Sales by Product */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Sales by Product</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No data available</p>
            </div>
          </div>
        </div>

        {/* Pipeline Analysis */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Pipeline Analysis</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No data available</p>
            </div>
          </div>
        </div>

        {/* Sales by Representative */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Sales by Representative</h2>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <p>No data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 