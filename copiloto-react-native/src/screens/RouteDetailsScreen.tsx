import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { routesAPI } from '../api/client';
import { Route } from '../types';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { RootStackParamList } from '../types';

type RouteDetailsRouteProp = RouteProp<RootStackParamList, 'RouteDetails'>;

export default function RouteDetailsScreen() {
  const route = useRoute<RouteDetailsRouteProp>();
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await routesAPI.getById(route.params.routeId);
        setRouteData(res.data);
      } catch (err) {
        console.error('Error cargando ruta:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [route.params.routeId]);

  if (loading) return <Loading message="Cargando detalle..." />;

  if (!routeData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Ionicons name="alert-circle-outline" size={60} color="#d1d5db" />
        <Text className="text-gray-400 text-lg mt-4">Ruta no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="px-4 pt-4 pb-8">
        {/* Ruta principal */}
        <Card className="mb-4">
          <View className="flex-row items-start mb-4">
            <View className="items-center mr-4">
              <View className="w-4 h-4 rounded-full bg-green-500" />
              <View className="w-0.5 h-12 bg-gray-300 my-1" />
              <View className="w-4 h-4 rounded-full bg-red-500" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">{routeData.origen}</Text>
              <View className="h-8" />
              <Text className="text-lg font-semibold text-gray-800">{routeData.destino}</Text>
            </View>
          </View>
        </Card>

        {/* Horarios */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-blue-950 mb-3">Horarios</Text>
          <DetailRow icon="calendar" label="Días" value={routeData.dias} />
          <DetailRow icon="time" label="Hora Salida" value={routeData.hora_salida} />
          <DetailRow icon="time-outline" label="Hora Llegada" value={routeData.hora_llegada} />
          {routeData.hora_regreso && (
            <>
              <DetailRow icon="return-down-back" label="Hora Regreso" value={routeData.hora_regreso} />
              <DetailRow icon="home" label="Llegada Regreso" value={routeData.hora_llegada_regreso} />
            </>
          )}
        </Card>

        {/* Chofer */}
        {routeData.chofer_nombre && (
          <Card className="mb-4">
            <Text className="text-lg font-bold text-blue-950 mb-3">Chofer</Text>
            <View className="flex-row items-center">
              <Ionicons name="person-circle" size={40} color="#1e3a5f" />
              <Text className="text-lg font-semibold text-gray-800 ml-3">
                {routeData.chofer_nombre}
              </Text>
            </View>
          </Card>
        )}

        {/* Paradas */}
        {routeData.paradas && routeData.paradas.length > 0 && (
          <Card>
            <Text className="text-lg font-bold text-blue-950 mb-3">Paradas</Text>
            {routeData.paradas.map((parada, i) => (
              <View key={i} className="flex-row items-center py-2 border-b border-gray-50">
                <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">{i + 1}</Text>
                </View>
                <Text className="text-gray-700 flex-1">{parada.direccion}</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center py-2">
      <Ionicons name={icon as any} size={18} color="#6b7280" />
      <Text className="text-gray-500 ml-2 w-32">{label}</Text>
      <Text className="text-gray-800 flex-1 font-medium">{value}</Text>
    </View>
  );
}
