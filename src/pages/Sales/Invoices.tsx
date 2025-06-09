import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InvoiceForm from './InvoiceForm'; // adjust path if needed

const Invoices = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCreateInvoice = (data) => {
    console.log('Creating invoice:', data);

  };


  const invoices = [
    { id: 1, customerName: 'John Doe', amount: 250.0, status: 'paid' },
    { id: 2, customerName: 'Jane Smith', amount: 150.0, status: 'overdue' },
    { id: 3, customerName: 'Acme Corp', amount: 300.0, status: 'sent' },
  ];

  const navigate = useNavigate();

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch = inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === '' || inv.status === status;
    return matchSearch && matchStatus;
  });

  // Summary values
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const dueSoonAmount = filteredInvoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Customer', 'Amount', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      inv.customerName,
      inv.amount,
      inv.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'invoices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Invoices Report', 14, 16);

    const tableColumn = ['Customer', 'Amount', 'Status'];
    const tableRows = filteredInvoices.map((inv) => [
      inv.customerName,
      `$${inv.amount}`,
      inv.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('invoices.pdf');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50"
          >
            <Download size={20} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md flex items-center hover:bg-gray-50"
          >
            <Download size={20} className="mr-2" />
            Export PDF
          </button>
          <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + New Invoice
      </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-2">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">${overdueAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Due in 7 Days</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">${dueSoonAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Paid Last 30 Days</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">${paidAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search invoices..."
              className="border rounded-md px-3 py-2 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">No invoices found</p>
              <p className="text-sm">Create your first invoice to get started</p>
            </div>
          ) : (
            <table className="w-full text-left mt-4">
              <thead>
                <tr className="text-sm text-gray-600 border-b">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b text-sm text-gray-700">
                    <td className="py-2">{invoice.customerName}</td>
                    <td className="py-2">${invoice.amount}</td>
                    <td className="py-2 capitalize">{invoice.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <InvoiceForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
};

export default Invoices;



    
    
 
