import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/signup');
    const isAlreadyOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

    if ((error.response?.status === 401 || error.response?.status === 422) && !isAuthRoute) {
      useAuthStore.getState().logout();
      if (!isAlreadyOnAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
