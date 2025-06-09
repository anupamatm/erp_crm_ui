import React, { useState } from 'react';
import axios from 'axios';

const GenerateInvoice: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('');

  const handleGenerateInvoice = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      alert('Error generating invoice');
    }
  };

  return (
    <div className="container">
      <h2>Generate Invoice</h2>
      <div className="mb-3">
        <label className="form-label">Order ID</label>
        <input
          type="text"
          className="form-control"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleGenerateInvoice}>
        Generate Invoice
      </button>
    </div>
  );
};

export default GenerateInvoice;
