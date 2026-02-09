import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  Platform,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { routesAPI, routePassengersAPI } from '../api/client';
import { Loading } from '../components/ui/Loading';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface RouteItem {
  id: number;
  origen: string;
  destino: string;
  dias?: string;
  hora_salida?: string;
  hora_llegada?: string;
  hora_regreso?: string;
  hora_llegada_regreso?: string;
  chofer_nombre?: string;
  chofer_username?: string;
  paradas?: any[];
  tipo: 'chofer' | 'pasajero';
}

interface RouteCoord {
  latitude: number;
  longitude: number;
}

const formatHora = (h?: string) => (h ? h.slice(0, 5) : '');

const parseParadas = (raw: unknown): any[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function RoutesScreen() {
  const mapRef = useRef<MapView>(null);

  const [allRoutes, setAllRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [isReturnTrip, setIsReturnTrip] = useState(false);

  // Route polyline
  const [routeCoords, setRouteCoords] = useState<RouteCoord[]>([]);

  // ── Load data ──
  const loadRoutes = useCallback(async () => {
    try {
      const [choferRes, pasajeroRes] = await Promise.all([
        routesAPI.getMisRutas().catch(() => ({ data: [] })),
        routePassengersAPI.getMisRutas().catch(() => ({ data: [] })),
      ]);

      const choferRoutes: RouteItem[] = (Array.isArray(choferRes.data) ? choferRes.data : [])
        .map((r: any) => ({ ...r, paradas: parseParadas(r.paradas), tipo: 'chofer' as const }));
      const pasajeroRoutes: RouteItem[] = (Array.isArray(pasajeroRes.data) ? pasajeroRes.data : [])
        .map((r: any) => ({ ...r, tipo: 'pasajero' as const }));

      const combined = [...choferRoutes, ...pasajeroRoutes];
      setAllRoutes(combined);

      // Auto-select if only one route
      if (combined.length === 1) {
        setSelectedRoute(combined[0]);
      }
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  }, [loadRoutes]);

  // ── Fetch directions when a route is selected ──
  useEffect(() => {
    if (!selectedRoute) {
      setRouteCoords([]);
      return;
    }

    let cancelled = false;
    const { origen, destino, paradas } = selectedRoute;
    if (!origen || !destino) return;

    const fetchDirections = async () => {
      try {
        const actualOrigen = isReturnTrip ? destino : origen;
        const actualDestino = isReturnTrip ? origen : destino;

        let waypointsParam = '';
        if (selectedRoute.tipo === 'chofer' && paradas && paradas.length > 0 && !isReturnTrip) {
          const wayAddresses = paradas
            .map((p: any) => p?.direccion)
            .filter(Boolean);
          if (wayAddresses.length) {
            waypointsParam = `&waypoints=${wayAddresses.map((a: string) => encodeURIComponent(a)).join('|')}`;
          }
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(actualOrigen)}&destination=${encodeURIComponent(actualDestino)}${waypointsParam}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled || data.status !== 'OK' || !data.routes?.[0]) return;

        const decoded = polyline.decode(data.routes[0].overview_polyline.points);
        const coords: RouteCoord[] = decoded.map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));

        if (!cancelled) {
          setRouteCoords(coords);
          if (mapRef.current && coords.length > 0) {
            mapRef.current.fitToCoordinates(coords, {
              edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
              animated: true,
            });
          }
        }
      } catch (err) {
        console.warn('Directions error:', err);
      }
    };

    fetchDirections();
    return () => { cancelled = true; };
  }, [selectedRoute, isReturnTrip]);

  if (loading) return <Loading message="Cargando rutas..." />;

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#172554']} />}
    >
      <View className="px-4 pt-4 pb-8">
        {/* Título */}
        <Text className="text-4xl font-medium mb-4">Mis Viajes</Text>

        {/* Lista de rutas */}
        {allRoutes.map((route) => {
          const isSelected = selectedRoute?.id === route.id && selectedRoute?.tipo === route.tipo;
          const paradas = parseParadas(route.paradas);

          return (
            <TouchableOpacity
              key={`${route.tipo}-${route.id}`}
              onPress={() => {
                setSelectedRoute(route);
                setIsReturnTrip(false);
              }}
              activeOpacity={0.85}
              style={{
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                backgroundColor: isSelected ? '#eff6ff' : '#fff',
                marginBottom: 12,
              }}
            >
              {/* Header: origen → destino + badge */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#172554', flex: 1, marginRight: 8 }} numberOfLines={2}>
                  {route.origen} → {route.destino}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 50,
                    backgroundColor: route.tipo === 'chofer' ? '#dbeafe' : '#dcfce7',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons name={route.tipo === 'chofer' ? 'car' : 'person'} size={12} color={route.tipo === 'chofer' ? '#1d4ed8' : '#15803d'} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: route.tipo === 'chofer' ? '#1d4ed8' : '#15803d',
                  }}>
                    {route.tipo === 'chofer' ? 'Chofer' : 'Pasajero'}
                  </Text>
                </View>
              </View>

              {/* Chofer name */}
              {route.tipo === 'chofer' && (route.chofer_nombre || route.chofer_username) && (
                <Text style={{ color: '#4b5563', marginBottom: 2 }}>
                  Chofer: {route.chofer_nombre || route.chofer_username}
                </Text>
              )}

              {/* Days */}
              {route.dias && (
                <Text style={{ color: '#6b7280' }}>Días: {route.dias}</Text>
              )}

              {/* Times */}
              {(route.hora_salida || route.hora_llegada) && (
                <Text style={{ color: '#6b7280' }}>
                  Salida: {formatHora(route.hora_salida)} - Llegada: {formatHora(route.hora_llegada)}
                </Text>
              )}

              {/* Return times */}
              {route.hora_regreso && (
                <Text style={{ color: '#6b7280' }}>
                  Regreso: {formatHora(route.hora_regreso)} - Llegada Regreso: {formatHora(route.hora_llegada_regreso)}
                </Text>
              )}

              {/* Stops */}
              {route.tipo === 'chofer' && paradas.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="navigate" size={14} color="#16a34a" />
                    <Text style={{ color: '#16a34a', fontWeight: '600' }}>
                      {paradas.length} parada{paradas.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {paradas.map((p: any, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 4 }}>
                      <Ionicons name="ellipse" size={8} color="#9ca3af" />
                      <Text style={{ color: '#6b7280', fontSize: 13 }} numberOfLines={1}>
                        {p.direccion || 'Sin dirección'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Mapa de la ruta seleccionada */}
        {selectedRoute && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            marginTop: 8,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
          }}>
            {/* Route title + badge */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#172554', flex: 1, marginRight: 8 }} numberOfLines={2}>
                Ruta: {selectedRoute.origen} → {selectedRoute.destino}
              </Text>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 50,
                  backgroundColor: selectedRoute.tipo === 'chofer' ? '#dbeafe' : '#dcfce7',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Ionicons name={selectedRoute.tipo === 'chofer' ? 'car' : 'person'} size={12} color={selectedRoute.tipo === 'chofer' ? '#1d4ed8' : '#15803d'} />
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedRoute.tipo === 'chofer' ? '#1d4ed8' : '#15803d',
                }}>
                  {selectedRoute.tipo === 'chofer' ? 'Ruta de Chofer' : 'Ruta de Pasajero'}
                </Text>
              </View>
            </View>

            {/* Ida / Regreso toggle */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setIsReturnTrip(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: !isReturnTrip ? '#172554' : '#e5e7eb',
                  alignItems: 'center',
                }}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="arrow-forward" size={16} color={!isReturnTrip ? '#fff' : '#374151'} />
                  <Text style={{
                    fontWeight: '600',
                    color: !isReturnTrip ? '#fff' : '#374151',
                    fontSize: 14,
                  }}>
                    Ruta de Ida
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsReturnTrip(true)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: isReturnTrip ? '#172554' : '#e5e7eb',
                  alignItems: 'center',
                }}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="swap-horizontal" size={16} color={isReturnTrip ? '#fff' : '#374151'} />
                  <Text style={{
                    fontWeight: '600',
                    color: isReturnTrip ? '#fff' : '#374151',
                    fontSize: 14,
                  }}>
                    Ruta de Regreso
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Stops list */}
            {selectedRoute.tipo === 'chofer' && parseParadas(selectedRoute.paradas).length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#172554', marginBottom: 6 }}>Paradas:</Text>
                {parseParadas(selectedRoute.paradas).map((p: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{i + 1}</Text>
                    </View>
                    <Text style={{ color: '#4b5563', fontSize: 13, flex: 1 }} numberOfLines={1}>
                      {p.direccion || 'Sin dirección'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Map */}
            <View style={{ borderRadius: 12, overflow: 'hidden', height: 300 }}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  latitude: 41.6488,
                  longitude: -0.8891,
                  latitudeDelta: 0.06,
                  longitudeDelta: 0.06,
                }}
                showsUserLocation={false}
                showsPointsOfInterest={false}
                showsBuildings={false}
                toolbarEnabled={false}
              >
                {/* Route polyline */}
                {routeCoords.length > 0 && (
                  <Polyline
                    coordinates={routeCoords}
                    strokeColor={selectedRoute.tipo === 'chofer' ? '#172554' : '#16a34a'}
                    strokeWidth={5}
                  />
                )}

                {/* Start marker (I) */}
                {routeCoords.length > 0 && (
                  <Marker coordinate={routeCoords[0]} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#fff',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>I</Text>
                    </View>
                  </Marker>
                )}

                {/* End marker (F) */}
                {routeCoords.length > 1 && (
                  <Marker coordinate={routeCoords[routeCoords.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: '#dc2626', borderWidth: 2, borderColor: '#fff',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>F</Text>
                    </View>
                  </Marker>
                )}
              </MapView>
            </View>
          </View>
        )}

        {/* Empty state: no route selected */}
        {!selectedRoute && allRoutes.length > 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="hand-left-outline" size={40} color="#9ca3af" />
            <Text style={{ color: '#6b7280', fontSize: 18, marginTop: 8 }}>
              Selecciona una ruta para ver el mapa
            </Text>
          </View>
        )}

        {/* Empty state: no routes */}
        {allRoutes.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="map-outline" size={60} color="#d1d5db" />
            <Text style={{ color: '#6b7280', fontSize: 18, marginTop: 8 }}>
              No tienes rutas configuradas
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Ve a tu perfil para crear una ruta como chofer o pasajero
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
