import { useState, useEffect } from 'react';

export function useFetchData(endpoint) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:1234/${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        });
        //if (!res.ok) throw new Error('Error al obtener datos');
        if (!res.ok) {
          const errorText = await res.text(); // para ver qué manda el servidor
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [endpoint]);

  return data;
}