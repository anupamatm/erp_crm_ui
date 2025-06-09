// src/pages/Sales/Invoices/InvoiceView.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) {
      // Fetch the invoice details (for viewing)
      // Example: fetch(`/api/invoices/${id}`).then(res => res.json()).then(data => setInvoice(data));
      setInvoice({ customerName: 'John Doe', amount: 500, status: 'sent', description: 'Product X' });
    }
  }, [id]);

  if (!invoice) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Invoice Details</h2>
      <p><strong>Customer:</strong> {invoice.customerName}</p>
      <p><strong>Amount:</strong> ${invoice.amount}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      <p><strong>Description:</strong> {invoice.description}</p>
    </div>
  );
};

export default InvoiceView;
