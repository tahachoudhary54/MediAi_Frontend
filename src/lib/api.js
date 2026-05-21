import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => {
    // Check if error response exists
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Prevent redirect loop on auth pages
        const isAuthPage =
          currentPath.includes("/auth/login") ||
          currentPath.includes("/auth/register") ||
          currentPath.includes("/auth/forgot-password") ||
          currentPath.includes("/auth/reset-password");

        // Only logout for protected routes
        if (!isAuthPage) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");

          window.location.href = "/auth/login";
        }
      }
    }

    // Always reject error
    return Promise.reject(error);
  }
);
export default api;
