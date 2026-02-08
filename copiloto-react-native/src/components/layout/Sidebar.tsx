'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
    { href: '/home', icon: 'fa-house', label: 'Inicio' },
    { href: '/travel', icon: 'fa-map-location-dot', label: 'Viajes' },
    { href: '/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { href: '/passenger', icon: 'fa-users', label: 'Pasajeros' },
    { href: '/payments', icon: 'fa-money-check', label: 'Pagos' },
    { href: '/ratings', icon: 'fa-medal', label: 'Calificaciones' },
    { href: '/profile', icon: 'fa-circle-user', label: 'Tú perfil', regular: true },
];

const settingsItem = { href: '/settings', icon: 'fa-gear', label: 'Ajustes' };

export default function Sidebar() {
    const [showModal, setShowModal] = useState(false);
    const pathname = usePathname();
    const { logout } = useAuth();
    const { user } = useAuth();

    const handleLogout = async () => {
        setShowModal(false);
        await logout(); // logout ya hace la redirección
    };

    return (
        <aside className="hidden h-full bg-blue-950 z-20 lg:flex lg:flex-col lg:items-center space-y-6 text-xl w-md">
            <header className="shadow-md h-20 w-full flex items-center justify-center">
                <Link href="/home">
                    <Image src="/assets/CoPiloto-logo-6.png" alt="Logo" width={150} height={80} className="w-80 py-2" />
                </Link>
            </header>
            <nav className="flex flex-col justify-between h-full w-full text-white">
                <ul className="mt-4">
                    {menuItems.map(item => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <div className={`aside-botton flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition
                                ${pathname === item.href ? 'bg-white/10 text-yellow-500 font-bold' : 'text-white hover:bg-blue-900'}`}>
                                    <i className={`fa-solid ${item.regular ? 'fa-regular' : ''} ${item.icon} px-4`}></i>
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <Link href="/admin">
                                <div className={`aside-botton flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition
                                ${pathname === '/admin' ? 'bg-white/10 text-yellow-500 font-bold' : 'text-white hover:bg-blue-900'}`}>
                                    <i className="fa-solid fa-shield-halved px-4"></i>
                                    <span>Admin</span>
                                </div>
                            </Link>
                        </li>
                    )}
                </ul>
                <ul className="mb-4">
                    <li>
                        <Link href={settingsItem.href}>
                            <div className={`aside-botton flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition
                                ${pathname === settingsItem.href ? 'bg-white/10 text-yellow-500 font-bold' : 'text-white hover:bg-blue-900'}`}>
                                <i className={`fa-solid ${settingsItem.icon} px-4`}></i>
                                <span>{settingsItem.label}</span>
                            </div>
                        </Link>
                    </li>
                    <li className="aside-botton flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition text-white hover:bg-blue-900"
                        onClick={() => setShowModal(true)}>
                        <i className="fa-solid fa-right-from-bracket px-4"></i>
                        <span>Cerrar Sesión</span>
                    </li>
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg text-center space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">¿Cerrar sesión?</h2>
                                <p className="text-gray-600">¿Estás seguro de que deseas cerrar sesión?</p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        Sí, cerrar
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </ul>
            </nav>
        </aside>
    );
}