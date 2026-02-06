'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DriverCardProps } from '@/types/Driver';

// Usar proxy de Next.js para preservar cookies/JWT

const DriverCard = (props: DriverCardProps) => {
    const { img, nombre, direccion, barrio, rutas = [], onClick } = props;
    const [user, setUser] = useState<{ nombre?: string; username?: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Error al obtener usuario logeado');
                const data = await res.json();
                setUser(data);
            } catch (err) {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    return (
        <div onClick={onClick} className="cursor-pointer">
            <div className="home-cards">
                <div className="img-driver-cards-container">
                    {img ? (
                        <Image src={img} alt={user?.nombre || 'Chofer'} width={120} height={120} className="img-home-cards" />
                    ) : (
                        <div className="img-home-cards bg-gray-200" />
                    )}
                </div>
                <h2 className="text-4xl text-blue-950 font-bold mb-2 mt-6">
                    {nombre || user?.nombre || user?.username || 'Cargando...'}
                </h2>
                {direccion && (
                    <span className="text-xl text-gray-700">
                        <strong className="text-blue-950">Dirección:</strong> {direccion} →
                    </span>
                )}
                {barrio && (
                    <span className="text-xl text-gray-700">
                        <strong className="text-blue-950"> Barrio:</strong> {barrio}
                    </span>
                )}

                {rutas.length > 0 && (
                    <div className="mt-4">
                        {rutas.map((ruta, i) => (
                            <div key={i} className="border-t border-gray-300 mt-2 pt-2">
                                <p className="text-xl text-gray-700">
                                    <strong className="text-blue-950">Ruta:</strong> {ruta.origen} - {ruta.destino}
                                </p>
                                {'dias' in ruta && (
                                    <p className="text-xl text-gray-700">
                                        <strong className="text-blue-950">Días:</strong> {ruta.dias}
                                    </p>
                                )}
                                <p className="mt-1 text-xl text-gray-600">
                                    <strong className="text-blue-950">Salida:</strong> {ruta.hora_salida || '-'} → {ruta.hora_llegada || '-'} <br />
                                    <strong className="text-blue-950">Regreso:</strong> {ruta.hora_regreso || '-'} → {ruta.hora_llegada_regreso || '-'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverCard;