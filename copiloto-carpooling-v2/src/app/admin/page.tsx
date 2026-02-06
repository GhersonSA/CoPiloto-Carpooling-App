'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface User {
    id: number;
    email: string;
    username: string;
    nombre: string;
    provider: string;
    role: string;
    created_at: string;
}

const AdminPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const toast = useToast();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            toast.error('Acceso denegado: Solo administradores');
            router.push('/home');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error('Error al cargar usuarios');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDelete = async (id: number, role: string) => {
        if (role === 'admin' || role === 'guest') {
            toast.error('No puedes eliminar este usuario');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Usuario eliminado');
                setUsers(users.filter((u) => u.id !== id));
            } else {
                toast.error('Error al eliminar usuario');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar usuario');
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            admin: 'bg-red-500 text-white',
            guest: 'bg-gray-500 text-white',
            user: 'bg-blue-500 text-white',
        };
        return styles[role] || styles.user;
    };

    const getProviderBadge = (provider: string) => {
        const styles: Record<string, string> = {
            google: 'bg-red-100 text-red-700',
            local: 'bg-green-100 text-green-700',
        };
        return styles[provider] || styles.local;
    };

    if (loading || loadingUsers) {
        return (
            <section className="section-container">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950"></div>
                </div>
            </section>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <section className="section-container">
            <h2 className="section-h2">Panel de Administración</h2>

            <div className="m-5">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-blue-950">
                            Usuarios Registrados ({users.length})
                        </h3>
                    </div>

                    {/* Tabla de usuarios */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-950 text-white">
                                    <th className="p-4 rounded-tl-lg">ID</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Username</th>
                                    <th className="p-4">Rol</th>
                                    <th className="p-4">Proveedor</th>
                                    <th className="p-4">Fecha Registro</th>
                                    <th className="p-4 rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => (
                                    <tr
                                        key={u.id}
                                        className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="p-4 font-semibold text-blue-950">{u.id}</td>
                                        <td className="p-4">{u.nombre}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">@{u.username}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.role)}`}
                                            >
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getProviderBadge(u.provider)}`}
                                            >
                                                {u.provider === 'google' ? '🔗 Google' : '📧 Local'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString('es-ES')
                                                : '-'}
                                        </td>
                                        <td className="p-4">
                                            {u.role !== 'admin' && u.role !== 'guest' ? (
                                                <button
                                                    onClick={() => handleDelete(u.id, u.role)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Protegido</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            No hay usuarios registrados
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AdminPage;