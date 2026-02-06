import { useState, useEffect, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: number;
  nombre: string;
  username: string;
  email: string;
  provider?: string;
  role?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncGoogleSession = useCallback(async () => {
    if (!session?.user?.email) return false;

    try {
      // Limpia posibles cookies antiguas para evitar tokens obsoletos
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      } catch {}

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: session.user.email,
          provider: "google",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Sincronización Google exitosa:", data);
        setUser(data.user || data);
        return true;
      }
      console.error("Error sincronizando Google:", res.status);
      return false;
    } catch (err) {
      console.error("Error sincronizando sesión de Google:", err);
      return false;
    }
  }, [session?.user?.email]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      }
      console.error("Error obteniendo usuario:", res.status);
      setUser(null);
      return false;
    } catch (err) {
      console.error("Error en fetchUser:", err);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    const initAuth = async () => {
      setLoading(true);

      const hasBackendUser = await fetchUser();

      if (!hasBackendUser && session?.user?.email) {
        const synced = await syncGoogleSession();
        if (synced) {
          await fetchUser();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [status, session?.user?.email, fetchUser, syncGoogleSession]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();

      // Tras login, consulta /api/auth/me para asegurar que el token/cookie se usa correctamente
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const me = await meRes.json();
          setUser(me);
        } else {
          setUser(data.user || data);
        }
      } catch {
        setUser(data.user || data);
      }
      return data;
    }
    const errorData = await res.json().catch(() => ({}));
    console.error("Error en login:", errorData);
    throw new Error(errorData.message || "Login failed");
  };

  const logout = async () => {
    try {
      setUser(null);

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (
          name.includes("auth") ||
          name.includes("token") ||
          name.includes("next-auth")
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      await nextAuthSignOut({ callbackUrl: "/", redirect: true });
    } catch (error) {
      console.error("Error en logout:", error);
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      window.location.href = "/";
    }
  };

  return { user, loading, login, logout, session };
}
