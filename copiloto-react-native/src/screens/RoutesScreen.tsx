import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { routesAPI } from '../api/client';
import { Route } from '../types';
import { RouteCard } from '../components/cards/RouteCard';
import { Loading } from '../components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRoutes = useCallback(async () => {
    try {
      const res = await routesAPI.getAll();
      setRoutes(res.data || []);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  }, [loadRoutes]);

  if (loading) return <Loading message="Cargando rutas..." />;

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="map-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 text-lg mt-4">No hay rutas disponibles</Text>
            <Text className="text-gray-300 text-sm mt-1">Las rutas aparecerán aquí</Text>
          </View>
        }
        ListHeaderComponent={
          <Text className="text-gray-500 text-sm mb-3">
            {routes.length} ruta{routes.length !== 1 ? 's' : ''} disponible{routes.length !== 1 ? 's' : ''}
          </Text>
        }
        renderItem={({ item }) => <RouteCard route={item} />}
      />
    </View>
  );
}
