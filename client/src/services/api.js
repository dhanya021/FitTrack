import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fittrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // If unauthorized or token expired, clean up token if appropriate
    if (error.response?.status === 401) {
      if (
        message.includes('expired') ||
        message.includes('token failed') ||
        message.includes('Not authorized')
      ) {
        localStorage.removeItem('fittrack_token');
        localStorage.removeItem('fittrack_user');
      }
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default api;
