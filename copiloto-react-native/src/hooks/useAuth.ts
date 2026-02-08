import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nombre: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await authAPI.me();
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      await AsyncStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (nombre: string, username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ nombre, username, email, password });
      const { token, user: userData } = response.data;

      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrarse',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignorar errores de logout del servidor
    }
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, register, logout, checkAuth };
}

export { AuthContext };
