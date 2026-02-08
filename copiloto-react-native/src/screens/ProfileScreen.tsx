import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useRoles } from '../hooks/useRoles';
import { useToast } from '../hooks/useToast';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  driverProfilesAPI,
  vehiclesAPI,
  passengerProfilesAPI,
  routesAPI,
  routePassengersAPI,
} from '../api/client';
import { DriverProfile, Vehicle, PassengerProfile, Route as RouteType } from '../types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { roles, isChofer, isPasajero, fetchRoles, deleteRole } = useRoles();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driverRoute, setDriverRoute] = useState<RouteType | null>(null);
  const [passengerProfile, setPassengerProfile] = useState<PassengerProfile | null>(null);
  const [passengerRoute, setPassengerRoute] = useState<any | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!user || roles.length === 0) return;
    const rolChofer = roles.find(r => r.tipo === 'chofer');
    const rolPasajero = roles.find(r => r.tipo === 'pasajero');

    try {
      if (rolChofer) {
        const [perfilRes, rutaRes] = await Promise.all([
          driverProfilesAPI.getByRoleId(rolChofer.id).catch(() => null),
          routesAPI.getAll({ chofer_id: user.id }).catch(() => null),
        ]);
        if (perfilRes?.data) {
          setDriverProfile(perfilRes.data);
          const vRes = await vehiclesAPI.getByProfileId(perfilRes.data.id).catch(() => null);
          if (vRes?.data) setVehicle(vRes.data);
        }
        if (rutaRes?.data) {
          const ruta = rutaRes.data.find((r: any) => r.chofer_id === user.id) || null;
          setDriverRoute(ruta);
        }
      } else {
        setDriverProfile(null);
        setVehicle(null);
        setDriverRoute(null);
      }

      if (rolPasajero) {
        const [perfilRes, rutaRes] = await Promise.all([
          passengerProfilesAPI.getByRoleId(rolPasajero.id).catch(() => null),
          routePassengersAPI.getMisRutas().catch(() => null),
        ]);
        if (perfilRes?.data) setPassengerProfile(perfilRes.data);
        if (rutaRes?.data) setPassengerRoute(rutaRes.data[0] || null);
      } else {
        setPassengerProfile(null);
        setPassengerRoute(null);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    }
  }, [user, roles]);

  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoles();
    await loadProfileData();
    setRefreshing(false);
  }, [fetchRoles, loadProfileData]);

  const handleDeleteRole = (tipo: string) => {
    Alert.alert('Eliminar Rol', `¿Seguro que quieres eliminar el rol de ${tipo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRole(tipo);
            toast.success(`Rol ${tipo} eliminado`);
            await loadProfileData();
          } catch {
            toast.error('Error al eliminar rol');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, cerrar', style: 'destructive', onPress: logout },
    ]);
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const rolActual = roles.length > 0 ? roles.map(r => capitalize(r.tipo)).join(' y ') : 'Ninguno';

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
    >
      <View className="px-4 pt-4 pb-8">
        {/* Title */}
        <Text className="text-4xl font-medium mb-4">Perfil</Text>

        {/* Main profile card */}
        <View className="bg-white rounded-3xl p-5 shadow-sm mb-4">
          {/* Avatar + Name */}
          <View className="items-center mb-4">
            <Avatar size="xl" />
            <Text className="text-4xl font-bold text-center mt-3">
              {user ? (user.nombre || user.username) : 'Cargando...'}
            </Text>
            <Text className="text-2xl text-gray-500 text-center mt-2">
              Rol actual: {rolActual}
            </Text>
            <Text className="text-xl text-yellow-500 text-center mt-1">
              Calificación: Próximamente...
            </Text>
          </View>

          {/* Driver Profile Section */}
          {driverProfile && (
            <View className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/50 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="car" size={24} color="#172554" />
                <Text className="text-xl font-bold text-blue-950 ml-2">Perfil de Chofer</Text>
              </View>
              <InfoRow icon="location" label="Dirección" value={driverProfile.direccion} />
              <InfoRow icon="business" label="Barrio" value={driverProfile.barrio} />
              <InfoRow icon="call" label="Teléfono" value={driverProfile.telefono} />

              {vehicle && (
                <View className="mt-3 pt-3 border-t border-blue-200">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="car-sport" size={20} color="#c2410c" />
                    <Text className="text-lg font-bold text-orange-700 ml-2">Vehículo</Text>
                  </View>
                  <InfoRow icon="speedometer" label="Marca" value={vehicle.marca} />
                  <InfoRow icon="car-outline" label="Modelo" value={vehicle.modelo} />
                  <InfoRow icon="color-palette" label="Color" value={vehicle.color} />
                  <InfoRow icon="card" label="Matrícula" value={vehicle.matricula} />
                  <InfoRow icon="people" label="Plazas" value={vehicle.plazas?.toString()} />
                </View>
              )}

              {driverRoute && (
                <View className="mt-3 pt-3 border-t border-blue-200">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="navigate" size={20} color="#166534" />
                    <Text className="text-lg font-bold text-green-700 ml-2">Mi Ruta de Chofer</Text>
                  </View>
                  <InfoRow icon="location" label="Origen" value={driverRoute.origen} />
                  <InfoRow icon="flag" label="Destino" value={driverRoute.destino} />
                  <InfoRow icon="calendar" label="Días" value={driverRoute.dias} />
                  <InfoRow icon="time" label="Salida" value={driverRoute.hora_salida} />
                  <InfoRow icon="time-outline" label="Llegada" value={driverRoute.hora_llegada} />
                </View>
              )}
            </View>
          )}

          {/* Passenger Profile Section */}
          {passengerProfile && (
            <View className="border-2 border-green-200 rounded-2xl p-4 bg-green-50/50 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person" size={24} color="#166534" />
                <Text className="text-xl font-bold text-green-700 ml-2">Perfil de Pasajero</Text>
              </View>
              <InfoRow icon="globe" label="Nacionalidad" value={passengerProfile.nacionalidad} />
              <InfoRow icon="business" label="Barrio" value={passengerProfile.barrio} />
              <InfoRow icon="call" label="Teléfono" value={passengerProfile.telefono} />

              {passengerRoute && (
                <View className="mt-3 pt-3 border-t border-green-200">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="navigate" size={20} color="#166534" />
                    <Text className="text-lg font-bold text-green-700 ml-2">Mi Ruta de Pasajero</Text>
                  </View>
                  <InfoRow icon="location" label="Origen" value={passengerRoute.origen} />
                  <InfoRow icon="flag" label="Destino" value={passengerRoute.destino} />
                  <InfoRow icon="calendar" label="Días" value={passengerRoute.dias} />
                </View>
              )}
            </View>
          )}

          {/* Roles list */}
          <View className="mt-4">
            <Text className="text-xl font-bold mb-3">Tus Roles</Text>
            {roles.length === 0 ? (
              <Text className="text-gray-400 italic">No tienes roles asignados</Text>
            ) : (
              roles.map(rol => (
                <View key={rol.tipo} className="flex-row items-center justify-between border border-gray-200 p-3 rounded-lg mb-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={rol.tipo === 'chofer' ? 'car' : 'person'}
                      size={20}
                      color={rol.tipo === 'chofer' ? '#172554' : '#166534'}
                    />
                    <Text className="text-base font-semibold ml-2">{capitalize(rol.tipo)}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    {user?.role !== 'guest' && (
                      <TouchableOpacity
                        onPress={() => handleDeleteRole(rol.tipo)}
                        className="bg-red-500 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                      >
                        <Ionicons name="trash" size={14} color="white" />
                        <Text className="text-white text-xs font-medium">Eliminar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Logout */}
        <Button title="Cerrar Sesión" onPress={handleLogout} variant="danger" />
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center py-1.5">
      <Ionicons name={icon as any} size={16} color="#6b7280" />
      <Text className="text-gray-500 ml-2 w-24">{label}</Text>
      <Text className="text-gray-800 flex-1 font-medium">{value}</Text>
    </View>
  );
}
