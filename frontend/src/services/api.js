import axios from 'axios';
import { clearStoredSession, isSessionExpired, touchSessionActivity } from '../utils/authStorage';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_AUTH_PATHS = ['/api/auth/login/', '/api/auth/register/', '/api/auth/google/'];

const isPublicAuthRequest = (url = '') =>
  PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    if (!isPublicAuthRequest(config.url)) {
      const token = localStorage.getItem('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh logic
api.interceptors.response.use(
  (response) => {
    touchSessionActivity();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loops if refresh fails
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url) &&
      originalRequest.url !== '/api/token/refresh/'
    ) {
      originalRequest._retry = true;
      try {
        if (isSessionExpired()) {
          clearStoredSession();
          window.location.href = '/sign-in';
          return Promise.reject(error);
        }
        const refresh = localStorage.getItem('refresh');
        if (refresh) {
          const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
          localStorage.setItem('access', response.data.access);
          touchSessionActivity();
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest); // Retry the original request
        }
      } catch (err) {
        clearStoredSession();
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
