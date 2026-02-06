import { useState, useEffect, useCallback } from "react";

export function useRoles(user?: { id: number } | null, userLoading?: boolean) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    // Si el usuario aún se está cargando o no existe, no hacer nada
    if (userLoading || !user) {
      setLoading(false);
      setRoles([]);
      return;
    }

    try {
      setLoading(true);
      // Proxy via Next.js API to ensure cookies/JWT are forwarded
      const res = await fetch(`/api/roles`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error al obtener roles:", res.status);
        throw new Error("Error al obtener roles");
      }
      const data = await res.json();
      console.log("Roles cargados:", data);
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, setRoles, fetchRoles };
}