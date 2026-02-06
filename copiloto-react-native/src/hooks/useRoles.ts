import { useState, useEffect } from "react";
import { rolesAPI } from "../api/client";
import { useAuth } from "./useAuth";
import { Role } from "../types";

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRoles();
    }
  }, [user?.id]);

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getByUserId(user!.id);
      setRoles(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const isChofer = roles.some((r) => r.tipo === "chofer" && r.activo);
  const isPasajero = roles.some((r) => r.tipo === "pasajero" && r.activo);
  const isAdmin = roles.some((r) => r.tipo === "admin" && r.activo);

  return { roles, loading, isChofer, isPasajero, isAdmin, refetch: fetchRoles };
}
