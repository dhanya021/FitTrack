import api from './api';

export const activityService = {
  getActivities: (params = {}) => api.get('/activity', { params }),
  logActivity: (data) => api.post('/activity', data),
  updateActivity: (id, data) => api.put(`/activity/${id}`, data),
  deleteActivity: (id) => api.delete(`/activity/${id}`)
};
