import api from './api';

export const workoutService = {
  getWorkouts: (params = {}) => api.get('/workouts', { params }),
  getWorkoutById: (id) => api.get(`/workouts/${id}`),
  createWorkout: (data) => api.post('/workouts', data),
  updateWorkout: (id, data) => api.put(`/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`)
};
