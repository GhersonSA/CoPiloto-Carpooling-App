'use client';

import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface RouteMapProps {
    origen: string;
    destino: string;
    paradas?: { direccion: string }[];
    isReturnTrip?: boolean;
}

const RouteMap = ({ origen, destino, paradas = [], isReturnTrip = false }: RouteMapProps) => {
    const { isLoaded } = useGoogleMaps();

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [center, setCenter] = useState({ lat: 40.4168, lng: -3.7038 });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Validar que las direcciones no estén vacías
        if (!isLoaded || !origen || !destino || origen.trim() === '' || destino.trim() === '') {
            setError('Faltan direcciones de origen o destino');
            return;
        }

        setError(null);
        const directionsService = new google.maps.DirectionsService();

        const start = isReturnTrip ? destino : origen;
        const end = isReturnTrip ? origen : destino;

        // Filtrar paradas vacías
        const waypoints = paradas
            .filter(p => p.direccion && p.direccion.trim() !== '')
            .map((parada) => ({
                location: parada.direccion,
                stopover: true,
            }));

        if (isReturnTrip) {
            waypoints.reverse();
        }

        directionsService.route(
            {
                origin: start,
                destination: end,
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                    const leg = result.routes[0].legs[0];
                    setCenter({
                        lat: leg.start_location.lat(),
                        lng: leg.start_location.lng(),
                    });
                } else {
                    console.error('Error calculando ruta:', status);
                    setError(`No se pudo calcular la ruta. Verifica que las direcciones sean correctas. (${status})`);
                }
            }
        );
    }, [isLoaded, origen, destino, paradas, isReturnTrip]);

    if (!isLoaded) return <p className="text-center text-gray-500">Cargando mapa...</p>;

    if (error) {
        return (
            <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">
                <p className="font-semibold">⚠️ Error al cargar el mapa:</p>
                <p>{error}</p>
                <p className="text-sm mt-2">Asegúrate de usar direcciones completas y válidas (ej: "Calle Gran Vía 1, Madrid, España")</p>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '500px', borderRadius: '12px' }}
            center={center}
            zoom={12}
        >
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
};

export default RouteMap;