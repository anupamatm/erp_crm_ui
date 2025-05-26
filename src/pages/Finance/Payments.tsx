import React, { useEffect, useState } from 'react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Dummy data for payments
    const dummyPayments = [
      { _id: '1', invoiceId: 'INV20230001', amount: 1500, method: 'Credit Card' },
      { _id: '2', invoiceId: 'INV20230002', amount: 3000, method: 'Bank Transfer' }
    ];
    
    setPayments(dummyPayments);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-4">
          <ul className="space-y-3">
            {payments.map(payment => (
              <li key={payment._id} className="border-b pb-2">
                <span className="font-medium">Invoice ID:</span> {payment.invoiceId} &nbsp;
                <span className="font-medium">Amount:</span> ${payment.amount} &nbsp;
                <span className="font-medium">Method:</span> {payment.method}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Payments;