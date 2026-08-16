import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log(`[Auth] Intercepted ${error.response.status} from API. Forcing logout.`);
      // Clear local storage and redirect
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
