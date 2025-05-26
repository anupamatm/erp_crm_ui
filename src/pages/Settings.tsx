import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';

const Settings = () => {
  const [form, setForm] = useState({
    companyName: '',
    companyLogo: '',
    address: '',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getSettings()
      .then(data => setForm(data))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const allowedFields = [
    'companyName',
    'companyLogo',
    'address',
    'currency',
    'timezone',
    'language',
    'email'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    try {
      // Only send allowed fields
      const cleanForm: any = {};
      allowedFields.forEach(field => {
        cleanForm[field] = form[field] || '';
      });
      await updateSettings(cleanForm);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <div className="mt-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Application Settings</h3>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Logo URL</label>
                <input type="text" name="companyLogo" value={form.companyLogo} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <input type="text" name="currency" value={form.currency} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <input type="text" name="timezone" value={form.timezone} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <input type="text" name="language" value={form.language} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>
              {error && <div className="text-red-500">{error}</div>}
              {success && <div className="text-green-600">Settings updated successfully!</div>}
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;