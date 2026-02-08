'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type TabItem = {
    icon: string;
    label: string;
    path: string;
    isMain?: boolean;
};

const mobileTabs: TabItem[] = [
    { icon: 'fa-users', label: 'Pasajeros', path: '/passenger' },
    { icon: 'fa-money-check', label: 'Pagos', path: '/payments' },
    { icon: 'fa-earth-americas', label: 'Inicio', path: '/home', isMain: true },
    { icon: 'fa-chart-line', label: 'Stats', path: '/dashboard' },
    { icon: 'fa-circle-user', label: 'Perfil', path: '/profile' }
];

const tabletTabs: TabItem[] = [
    { icon: 'fa-map-location-dot', label: 'Rutas', path: '/travel' },
    { icon: 'fa-chart-line', label: 'Dashboard', path: '/dashboard' },
    { icon: 'fa-users', label: 'Pasajeros', path: '/passenger' },
    { icon: 'fa-money-check', label: 'Pagos', path: '/payments' },
    { icon: 'fa-compass', label: 'Inicio', path: '/home', isMain: true },
    { icon: 'fa-medal', label: 'Calificaciones', path: '/ratings' },
    { icon: 'fa-circle-user', label: 'Perfil', path: '/profile' },
    { icon: 'fa-gear', label: 'Ajustes', path: '/settings' }
];

const TabBar = () => {
    const [showModal, setShowModal] = useState(false);
    const pathname = usePathname();
    const { logout } = useAuth();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = async () => {
        setShowModal(false);
        await logout(); // logout ya hace la redirección
    };

    return (
        <>
            {/* TabBar para Mobile (sm y menores) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-10 md:hidden">
                <div className="flex justify-around items-center h-20 max-w-7xl mx-auto">
                    {mobileTabs.map((tab) => {
                        const isActive = pathname === tab.path;
                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigation(tab.path)}
                                className={`group flex flex-col items-center justify-center relative ${tab.isMain ? 'w-16' : 'w-full'} h-full transition-all duration-200`}
                                aria-label={tab.label}>
                                {tab.isMain ? (
                                    <div
                                        className={`absolute -top-6 flex items-center justify-center w-16 h-16 border-2 rounded-full shadow-xl transition-transform duration-200 ${isActive ? 'bg-linear-to-br from-blue-900 to-blue-950 border-blue-950 text-white scale-110' : 'bg-white border-blue-950 text-blue-950 group-hover:scale-105'
                                            }`}>
                                        <i className={`fa-solid ${tab.icon} text-2xl`}></i>
                                    </div>
                                ) : (
                                    <>
                                        <span
                                            className={`text-2xl mb-1 transition-all duration-200 ${isActive ? 'text-blue-950 scale-110 drop-shadow-md' : 'text-gray-500 group-hover:text-blue-800 group-hover:-translate-y-1'
                                                }`}>
                                            <i className={`fa-solid ${tab.icon}`}></i>
                                        </span>
                                        <span
                                            className={`text-xs font-semibold transition-colors ${isActive ? 'text-blue-950' : 'text-gray-500 group-hover:text-blue-800'
                                                }`}>
                                            {tab.label}
                                        </span>
                                    </>
                                )}
                                {isActive && !tab.isMain && (
                                    <div className="absolute top-0 w-12 h-1 bg-blue-950 rounded-b-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TabBar para Tablet (md a lg) */}
            <div className="hidden md:block lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-10">
                <div className="flex justify-around items-center h-20 max-w-7xl mx-auto px-4">
                    {tabletTabs.map((tab) => {
                        const isActive = pathname === tab.path;
                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigation(tab.path)}
                                className={`group flex flex-col items-center justify-center relative ${tab.isMain ? 'w-16' : 'flex-1'} h-full transition-all duration-200`}
                                aria-label={tab.label}>
                                {tab.isMain ? (
                                    <div
                                        className={`absolute -top-6 flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-transform duration-200 ${isActive ? 'bg-yellow-400 text-blue-950 scale-110' : 'bg-linear-to-br from-blue-900 to-blue-950 text-white group-hover:scale-105'
                                            }`} >
                                        <i className={`fa-solid ${tab.icon} text-2xl`}></i>
                                    </div>
                                ) : (
                                    <>
                                        <span
                                            className={`text-xl mb-1 transition-all ${isActive ? 'text-blue-950 scale-110 drop-shadow-md' : 'text-gray-500 group-hover:text-blue-800 group-hover:-translate-y-1'
                                                }`}>
                                            <i className={`fa-solid ${tab.icon}`}></i>
                                        </span>
                                        <span
                                            className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-blue-950' : 'text-gray-500 group-hover:text-blue-800'
                                                }`}>
                                            {tab.label}
                                        </span>
                                    </>
                                )}
                                {isActive && !tab.isMain && (
                                    <div className="absolute top-0 w-10 h-1 bg-blue-950 rounded-b-full"></div>
                                )}
                            </button>
                        );
                    })}

                    {/* Botón de Cerrar Sesión */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 hover:bg-red-50">
                        <span className="text-xl mb-1 opacity-80 group-hover:opacity-100 transition-all">
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </span>
                        <span className="text-[10px] font-semibold">
                            Salir
                        </span>
                    </button>
                </div>
            </div>

            {/* Modal de confirmación de logout */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg text-center space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">¿Cerrar sesión?</h2>
                        <p className="text-gray-600">¿Estás seguro de que deseas cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                                Sí, cerrar
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TabBar;