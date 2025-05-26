import API from '../api/api';

export const getDashboardData = async () => {
  const res = await API.get('/api/sales/dashboard');
  return res.data;
};

export const getCustomerStats = async () => {
  try {
    // Try statistics endpoint first
    const res = await API.get('/api/customers/statistics');
    if (res.data && res.data.total && typeof res.data.total.total === 'number') {
      return res.data;
    }
  } catch (e) {
    // Fallback to fetching all customers
  }
  // Fallback: fetch all customers and count
  const resAll = await API.get('/api/customers');
  return {
    total: {
      total: Array.isArray(resAll.data.data) ? resAll.data.data.length : 0,
    },
    byStatus: [],
    recent: { count: 0 },
  };
};

export const getLeadStats = async () => {
  const res = await API.get('/api/leads/stats');
  return res.data;
};

export const getInvoiceStats = async () => {
  const res = await API.get('/api/sales/invoices/statistics');
  return res.data;
};

export const getOpportunityStats = async () => {
  const res = await API.get('/api/sales/opportunities/statistics');
  return res.data;
};
