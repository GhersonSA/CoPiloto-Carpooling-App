import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Cambia esta IP por la IP de tu computadora en la red local
// Para encontrarla: en PowerShell ejecuta "ipconfig" y busca "IPv4 Address"
// Ejemplo: 'http://192.168.0.21:4000/api'
const LOCAL_IP = '192.168.0.21'; // <-- Cambia esto por tu IP local
const API_URL = `http://${LOCAL_IP}:4000/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para añadir el token a cada petición
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
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

// Endpoints específicos
export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  register: (data: { nombre: string; email: string; password: string }) => 
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
};

export const driversAPI = {
  getAll: () => apiClient.get('/drivers'),
  getById: (id: number) => apiClient.get(`/drivers/${id}`),
  getProfiles: () => apiClient.get('/driver-profiles'),
};

export const passengersAPI = {
  getAll: () => apiClient.get('/passengers'),
  getById: (id: number) => apiClient.get(`/passengers/${id}`),
  getProfiles: () => apiClient.get('/passenger-profiles'),
  create: (data: any) => apiClient.post('/passengers', data),
  update: (id: number, data: any) => apiClient.put(`/passengers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/passengers/${id}`),
};

export const routesAPI = {
  getAll: () => apiClient.get('/routes'),
  getById: (id: number) => apiClient.get(`/routes/${id}`),
  getMisRutas: () => apiClient.get('/routes/mis-rutas'),
  create: (data: any) => apiClient.post('/routes', data),
  update: (id: number, data: any) => apiClient.put(`/routes/${id}`, data),
  delete: (id: number) => apiClient.delete(`/routes/${id}`),
};

export const paymentsAPI = {
  getAll: () => apiClient.get('/payments'),
  getById: (id: number) => apiClient.get(`/payments/${id}`),
  create: (data: any) => apiClient.post('/payments', data),
  update: (id: number, data: any) => apiClient.put(`/payments/${id}`, data),
};

export const ratingsAPI = {
  getAll: () => apiClient.get('/ratings'),
  create: (data: any) => apiClient.post('/ratings', data),
};

export const rolesAPI = {
  getAll: () => apiClient.get('/roles'),
  getByUserId: (userId: number) => apiClient.get(`/roles/user/${userId}`),
  create: (data: any) => apiClient.post('/roles', data),
  update: (id: number, data: any) => apiClient.put(`/roles/${id}`, data),
};

export const vehiclesAPI = {
  getAll: () => apiClient.get('/vehicles'),
  getById: (id: number) => apiClient.get(`/vehicles/${id}`),
  create: (data: any) => apiClient.post('/vehicles', data),
  update: (id: number, data: any) => apiClient.put(`/vehicles/${id}`, data),
};

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  update: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
};