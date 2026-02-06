'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Todas las llamadas de auth pasan por los proxies `/api/auth/*`

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
    };

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white shadow-md md:px-8 z-20">
            <div className="lg:hidden">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden text-gray-800 text-4xl hover:text-blue-500 active:text-primary focus:outline-none cursor-pointer"
                >
                    <i className="fa-solid fa-bars-staggered"></i>
                </button>
            </div>
            <Link href="/home" className="text-2xl font-bold lg:hidden">
                <Image src="/assets/CoPiloto-logo-4.png" alt="CoPiloto Logo" width={180} height={80} className="md:h-20 h-15" style={{ height: "auto", width: "auto" }} />
            </Link>
            <p className="text-gray-500 text-3xl italic font-medium hidden lg:block">Versión 2.0</p>
            <div className="hidden md:flex gap-5 items-center">
                <Link href="/profile" className="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer text-xl">
                    {loading ? "Cargando..." : (user?.nombre || user?.username || user?.email || "Invitado")}
                </Link>
                <button onClick={() => router.push("/profile")} aria-label="User" className="text-4xl hover:scale-115 transition duration-300 ease hover:text-blue-950 cursor-pointer">
                    <i className="fa-regular fa-circle-user"></i>
                </button>
            </div>
            {isMenuOpen && (
                <aside className="fixed inset-0 w-full h-full bg-white z-20 flex flex-col justify-evenly items-center space-y-6 text-xl transform transition-transform duration-300 ease-in-out lg:hidden">
                    <Link href="/home" className="lg:hidden">
                        <Image src="/assets/CoPiloto-logo-4.png" alt="CoPiloto Logo" width={200} height={80} className="mt-20 h-20" style={{ height: "auto", width: "auto" }} />
                    </Link>
                    <div className="flex flex-col space-y-8 text-3xl font-secondary">
                        <Link href="/home" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-house"></i> Inicio
                        </Link>
                        <Link href="/travel" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-map-location-dot"></i> Viajes
                        </Link>
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-chart-line"></i> Dashboard
                        </Link>
                        <Link href="/passenger" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-users"></i> Pasajeros
                        </Link>
                        <Link href="/payments" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-money-check"></i> Pagos
                        </Link>
                        <Link href="/ratings" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-star"></i> Calificaciones
                        </Link>
                        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-regular fa-circle-user"></i> Tú Perfil
                        </Link>
                        <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="mobile-menu-button">
                            <i className="fa-solid fa-gear"></i> Ajustes
                        </Link>
                        <button onClick={handleLogout} className="mobile-menu-button">
                            <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                        </button>
                    </div>
                    <div>
                        <div className="flex justify-center gap-4 mb-4">
                            <a href="https://www.linkedin.com/in/gherson-sa/" target="_blank" aria-label="LinkedIn" className="text-4xl hover:scale-115 transition duration-300 ease hover:text-primary active:text-primary cursor-pointer">
                                <i className="fa-brands fa-linkedin-in"></i>
                            </a>
                            <a href="https://github.com/GhersonSA" target="_blank" aria-label="GitHub" className="text-4xl hover:scale-115 transition duration-300 ease hover:text-primary active:text-primary cursor-pointer">
                                <i className="fa-brands fa-github"></i>
                            </a>
                        </div>
                        <h3 className="text-center text-sm flex items-center justify-center text-gray-600 shadow-inherit bg-white">
                            © CoPiloto by GhersonSA. 2025.
                        </h3>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-6xl active:text-primary cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </aside>
            )}
        </header>
    );
}

export default Header;