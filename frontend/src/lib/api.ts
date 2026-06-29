import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s for AI generation
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data: { name?: string; avatar?: string }) =>
    api.patch('/auth/me', data),
};

// Trips
export const tripsAPI = {
  list: () => api.get('/trips'),
  get: (id: string) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
  updateActivity: (tripId: string, dayIndex: number, data: any) =>
    api.patch(`/trips/${tripId}/itinerary/${dayIndex}/activities`, data),
};

// AI
export const aiAPI = {
  generate: (tripId: string) => api.post(`/ai/generate/${tripId}`),
  regenerateDay: (tripId: string, data: { dayNumber: number; userRequest?: string }) =>
    api.post(`/ai/regenerate-day/${tripId}`, data),
};

export default api;
