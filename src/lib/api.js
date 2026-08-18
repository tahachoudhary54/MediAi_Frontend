import axios from 'axios';

// Force localhost in development regardless of cached .env
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const api = axios.create({
  baseURL: isLocalhost ? 'http://localhost:5000/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'),
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    // We need to check if window is defined because Next.js does SSR
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log('Outgoing request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for generic error handling
// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error response exists and is 401, and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Prevent redirect loop on auth pages
        const isAuthPage =
          currentPath.includes("/auth/login") ||
          currentPath.includes("/auth/register") ||
          currentPath.includes("/auth/forgot-password") ||
          currentPath.includes("/auth/reset-password");

        if (isAuthPage) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const activeStorage = localStorage.getItem('token') ? localStorage : sessionStorage;

        if (!refreshToken) {
          isRefreshing = false;
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        try {
          // Use base axios to prevent infinite interceptor loops
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          
          if (res.data.success) {
            const newToken = res.data.token;
            const newRefreshToken = res.data.refreshToken;
            
            activeStorage.setItem('token', newToken);
            activeStorage.setItem('refreshToken', newRefreshToken);
            
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
            
            processQueue(null, newToken);
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/auth/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Always reject error if we can't handle it
    return Promise.reject(error);
  }
);
export default api;
