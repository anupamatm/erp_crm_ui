import React, { useEffect, useState } from 'react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Dummy data for invoices
    const dummyInvoices = [
      { _id: '1', invoiceNumber: 'INV20230001', totalAmount: 1500, status: 'paid' },
      { _id: '2', invoiceNumber: 'INV20230002', totalAmount: 3000, status: 'pending' }
    ];
    
    setInvoices(dummyInvoices);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-4">
          <ul className="space-y-3">
            {invoices.map(invoice => (
              <li key={invoice._id} className="border-b pb-2">
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Amount:</strong> ${invoice.totalAmount}</p>
                <p><strong>Status:</strong> {invoice.status}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Invoices;