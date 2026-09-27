import api from './api';

export const sleepService = {
  getSleepEntries: (params = {}) => api.get('/sleep', { params }),
  createSleepEntry: (data) => api.post('/sleep', data),
  updateSleepEntry: (id, data) => api.put(`/sleep/${id}`, data),
  deleteSleepEntry: (id) => api.delete(`/sleep/${id}`)
};
