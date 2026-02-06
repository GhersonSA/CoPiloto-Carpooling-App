'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, OverlayView, InfoWindow, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useToast } from '@/components/Toast';
import { MapPoint, InteractiveMapProps } from '@/types/Map';
import MapControls from '../Home/MapControls';
import { useGuest } from '@/hooks/useGuest';
import { getProxiedImageUrl } from '@/lib/imageUtils';

const getContainerHeight = () => {
    if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
            return 'calc(100vh - 75px)';
        } else if (width < 1024) {
            return 'calc(100vh - 87px)';
        } else {
            return 'calc(100vh - 87px)';
        }
    }
    return 'calc(100vh - 87px)';
};

const defaultCenter = { lat: 41.6488, lng: -0.8891, };

const parseParadas = (rawParadas: unknown) => {
    if (!rawParadas) return [];
    if (Array.isArray(rawParadas)) return rawParadas;
    if (typeof rawParadas === 'string') {
        try {
            const parsed = JSON.parse(rawParadas);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const formatHora = (hora?: string) => (hora ? hora.slice(0, 5) : '—');

// Función para abrir WhatsApp
const openWhatsApp = (telefono?: string, nombre?: string) => {
    if (!telefono) {
        toast.warning('Este usuario no tiene teléfono registrado');
        return;
    }
    // El número ya viene con +34, solo limpiar caracteres extra
    const cleanPhone = telefono.replace(/[\s\-\(\)]/g, '');
    const message = encodeURIComponent(`¡Hola${nombre ? ` ${nombre}` : ''}! Te contacto desde Copiloto para solicitar un viaje, ¿estás disponible?`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

const InteractiveMap = ({ drivers, passengers, routes, routePassengers, onOpenModal }: InteractiveMapProps) => {
    const { isGuest } = useGuest();
    const toast = useToast();
    const router = useRouter();
    const { isLoaded } = useGoogleMaps();
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
    const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
    const [filteredPoints, setFilteredPoints] = useState<MapPoint[]>([]);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [filter, setFilter] = useState<'todo' | 'chofer' | 'pasajero'>('todo');
    const [isMounted, setIsMounted] = useState(false);
    const [containerHeight, setContainerHeight] = useState('calc(100vh - 87px)');
    const [isMobileView, setIsMobileView] = useState(false);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window === 'undefined') return;

        const updateLayout = () => {
            setContainerHeight(getContainerHeight());
            setIsMobileView(true);
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => console.warn('Geolocation error:', error),
            { enableHighAccuracy: true, maximumAge: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (!isLoaded || !window.google) return;

        let cancelled = false;
        const geocoder = new google.maps.Geocoder();
        const points: MapPoint[] = [];

        const geocodeAddress = (address?: string) =>
            new Promise<google.maps.LatLngLiteral | null>((resolve) => {
                if (!address) return resolve(null);
                geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK' && results?.[0]) {
                        resolve({
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        });
                    } else {
                        resolve(null);
                    }
                });
            });

        const tasks: Promise<void>[] = [];

        routes?.forEach((route: any) => {
            // La ruta ya incluye img_chofer, chofer_nombre, etc. del backend
            // Si no, buscar el driver por user_id
            const driver = drivers?.find((d: any) => d.user_id === route.chofer_id);
            
            // Usar la imagen de la ruta directamente (viene del join en backend)
            // o fallback al driver encontrado
            const imgChofer = route.img_chofer || driver?.img_chofer || driver?.image;
            const nombreChofer = route.chofer_nombre || driver?.nombre || driver?.name || 'Chofer';
            const usernameChofer = route.chofer_username || driver?.username || driver?.email?.split('@')[0] || 'usuario';

            tasks.push(
                geocodeAddress(route.origen).then((coords) => {
                    if (!coords) return;
                    points.push({
                        id: `chofer-origen-${route.id}`,
                        lat: coords.lat,
                        lng: coords.lng,
                        type: 'origen',
                        user: {
                            nombre: nombreChofer,
                            username: usernameChofer,
                            img: getProxiedImageUrl(imgChofer),
                            calificacion: route.calificacion || driver?.calificacion || driver?.rating,
                            telefono: route.telefono || driver?.telefono
                        },
                        details: {
                            ...route,
                            nombre: nombreChofer,
                            username: usernameChofer,
                            vehiculo: driver?.vehiculo,
                            telefono: route.telefono || driver?.telefono
                        },
                        userType: 'chofer'
                    });
                })
            );

            tasks.push(
                geocodeAddress(route.destino).then((coords) => {
                    if (!coords) return;
                    points.push({
                        id: `chofer-destino-${route.id}`,
                        lat: coords.lat,
                        lng: coords.lng,
                        type: 'destino',
                        user: {
                            nombre: nombreChofer,
                            username: usernameChofer,
                            img: getProxiedImageUrl(imgChofer),
                            calificacion: route.calificacion || driver?.calificacion || driver?.rating,
                            telefono: route.telefono || driver?.telefono
                        },
                        details: {
                            ...route,
                            nombre: nombreChofer,
                            username: usernameChofer,
                            vehiculo: driver?.vehiculo,
                            telefono: route.telefono || driver?.telefono
                        },
                        userType: 'chofer'
                    });
                })
            );
        });

        routePassengers?.forEach((route: any) => {
            const passenger = passengers?.find((p: any) => p.user_id === route.pasajero_id);

            tasks.push(
                geocodeAddress(route.origen).then((coords) => {
                    if (!coords) return;
                    points.push({
                        id: `pasajero-origen-${route.id}`,
                        lat: coords.lat,
                        lng: coords.lng,
                        type: 'origen',
                        user: {
                            nombre: passenger?.nombre || passenger?.name,
                            username: passenger?.username || passenger?.email?.split('@')[0],
                            img: getProxiedImageUrl(passenger?.img_pasajero || passenger?.image),
                            calificacion: passenger?.calificacion || passenger?.rating,
                            telefono: passenger?.telefono
                        },
                        details: { ...route, ...passenger },
                        userType: 'pasajero'
                    });
                })
            );

            tasks.push(
                geocodeAddress(route.destino).then((coords) => {
                    if (!coords) return;
                    points.push({
                        id: `pasajero-destino-${route.id}`,
                        lat: coords.lat,
                        lng: coords.lng,
                        type: 'destino',
                        user: {
                            nombre: passenger?.nombre || passenger?.name,
                            username: passenger?.username || passenger?.email?.split('@')[0],
                            img: getProxiedImageUrl(passenger?.img_pasajero || passenger?.image),
                            calificacion: passenger?.calificacion || passenger?.rating,
                            telefono: passenger?.telefono
                        },
                        details: { ...route, ...passenger },
                        userType: 'pasajero'
                    });
                })
            );
        });

        if (!tasks.length) {
            setMapPoints([]);
            setFilteredPoints([]);
            return;
        }

        Promise.all(tasks).then(() => {
            if (cancelled) return;
            setMapPoints(points);
            setFilteredPoints(points);
        });

        return () => {
            cancelled = true;
        };
    }, [isLoaded, drivers, passengers, routes, routePassengers]);

    useEffect(() => {
        if (filter === 'todo') {
            setFilteredPoints(mapPoints);
        } else {
            setFilteredPoints(mapPoints.filter((point) => point.userType === filter));
        }
    }, [filter, mapPoints]);

    useEffect(() => {
        if (!selectedPoint || !window.google) return;

        const directionsService = new google.maps.DirectionsService();
        const waypoints: google.maps.DirectionsWaypoint[] = [];

        if (selectedPoint.userType === 'chofer' && selectedPoint.details?.paradas) {
            try {
                const paradasArray = parseParadas(selectedPoint.details.paradas);
                paradasArray.forEach((parada: any) => {
                    if (parada?.direccion) {
                        waypoints.push({ location: parada.direccion, stopover: true });
                    }
                });
            } catch (error) {
                console.error('Error procesando paradas:', error);
            }
        }

        directionsService.route(
            {
                origin: selectedPoint.details.origen,
                destination: selectedPoint.details.destino,
                waypoints: waypoints.length ? waypoints : undefined,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    setDirectionsResponse(result);
                } else {
                    console.error('Error obteniendo ruta:', status);
                    setDirectionsResponse(null);
                }
            }
        );
    }, [selectedPoint]);

    const handlePointClick = (point: MapPoint) => {
        setSelectedPoint(point);
    };

    const handleCloseInfo = () => {
        setSelectedPoint(null);
        setDirectionsResponse(null);
    };

    const handleLocateMe = () => {
        if (userLocation && map) {
            map.panTo(userLocation);
            map.setZoom(14);
        }
    };

    const handleRequest = () => {
        if (!selectedPoint) return;
        onOpenModal(selectedPoint.userType, selectedPoint.details);
        handleCloseInfo();
    };

    const handleWhatsApp = () => {
        if (!selectedPoint) return;
        openWhatsApp(
            selectedPoint.user.telefono || selectedPoint.details.telefono,
            selectedPoint.user.nombre
        );
    };

    const handleRate = () => {
        router.push('/ratings');
    };

    const getMarkerSize = (currentZoom: number) => {
        if (currentZoom <= 10) return 0;
        if (currentZoom <= 12) return 30;
        if (currentZoom <= 14) return 50;
        return 60;
    };

    if (!isLoaded || !isMounted) {
        return (
            <div className="w-full bg-white flex justify-center items-center" style={{ height: 'calc(100vh - 87px)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-950 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-600">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    const markerSize = getMarkerSize(zoom);
    const pointsToShow = selectedPoint
        ? filteredPoints.filter(
            (p) =>
                p.id === selectedPoint.id ||
                (p.details.id === selectedPoint.details.id && p.userType === selectedPoint.userType)
        )
        : filteredPoints;

    return (
        <div className="relative w-full" style={{ height: containerHeight }}>
            <MapControls filter={filter} onFilterChange={setFilter} isDisabled={!!selectedPoint} />

            {userLocation && (
                <button
                    onClick={handleLocateMe}
                    className="absolute bottom-45 right-7.5 md:bottom-20 z-20 bg-white border-2 border-blue-950 text-blue-900 w-15 h-15 lg:w-20 lg:h-20 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition"
                    aria-label="Volver a mi ubicación"
                >
                    <i className="fa-solid fa-location-crosshairs text-2xl lg:text-3xl"></i>
                </button>
            )}

            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={defaultCenter}
                zoom={13}
                onLoad={(mapInstance) => setMap(mapInstance)}
                onZoomChanged={() => {
                    if (map) setZoom(map.getZoom() || 13);
                }}
                options={{
                    disableDefaultUI: true,
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    gestureHandling: 'greedy',
                    styles: [
                        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                        { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
                        { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                        { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
                        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfdbfe' }] },
                        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#60a5fa' }] },
                        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] },
                        { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f3f4f6' }] },
                        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e5e7eb' }, { weight: 0.5 }] },
                    ]
                }}
            >
                {userLocation && (
                    <OverlayView position={userLocation} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-950 border-2 border-blue-950 shadow-xl text-yellow-400">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                    </OverlayView>
                )}

                {markerSize > 0 &&
                    pointsToShow.map((point) => (
                        <OverlayView
                            key={point.id}
                            position={{ lat: point.lat, lng: point.lng }}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div
                                onClick={() => handlePointClick(point)}
                                className="cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    width: `${markerSize}px`,
                                    height: `${markerSize}px`
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={point.user.img}
                                    alt={point.user.nombre || 'Usuario'}
                                    width={markerSize}
                                    height={markerSize}
                                    className={`w-full h-full rounded-full object-cover border-4 ${point.userType === 'chofer' ? 'border-blue-950' : 'border-green-600'
                                        } bg-white shadow-lg hover:scale-110 transition-transform`}
                                />
                            </div>
                        </OverlayView>
                    ))}

                {directionsResponse && (
                    <>
                        <DirectionsRenderer
                            directions={directionsResponse}
                            options={{
                                suppressMarkers: true,
                                polylineOptions: {
                                    strokeColor: selectedPoint?.userType === 'chofer' ? '#172554' : '#16a34a',
                                    strokeWeight: 5,
                                    strokeOpacity: 0.85
                                }
                            }}
                        />
                        {selectedPoint && directionsResponse.routes[0] && (
                            <>
                                <Marker
                                    position={directionsResponse.routes[0].legs[0].start_location}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 10,
                                        fillColor: '#172554',
                                        fillOpacity: 1,
                                        strokeColor: '#0f172a',
                                        strokeWeight: 3
                                    }}
                                    label={{
                                        text: 'I',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                />

                                {selectedPoint.userType === 'chofer' && selectedPoint.details?.paradas && (
                                    (() => {
                                        const paradasArray = parseParadas(selectedPoint.details.paradas);

                                        return paradasArray.map((parada: any, index: number) => {
                                            const legIndex = index + 1;
                                            const leg = directionsResponse.routes[0].legs[legIndex];

                                            if (!leg) return null;

                                            return (
                                                <Marker
                                                    key={`parada-${index}`}
                                                    position={leg.start_location}
                                                    icon={{
                                                        path: google.maps.SymbolPath.CIRCLE,
                                                        scale: 10,
                                                        fillColor: '#16a34a',
                                                        fillOpacity: 1,
                                                        strokeColor: '#16a34a',
                                                        strokeWeight: 3
                                                    }}
                                                    label={{
                                                        text: `${index + 1}P`,
                                                        color: 'white',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            );
                                        });
                                    })()
                                )}

                                <Marker
                                    position={directionsResponse.routes[0].legs[directionsResponse.routes[0].legs.length - 1].end_location}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 10,
                                        fillColor: '#172554',
                                        fillOpacity: 1,
                                        strokeColor: '#0f172a',
                                        strokeWeight: 3
                                    }}
                                    label={{
                                        text: 'F',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </>
                        )}
                    </>
                )}
            </GoogleMap>

            {selectedPoint && (
                <div className="fixed left-4 right-4 bottom-24 z-30 md:left-10 md:bottom-25 lg:left-105 lg:bottom-14">
                    <div className="map-sheet bg-white rounded-3xl shadow-[0_-18px_45px_rgba(15,23,42,0.35)] p-5 relative w-full max-w-[320px] mx-auto md:mx-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-24 h-24 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedPoint.user.img}
                                    alt={selectedPoint.user.nombre || 'Usuario'}
                                    width={64}
                                    height={64}
                                    className={`rounded-full object-cover border-4 w-24 h-24 ${selectedPoint.userType === 'chofer' ? 'border-blue-950' : 'border-green-600'}`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-blue-950 truncate">
                                    {selectedPoint.user.nombre || selectedPoint.user.username}
                                </h3>
                                {selectedPoint.user.calificacion && (
                                    <p className="text-yellow-500 text-sm">
                                        <i className="fa-solid fa-star mr-1"></i>
                                        {selectedPoint.user.calificacion}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    onClick={handleRate}
                                    className="w-full font-semibold py-2.5 rounded-2xl border border-blue-950 text-blue-900 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-md cursor-pointer">
                                    <i className="fa-solid fa-star"></i>
                                    Opinar
                                </button>
                            </div>
                            <div>
                                <button
                                    onClick={handleCloseInfo}
                                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                    aria-label="Cerrar detalles"
                                >
                                    <i className="fa-solid fa-xmark text-4xl"></i>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-md mb-4">
                            <p className="truncate">
                                <span className="font-bold text-blue-950">Origen:</span> {selectedPoint.details.origen || '—'}
                            </p>
                            <p className="truncate">
                                <span className="font-bold text-blue-950">Destino:</span> {selectedPoint.details.destino || '—'}
                            </p>
                            {selectedPoint.details.dias && (
                                <p>
                                    <span className="font-bold text-blue-950">Días:</span> {selectedPoint.details.dias}
                                </p>
                            )}
                            <div className="flex gap-4">
                                {(selectedPoint.details.hora_salida || selectedPoint.details.horaSalida) && (
                                    <p>
                                        <span className="font-bold text-blue-950">Salida:</span>{' '}
                                        {formatHora(selectedPoint.details.hora_salida || selectedPoint.details.horaSalida)}
                                    </p>
                                )}
                                {(selectedPoint.details.hora_llegada || selectedPoint.details.horaLlegada) && (
                                    <p>
                                        <span className="font-bold text-blue-950">Llegada:</span>{' '}
                                        {formatHora(selectedPoint.details.hora_llegada || selectedPoint.details.horaLlegada)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción: Solicitar y WhatsApp */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isGuest) {
                                        toast.warning('Modo invitado: Regístrate para solicitar viajes');
                                        return;
                                    }
                                    handleRequest();
                                }}
                                disabled={isGuest}
                                className={`flex-1 font-semibold py-2.5 rounded-2xl text-white bg-blue-950 hover:bg-blue-900 transition flex items-center justify-center gap-2 text-md ${isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                                Solicitar
                            </button>
                            <button
                                onClick={() => {
                                    if (isGuest) {
                                        toast.warning('Modo invitado: Regístrate para contactar por WhatsApp');
                                        return;
                                    }
                                    handleWhatsApp();
                                }}
                                disabled={isGuest}
                                className={`flex-1 font-semibold py-2.5 rounded-2xl text-white bg-green-500 hover:bg-green-600 transition flex items-center justify-center gap-2 text-md ${isGuest ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <i className="fa-brands fa-whatsapp text-xl"></i>
                                Contactar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;