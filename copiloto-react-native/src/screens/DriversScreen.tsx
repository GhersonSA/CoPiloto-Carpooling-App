import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { driversAPI } from '../api/client';
import { Driver } from '../types';
import { DriverCard } from '../components/cards/DriverCard';
import { Loading } from '../components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrivers = useCallback(async () => {
    try {
      const res = await driversAPI.getAll();
      setDrivers(res.data || []);
    } catch (err) {
      console.error('Error cargando choferes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  }, [loadDrivers]);

  if (loading) return <Loading message="Cargando choferes..." />;

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="car-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 text-lg mt-4">No hay choferes registrados</Text>
            <Text className="text-gray-300 text-sm mt-1">Los choferes aparecerán aquí</Text>
          </View>
        }
        ListHeaderComponent={
          <Text className="text-gray-500 text-sm mb-3">
            {drivers.length} chofer{drivers.length !== 1 ? 'es' : ''} registrado{drivers.length !== 1 ? 's' : ''}
          </Text>
        }
        renderItem={({ item }) => <DriverCard driver={item} />}
      />
    </View>
  );
}
