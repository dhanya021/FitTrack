import api from './api';

export const goalService = {
  getGoals: (params = {}) => api.get('/goals', { params }),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};
