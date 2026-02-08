import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables de entorno (definidas en .env)
const DEV_IP = process.env.EXPO_PUBLIC_DEV_IP || '192.168.0.21';
const PROD_URL = process.env.EXPO_PUBLIC_PROD_URL || 'http://localhost:4000';

const BASE_URL = __DEV__
  ? `http://${DEV_IP}:4000/api`
  : `${PROD_URL}/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor: añadir Bearer token a cada petición
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── Auth ──
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { nombre: string; username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// ── Roles ──
export const rolesAPI = {
  getAll: () => apiClient.get('/roles'),
  create: (data: { tipo: string; data: Record<string, any> }) =>
    apiClient.post('/roles', data),
  delete: (tipo: string) => apiClient.delete(`/roles/${tipo}`),
};

// ── Driver Profiles ──
export const driverProfilesAPI = {
  getByRoleId: (roleId: number) => apiClient.get(`/driver-profiles/${roleId}`),
};

// ── Vehicles ──
export const vehiclesAPI = {
  getByProfileId: (profileId: number) => apiClient.get(`/vehicles/by-profile/${profileId}`),
};

// ── Passenger Profiles ──
export const passengerProfilesAPI = {
  getByRoleId: (roleId: number) => apiClient.get(`/passenger-profiles/${roleId}`),
};

// ── Routes ──
export const routesAPI = {
  getAll: (params?: Record<string, any>) => apiClient.get('/routes', { params }),
  getById: (id: number) => apiClient.get(`/routes/${id}`),
  create: (data: any) => apiClient.post('/routes', data),
  update: (id: number, data: any) => apiClient.put(`/routes/${id}`, data),
  delete: (id: number) => apiClient.delete(`/routes/${id}`),
};

// ── Route Passengers ──
export const routePassengersAPI = {
  getAll: () => apiClient.get('/route-passengers'),
  getMisRutas: () => apiClient.get('/route-passengers/mis-rutas'),
  create: (data: any) => apiClient.post('/route-passengers', data),
  delete: () => apiClient.delete('/route-passengers'),
};

// ── Drivers (listado público) ──
export const driversAPI = {
  getAll: () => apiClient.get('/drivers'),
  getById: (id: number) => apiClient.get(`/drivers/${id}`),
};

// ── Passengers (listado público) ──
export const passengersAPI = {
  getAll: () => apiClient.get('/passengers'),
  getById: (id: number) => apiClient.get(`/passengers/${id}`),
  create: (data: any) => apiClient.post('/passengers', data),
  update: (id: number, data: any) => apiClient.put(`/passengers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/passengers/${id}`),
};

// ── Payments ──
export const paymentsAPI = {
  getAll: () => apiClient.get('/payments'),
  create: (data: any) => apiClient.post('/payments', data),
  update: (id: number, data: any) => apiClient.put(`/payments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/payments/${id}`),
};

// ── Ratings ──
export const ratingsAPI = {
  getAll: () => apiClient.get('/ratings'),
  create: (data: any) => apiClient.post('/ratings', data),
};