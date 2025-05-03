import React from 'react';
import { Plus, Download } from 'lucide-react';

const Invoices = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
        <div className="flex space-x-4">
          <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50">
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-2">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Due in 7 Days</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Paid Last 30 Days</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">$0.00</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search invoices..."
                className="border rounded-md px-3 py-2 w-64"
              />
              <select className="border rounded-md px-3 py-2">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">No invoices found</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices; 