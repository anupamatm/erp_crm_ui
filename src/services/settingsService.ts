
import API from '../api/api';

const API_URL = '/api/settings';

export const getSettings = async () => {
  const res = await API.get(API_URL);
  return res.data;
};

export const updateSettings = async (data: any) => {
  const res = await API.put(API_URL, data);
  return res.data;
};
