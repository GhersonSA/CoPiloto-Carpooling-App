'use client';

import { useState, useEffect } from 'react';
import { useFetchData } from '@/hooks/useFetchData';
import RouteMap from '@/components/Map/RouteMap';

const Travel = () => {
    // Rutas de choferes del usuario actual (usa el endpoint que filtra por usuario)
    const routesChofer = useFetchData('routes/mis-rutas');
    // Rutas de pasajeros del usuario actual
    const routesPasajero = useFetchData('route-passengers/mis-rutas');

    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [isReturnTrip, setIsReturnTrip] = useState(false);

    // Combinar rutas de choferes y pasajeros
    const allRoutes = [
        ...(routesChofer?.map((r: any) => ({ ...r, tipo: 'chofer' })) || []),
        ...(routesPasajero?.map((r: any) => ({ ...r, tipo: 'pasajero' })) || [])
    ];

    // Seleccionar automáticamente la primera ruta si solo hay una
    useEffect(() => {
        if (allRoutes.length === 1 && !selectedRoute) {
            setSelectedRoute(allRoutes[0]);
        }
    }, [allRoutes, selectedRoute]);

    return (
        <section className="section-container">
            <h2 className="section-h2">Mis Viajes</h2>
            <div className="m-5">
                {/* Lista de rutas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {allRoutes.map((route: any) => (
                        <div
                            key={`${route.tipo}-${route.id}`}
                            onClick={() => setSelectedRoute(route)}
                            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition ${selectedRoute?.id === route.id && selectedRoute?.tipo === route.tipo
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                                }`}
                        >
                            {/* Badge para identificar el tipo */}
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-blue-950">
                                    {route.origen} → {route.destino}
                                </h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${route.tipo === 'chofer'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}
                                >
                                    {route.tipo === 'chofer' ? '🚗 Chofer' : '👤 Pasajero'}
                                </span>
                            </div>

                            {route.tipo === 'chofer' && (
                                <p className="text-gray-600">
                                    Chofer: {route.chofer_nombre || route.chofer_username}
                                </p>
                            )}
                            <p className="text-gray-500">Días: {route.dias}</p>
                            <p className="text-gray-500">
                                Salida: {route.hora_salida?.slice(0, 5)} - Llegada:{' '}
                                {route.hora_llegada?.slice(0, 5)}
                            </p>
                            {route.hora_regreso && (
                                <p className="text-gray-500">
                                    Regreso: {route.hora_regreso?.slice(0, 5)} - Llegada Regreso:{' '}
                                    {route.hora_llegada_regreso?.slice(0, 5)}
                                </p>
                            )}
                            {/* Solo mostrar paradas si es ruta de chofer */}
                            {route.tipo === 'chofer' &&
                                route.paradas &&
                                Array.isArray(route.paradas) &&
                                route.paradas.length > 0 && (
                                    <p className="text-green-600 font-semibold mt-2">
                                        🚏 {route.paradas.length} parada(s)
                                    </p>
                                )}
                        </div>
                    ))}
                </div>

                {/* Mapa de la ruta seleccionada */}
                {selectedRoute && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-blue-950">
                                Ruta: {selectedRoute.origen} → {selectedRoute.destino}
                            </h3>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedRoute.tipo === 'chofer'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}
                            >
                                {selectedRoute.tipo === 'chofer' ? '🚗 Ruta de Chofer' : '👤 Ruta de Pasajero'}
                            </span>
                        </div>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setIsReturnTrip(false)}
                                className={`px-6 py-2 rounded-lg font-semibold transition ${!isReturnTrip
                                    ? 'bg-blue-950 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                🚗 Ruta de Ida
                            </button>
                            <button
                                onClick={() => setIsReturnTrip(true)}
                                className={`px-6 py-2 rounded-lg font-semibold transition ${isReturnTrip
                                    ? 'bg-blue-950 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                🔄 Ruta de Regreso
                            </button>
                        </div>
                        <RouteMap
                            origen={selectedRoute.origen}
                            destino={selectedRoute.destino}
                            paradas={selectedRoute.tipo === 'chofer' ? selectedRoute.paradas || [] : []}
                            isReturnTrip={isReturnTrip}
                        />
                    </div>
                )}

                {!selectedRoute && allRoutes.length > 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-xl">👆 Selecciona una ruta para ver el mapa</p>
                    </div>
                )}

                {allRoutes.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-xl">No tienes rutas configuradas</p>
                        <p className="text-gray-400 mt-2">Ve a tu perfil para crear una ruta como chofer o pasajero</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Travel;