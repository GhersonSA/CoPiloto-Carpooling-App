import {
  View, Text, TouchableOpacity, Modal, Image, ScrollView,
  ActivityIndicator, Dimensions, Linking, Platform, Alert,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../hooks/useAuth';
import { routesAPI, driversAPI, passengersAPI, routePassengersAPI } from '../api/client';

// ─── Tipos ───
interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'origen' | 'destino';
  user: {
    nombre?: string;
    username?: string;
    img?: string;
    calificacion?: string | number;
    telefono?: string;
  };
  details: any;
  userType: 'chofer' | 'pasajero';
}

type FilterType = 'todo' | 'chofer' | 'pasajero';

const DEFAULT_REGION = {
  latitude: 41.6488,
  longitude: -0.8891,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ─── Geocoding ───
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch (err) {
    console.warn('Geocode error:', err);
  }
  return null;
};

const formatHora = (hora?: string) => (hora ? hora.slice(0, 5) : '—');

const openWhatsApp = (telefono?: string, nombre?: string) => {
  if (!telefono) {
    Alert.alert('Sin teléfono', 'Este usuario no tiene teléfono registrado');
    return;
  }
  const cleanPhone = telefono.replace(/[\s\-\(\)]/g, '');
  const message = encodeURIComponent(
    `¡Hola${nombre ? ` ${nombre}` : ''}! Te contacto desde Copiloto para solicitar un viaje, ¿estás disponible?`
  );
  Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
};

// ─── Component ───
export default function HomeScreen() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const navigation = require('@react-navigation/native').useNavigation();

  // Data
  const [drivers, setDrivers] = useState<any[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [routePassengers, setRoutePassengers] = useState<any[]>([]);

  // Map state
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<MapPoint[]>([]);
  const [filter, setFilter] = useState<FilterType>('todo');
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);

  // ─── Load data ───
  const loadData = useCallback(async () => {
    try {
      const [dRes, pRes, rRes, rpRes] = await Promise.all([
        driversAPI.getAll().catch(() => ({ data: [] })),
        passengersAPI.getAll().catch(() => ({ data: [] })),
        routesAPI.getAll().catch(() => ({ data: [] })),
        routePassengersAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setDrivers(Array.isArray(dRes.data) ? dRes.data : []);
      setPassengers(Array.isArray(pRes.data) ? pRes.data : []);
      setRoutes(Array.isArray(rRes.data) ? rRes.data : []);
      setRoutePassengers(Array.isArray(rpRes.data) ? rpRes.data : []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── User location ───
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
        (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  // ─── Geocode addresses to build map points ───
  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    const buildPoints = async () => {
      setGeocoding(true);
      const points: MapPoint[] = [];
      const tasks: Promise<void>[] = [];

      // Chofer routes (driver routes)
      routes.forEach((route: any) => {
        const driver = drivers.find((d: any) => d.user_id === route.chofer_id);
        const imgChofer = route.img_chofer || driver?.img_chofer || driver?.image;
        const nombreChofer = route.chofer_nombre || driver?.nombre || driver?.name || 'Chofer';

        if (route.origen) {
          tasks.push(
            geocodeAddress(route.origen).then((coords) => {
              if (!coords || cancelled) return;
              points.push({
                id: `chofer-origen-${route.id}`,
                lat: coords.lat,
                lng: coords.lng,
                type: 'origen',
                user: {
                  nombre: nombreChofer,
                  img: imgChofer,
                  calificacion: route.calificacion || driver?.calificacion,
                  telefono: route.telefono || driver?.telefono,
                },
                details: { ...route, nombre: nombreChofer, vehiculo: driver?.vehiculo, telefono: route.telefono || driver?.telefono },
                userType: 'chofer',
              });
            })
          );
        }
        if (route.destino) {
          tasks.push(
            geocodeAddress(route.destino).then((coords) => {
              if (!coords || cancelled) return;
              points.push({
                id: `chofer-destino-${route.id}`,
                lat: coords.lat,
                lng: coords.lng,
                type: 'destino',
                user: {
                  nombre: nombreChofer,
                  img: imgChofer,
                  calificacion: route.calificacion || driver?.calificacion,
                  telefono: route.telefono || driver?.telefono,
                },
                details: { ...route, nombre: nombreChofer, vehiculo: driver?.vehiculo, telefono: route.telefono || driver?.telefono },
                userType: 'chofer',
              });
            })
          );
        }
      });

      // Passenger routes
      routePassengers.forEach((rp: any) => {
        const passenger = passengers.find((p: any) => p.user_id === rp.pasajero_id);

        if (rp.origen) {
          tasks.push(
            geocodeAddress(rp.origen).then((coords) => {
              if (!coords || cancelled) return;
              points.push({
                id: `pasajero-origen-${rp.id}`,
                lat: coords.lat,
                lng: coords.lng,
                type: 'origen',
                user: {
                  nombre: passenger?.nombre || passenger?.name,
                  img: passenger?.img_pasajero || passenger?.image,
                  calificacion: passenger?.calificacion,
                  telefono: passenger?.telefono,
                },
                details: { ...rp, ...passenger },
                userType: 'pasajero',
              });
            })
          );
        }
        if (rp.destino) {
          tasks.push(
            geocodeAddress(rp.destino).then((coords) => {
              if (!coords || cancelled) return;
              points.push({
                id: `pasajero-destino-${rp.id}`,
                lat: coords.lat,
                lng: coords.lng,
                type: 'destino',
                user: {
                  nombre: passenger?.nombre || passenger?.name,
                  img: passenger?.img_pasajero || passenger?.image,
                  calificacion: passenger?.calificacion,
                  telefono: passenger?.telefono,
                },
                details: { ...rp, ...passenger },
                userType: 'pasajero',
              });
            })
          );
        }
      });

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      if (!cancelled) {
        setMapPoints(points);
        setFilteredPoints(points);
        setGeocoding(false);
      }
    };

    buildPoints();
    return () => { cancelled = true; };
  }, [loading, drivers, passengers, routes, routePassengers]);

  // ─── Filter ───
  useEffect(() => {
    if (filter === 'todo') {
      setFilteredPoints(mapPoints);
    } else {
      setFilteredPoints(mapPoints.filter((p) => p.userType === filter));
    }
  }, [filter, mapPoints]);

  // ─── Handlers ───
  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const handleMarkerPress = (point: MapPoint) => {
    setSelectedPoint(point);
  };

  const handleCloseSheet = () => {
    setSelectedPoint(null);
  };

  const handleWhatsApp = () => {
    if (!selectedPoint) return;
    openWhatsApp(
      selectedPoint.user.telefono || selectedPoint.details.telefono,
      selectedPoint.user.nombre
    );
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#172554" />
        <Text className="text-xl text-gray-600 mt-4">Cargando mapa...</Text>
      </View>
    );
  }

  // ─── Render ───
  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        toolbarEnabled={false}
      >
        {/* Markers for drivers and passengers */}
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            onPress={() => handleMarkerPress(point)}
          >
            {/* Custom marker */}
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 3,
                borderColor: point.userType === 'chofer' ? '#172554' : '#16a34a',
                backgroundColor: '#fff',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {point.user.img ? (
                <Image
                  source={{ uri: point.user.img }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={24}
                  color={point.userType === 'chofer' ? '#172554' : '#16a34a'}
                />
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── Filter Controls ── */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          alignSelf: 'center',
          zIndex: 20,
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 50,
          padding: 6,
          gap: 6,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
        }}
      >
        {([
          { key: 'todo' as FilterType, label: 'Todo', icon: 'location' as const, bg: '#172554' },
          { key: 'chofer' as FilterType, label: 'Choferes', icon: 'car' as const, bg: '#1d4ed8' },
          { key: 'pasajero' as FilterType, label: 'Pasajeros', icon: 'walk' as const, bg: '#16a34a' },
        ]).map((btn) => {
          const isActive = filter === btn.key;
          return (
            <TouchableOpacity
              key={btn.key}
              onPress={() => { setFilter(btn.key); setSelectedPoint(null); }}
              disabled={!!selectedPoint}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: isActive ? btn.bg : '#f3f4f6',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: isActive ? btn.bg : '#172554',
                opacity: selectedPoint ? 0.5 : 1,
              }}
            >
              <Ionicons
                name={isActive ? btn.icon : (`${btn.icon}-outline` as any)}
                size={16}
                color={isActive ? '#fff' : '#374151'}
              />
              <Text
                style={{
                  color: isActive ? '#fff' : '#374151',
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Geocoding indicator */}
      {geocoding && (
        <View className="absolute top-20 left-0 right-0 items-center z-20">
          <View className="bg-white/90 rounded-full px-4 py-2 flex-row items-center" style={{ elevation: 3 }}>
            <ActivityIndicator size="small" color="#172554" />
            <Text className="text-blue-950 text-sm ml-2 font-semibold">Geocodificando direcciones...</Text>
          </View>
        </View>
      )}

      {/* My Location Button (above Viajes FAB) */}
      {userLocation && (
        <TouchableOpacity
          onPress={handleLocateMe}
          style={{
            position: 'absolute',
            bottom: selectedPoint ? 380 : 105,
            right: 22,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#172554',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            zIndex: 20,
          }}
        >
          <Ionicons name="locate" size={24} color="#172554" />
        </TouchableOpacity>
      )}

      {/* ── Floating "Viajes" button ── */}
      {!selectedPoint && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Routes')}
          activeOpacity={0.85}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#172554',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            zIndex: 20,
          }}
        >
          <Ionicons name="map" size={28} color="#172554" />
        </TouchableOpacity>
      )}

      {/* Bottom Sheet */}
      {selectedPoint && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Header: Avatar + Name + Rating + Close */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: 3,
                  borderColor: selectedPoint.userType === 'chofer' ? '#172554' : '#16a34a',
                  overflow: 'hidden',
                  backgroundColor: '#e5e7eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedPoint.user.img ? (
                  <Image
                    source={{ uri: selectedPoint.user.img }}
                    style={{ width: 66, height: 66, borderRadius: 33 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={36} color="#6b7280" />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  className="text-blue-950 text-xl font-bold"
                  numberOfLines={1}
                >
                  {selectedPoint.user.nombre || selectedPoint.user.username || 'Usuario'}
                </Text>
                {selectedPoint.user.calificacion && (
                  <Text className="text-yellow-500 text-sm mt-0.5">
                    ⭐ {selectedPoint.user.calificacion}
                  </Text>
                )}
              </View>

              <TouchableOpacity onPress={handleCloseSheet} style={{ padding: 4 }}>
                <Ionicons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Route details */}
            <View style={{ marginBottom: 16 }}>
              <Text className="text-sm mb-1" numberOfLines={1}>
                <Text className="font-bold text-blue-950">Origen: </Text>
                {selectedPoint.details.origen || '—'}
              </Text>
              <Text className="text-sm mb-1" numberOfLines={1}>
                <Text className="font-bold text-blue-950">Destino: </Text>
                {selectedPoint.details.destino || '—'}
              </Text>
              {selectedPoint.details.dias && (
                <Text className="text-sm mb-1">
                  <Text className="font-bold text-blue-950">Días: </Text>
                  {selectedPoint.details.dias}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {(selectedPoint.details.hora_salida || selectedPoint.details.horaSalida) && (
                  <Text className="text-sm">
                    <Text className="font-bold text-blue-950">Salida: </Text>
                    {formatHora(selectedPoint.details.hora_salida || selectedPoint.details.horaSalida)}
                  </Text>
                )}
                {(selectedPoint.details.hora_llegada || selectedPoint.details.horaLlegada) && (
                  <Text className="text-sm">
                    <Text className="font-bold text-blue-950">Llegada: </Text>
                    {formatHora(selectedPoint.details.hora_llegada || selectedPoint.details.horaLlegada)}
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons — (Solicitar + WhatsApp) */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Solicitar', 'Función de solicitar viaje próximamente');
                  handleCloseSheet();
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#172554',
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Solicitar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWhatsApp}
                style={{
                  flex: 1,
                  backgroundColor: '#22c55e',
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Contactar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
