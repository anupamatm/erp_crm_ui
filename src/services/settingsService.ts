import API from '../api/api';

export const settingsService = {
  getProfile: async () => {
    const res = await API.get('/api/settings/profile');
    return res.data;
  },
  updateProfile: async (data: { name: string; email: string }) => {
    const res = await API.put('/api/settings/profile', data);
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await API.put('/api/settings/password', data);
    return res.data;
  },
  updateNotifications: async (data: { email: boolean; sms: boolean }) => {
    const res = await API.put('/api/settings/notifications', data);
    return res.data;
  },
};
