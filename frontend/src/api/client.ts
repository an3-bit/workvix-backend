import axios, { AxiosInstance } from 'axios';
import API_CONFIG from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally, reload or redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
