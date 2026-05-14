import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loops if refresh fails
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/token/refresh/') {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        if (refresh) {
          const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
          localStorage.setItem('access', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest); // Retry the original request
        }
      } catch (err) {
        // Refresh token failed, force logout
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
