import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // If 403 Forbidden or 401 Unauthorized occurs on admin endpoints or within admin pages, redirect to admin login
    if (typeof window !== 'undefined') {
      const isForbiddenOrUnauthorized = status === 401 || status === 403;
      const isAdminApi = requestUrl.includes('/admin/') || requestUrl.includes('/properties/moderation');
      const currentPath = window.location.pathname;
      const isOnAdminPath = currentPath.startsWith('/admin') && currentPath !== '/admin/login';

      if (isForbiddenOrUnauthorized && (isAdminApi || isOnAdminPath)) {
        if (window.location.pathname !== '/admin/login') {
          const reason = status === 403 ? 'forbidden' : 'unauthorized';
          const redirectTarget = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/admin/login?error=${reason}&redirect=${redirectTarget}`;
        }
      }
    }

    const errorPayload = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.error?.code || (status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN_ERROR'),
      status,
    };
    return Promise.reject(errorPayload);
  }
);
