import { useState, useEffect } from "react";

export function useFetchData<T = any>(endpoint: string): T[] {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Use Next.js proxy so cookies are forwarded
        const res = await fetch(`/api/${endpoint}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          console.error(`Error ${res.status} en /api/${endpoint}`);
          return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error(`La ruta /api/${endpoint} no devuelve JSON`);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(`Error en useFetchData(/api/${endpoint}):`, err);
      }
    }
    fetchData();
  }, [endpoint]);

  return data;
}
