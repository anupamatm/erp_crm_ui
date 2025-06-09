import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

type QuotationItem = {
  name: string;
  description: string;
  quantity: number;
  price: number;
};

type QuotationData = {
  client: string;
  number: string;
  year: string;
  currency: string;
  status: string;
  date: string;
  expireDate: string;
  note: string;
  items: QuotationItem[];
  taxValue: number;
};

type QuotationFormProps = {
  onClose?: () => void;
  id?: string;
};

const QuotationForm: React.FC<QuotationFormProps> = ({ onClose, id }) => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const [formData, setFormData] = useState<QuotationData>({
    client: '',
    number: '',
    year: '',
    currency: '',
    status: '',
    date: '',
    expireDate: '',
    note: '',
    items: [],
    taxValue: 0,
  });

  useEffect(() => {
    const fetchId = id || params.id;
    if (fetchId) {
      axios
        .get<QuotationData>(`http://localhost:5007/api/quotations/${fetchId}`)
        .then((res) => setFormData(res.data))
        .catch((err) => console.error('Error loading quotation:', err));
    }
  }, [id, params.id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'taxValue' ? parseFloat(value) : value,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, price: 0 }],
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] =
      field === 'quantity' || field === 'price' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (id || params.id) {
        await axios.put(`http://localhost:5007/api/quotations/${id || params.id}`, formData);
        alert('Quotation updated');
      } else {
        await axios.post(`http://localhost:5007/api/quotations`, formData);
        alert('Quotation created');
      }
      if (onClose) {
        onClose();
      } else {
        navigate('/sales/quotations');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save quotation');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 bg-white rounded shadow-md">
  <h2 className="text-xl font-semibold mb-4 text-gray-800">
    {id || params.id ? 'Update' : 'Create'} Quotation
  </h2>

  {/* General Info */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <div>
      <label htmlFor="client" className="block mb-1 text-sm font-medium text-gray-700">
        Client <span className="text-red-500">*</span>
      </label>
      <input
        id="client"
        name="client"
        value={formData.client}
        onChange={handleChange}
        placeholder="Client"
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="number" className="block mb-1 text-sm font-medium text-gray-700">
        Number <span className="text-red-500">*</span>
      </label>
      <input
        id="number"
        name="number"
        value={formData.number}
        onChange={handleChange}
        placeholder="Number"
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="year" className="block mb-1 text-sm font-medium text-gray-700">
        Year <span className="text-red-500">*</span>
      </label>
      <input
        id="year"
        name="year"
        value={formData.year}
        onChange={handleChange}
        placeholder="Year"
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="currency" className="block mb-1 text-sm font-medium text-gray-700">
        Currency <span className="text-red-500">*</span>
      </label>
      <input
        id="currency"
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        placeholder="Currency"
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">
        Status <span className="text-red-500">*</span>
      </label>
      <input
        id="status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        placeholder="Status"
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="date" className="block mb-1 text-sm font-medium text-gray-700">
        Date <span className="text-red-500">*</span>
      </label>
      <input
        id="date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label htmlFor="expireDate" className="block mb-1 text-sm font-medium text-gray-700">
        Expire Date <span className="text-red-500">*</span>
      </label>
      <input
        id="expireDate"
        name="expireDate"
        type="date"
        value={formData.expireDate}
        onChange={handleChange}
        required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="md:col-span-3">
      <label htmlFor="note" className="block mb-1 text-sm font-medium text-gray-700">
        Note
      </label>
      <textarea
        id="note"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Note"
        rows={2}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>

  {/* Items Section */}
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">Items</h3>
    {formData.items.map((item, index) => (
      <div
        key={index}
        className="mb-3 p-3 border border-gray-300 rounded bg-gray-50 relative"
      >
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="absolute top-1 right-1 text-red-600 hover:text-red-800 font-bold text-lg"
          aria-label={`Remove item ${index + 1}`}
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={addItem}
      className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
    >
      + Add Item
    </button>
  </div>

  {/* Tax */}
  <div className="mb-4 max-w-xs">
    <label htmlFor="taxValue" className="block mb-1 text-sm font-medium text-gray-700">
      Tax Value (%)
    </label>
    <input
      id="taxValue"
      name="taxValue"
      type="number"
      min="0"
      max="100"
      value={formData.taxValue}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Tax Value"
    />
  </div>

  {/* Buttons */}
  <div className="flex space-x-3 justify-end">
    <button
      type="button"
      onClick={onClose ? onClose : () => navigate('/sales/quotations')}
      className="px-4 py-1.5 border border-gray-400 rounded text-sm hover:bg-gray-100 transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
    >
      {id || params.id ? 'Update' : 'Create'}
    </button>
  </div>
</form>

  );
};

export default QuotationForm;
