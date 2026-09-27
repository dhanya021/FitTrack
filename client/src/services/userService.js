import api from './api';

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateSettings: (data) => api.put('/users/settings', data),
  populateDemoData: () => api.post('/users/demo-data')
};
