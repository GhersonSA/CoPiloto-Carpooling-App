import { useState, useEffect, useCallback } from 'react';
import { rolesAPI } from '../api/client';
import { useAuth } from './useAuth';
import { Role } from '../types';

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await rolesAPI.getAll();
      setRoles(response.data);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const isChofer = roles.some((r) => r.tipo === 'chofer' && r.activo);
  const isPasajero = roles.some((r) => r.tipo === 'pasajero' && r.activo);

  const deleteRole = async (tipo: string) => {
    await rolesAPI.delete(tipo);
    await fetchRoles();
  };

  return { roles, loading, isChofer, isPasajero, fetchRoles, deleteRole };
}
