import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";

export function useFetch<T>(endpoint: string, autoFetch = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/${endpoint}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return { data, loading, error, refetch: fetch };
}
