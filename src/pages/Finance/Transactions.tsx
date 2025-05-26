import React, { useEffect, useState } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Dummy data for transactions
    const dummyTransactions = [
      { _id: '1', description: 'Sale of goods', amount: 1500, date: new Date(), category: 'income' },
      { _id: '2', description: 'Office Supplies', amount: -300, date: new Date(), category: 'expense' },
      { _id: '3', description: 'Consulting Services', amount: 2000, date: new Date(), category: 'income' }
    ];
    
    setTransactions(dummyTransactions);
    setLoading(false);
  }, []);

  // Example of improved layout in Transactions component
return (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Transactions</h1>
    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : (
      <div className="bg-white rounded-xl shadow p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="border-b-2 px-4 py-2">Description</th>
              <th className="border-b-2 px-4 py-2">Amount</th>
              <th className="border-b-2 px-4 py-2">Date</th>
              <th className="border-b-2 px-4 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction._id}>
                <td className="border-b px-4 py-2">{transaction.description}</td>
                <td className="border-b px-4 py-2">${transaction.amount}</td>
                <td className="border-b px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="border-b px-4 py-2">{transaction.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export default Transactions;