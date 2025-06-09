// ConvertQuotation.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ConvertQuotation: React.FC = () => {
  const [quotationId, setQuotationId] = useState<string>('');

  const handleConvert = async () => {
    try {
      await axios.post(`http://localhost:5007/api/quotations/${quotationId}/convert`);
      alert('Quotation converted to Order');
    } catch (error) {
      alert('Error converting quotation');
    }
  };

  return (
    <div className="container">
      <h2>Convert Quotation to Order</h2>
      <div className="mb-3">
        <label className="form-label">Quotation ID</label>
        <input
          type="text"
          className="form-control"
          value={quotationId}
          onChange={(e) => setQuotationId(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleConvert}>
        Convert
      </button>
    </div>
  );
};

export default ConvertQuotation;