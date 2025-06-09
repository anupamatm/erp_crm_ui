import React, { useState } from 'react';

const InvoiceForm = ({ isOpen, onClose, onSubmit }) => {
  const [invoice, setInvoice] = useState({
    customerName: '',
    amount: 0,
    status: 'draft',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(invoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={invoice.customerName}
              onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={invoice.amount}
              onChange={(e) =>
                setInvoice({ ...invoice, amount: parseFloat(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={invoice.status}
              onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={invoice.description}
              onChange={(e) =>
                setInvoice({ ...invoice, description: e.target.value })
              }
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
