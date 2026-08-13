import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly auth cookie set by the backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token as a fallback (in case cookie isn't available, e.g. some mobile webviews)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('matchpass_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling — if the session has expired, bounce to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('matchpass_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;