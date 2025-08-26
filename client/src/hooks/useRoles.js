import { useState, useEffect } from "react";
import { BACKEND_URL } from '../config';
import axios from "axios";

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = async () => {
        try {
        const res = await axios.get(`${BACKEND_URL}/roles/mis-roles`, { withCredentials: true });
        setRoles(res.data || []);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    // Activar un rol
    const activarRol = async (tipo, data) => {
        try {
        const res = await axios.post(`${BACKEND_URL}/roles`, { tipo, data }, { withCredentials: true });
        await fetchRoles(); // refrescar roles después de activar
        return res.data;
        } catch (err) {
        console.error(err);
        throw err;
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return { roles, loading, activarRol, fetchRoles };
};
