import api from './api';

export const waterService = {
  getWaterEntries: (params = {}) => api.get('/water', { params }),
  addWaterEntry: (data) => api.post('/water', data),
  deleteWaterEntry: (id) => api.delete(`/water/${id}`)
};
