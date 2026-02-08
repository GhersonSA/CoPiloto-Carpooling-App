import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, RefreshControl, Image } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { passengersAPI, paymentsAPI, ratingsAPI } from '../api/client';
import { Loading } from '../components/ui/Loading';

interface PassengerData {
  id: number;
  nombre: string;
  nacionalidad?: string;
  barrio?: string;
  img?: string;
}

interface PaymentData {
  id: number;
  pasajero_id: number;
  pago?: number;
  estado?: string;
  fecha?: string;
}

interface RatingData {
  id: number;
  paraUsuarioId?: number;
  tipo?: string;
  calificacion: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [pRes, payRes, ratRes] = await Promise.all([
        passengersAPI.getAll().catch(() => ({ data: [] })),
        paymentsAPI.getAll().catch(() => ({ data: [] })),
        ratingsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setPassengers(Array.isArray(pRes.data) ? pRes.data : []);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      setRatings(Array.isArray(ratRes.data) ? ratRes.data : []);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const idDelChoferActual = user?.id || 1;

  // Total ingresos
  const totalIngresos = payments
    .filter(p => p.estado?.toLowerCase() === 'completado')
    .reduce((acc, curr) => acc + Number(curr.pago || 0), 0);

  // Total sin pagar
  const totalSinPagar = payments
    .filter(p => p.estado?.toLowerCase() === 'pendiente')
    .reduce((acc, curr) => acc + Number(curr.pago || 0), 0);

  // Total pasajeros
  const totalPasajeros = passengers.length;

  // Calificaciones
  const calificacionChofer = ratings.filter(
    r => r.paraUsuarioId === idDelChoferActual && r.tipo === 'chofer'
  );
  const sumaCalificaciones = calificacionChofer.reduce((t, r) => t + r.calificacion, 0);
  const totalCalificaciones = calificacionChofer.length > 0
    ? (sumaCalificaciones / calificacionChofer.length).toFixed(1)
    : '0';

  // Pasajeros activos - tomar los 3 primeros
  const pasajerosActivos = useMemo(() => {
    return passengers.slice(0, 3);
  }, [passengers]);

  // Top pasajeros
  const topPasajeros = useMemo(() => {
    const pagosPorPasajero: Record<number, number> = {};
    payments.forEach(p => {
      if (p.estado?.toLowerCase() === 'completado') {
        const pid = Number(p.pasajero_id);
        if (!pid) return;
        pagosPorPasajero[pid] = (pagosPorPasajero[pid] || 0) + Number(p.pago || 0);
      }
    });

    const topConPagos = Object.entries(pagosPorPasajero)
      .map(([pasajeroId, total]) => ({ pasajeroId: Number(pasajeroId), total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map(({ pasajeroId, total }) => {
        const pasajero = passengers.find(p => Number(p.id) === pasajeroId);
        return { nombre: pasajero?.nombre || 'Desconocido', img: pasajero?.img, total };
      });

    // Si no hay pagos, mostrar los primeros pasajeros con total 0
    if (topConPagos.length === 0 && passengers.length > 0) {
      return passengers.slice(0, 3).map(p => ({
        nombre: p.nombre || 'Sin nombre', img: p.img, total: 0,
      }));
    }
    return topConPagos;
  }, [payments, passengers]);

  // Últimos pasajeros
  const ultimosPasajeros = [...passengers].sort((a, b) => b.id - a.id).slice(0, 3);

  if (loadingData) return <Loading message="Cargando dashboard..." />;

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#172554']} />}
    >
      <View className="px-4 pt-4 pb-8">
        {/* Título */}
        <Text className="text-4xl font-medium mb-4">Dashboard</Text>

        {/* Top 4 Stat Cards */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {/* Total Ingresos */}
          <View className="flex-1 min-w-[45%] bg-blue-950/90 rounded-3xl p-4 justify-center" style={{ minHeight: 110 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="cash" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white text-sm">Total Ingresos</Text>
            </View>
            <Text className="text-yellow-500 text-3xl font-bold text-center">{totalIngresos}€</Text>
          </View>
          {/* Total Pasajeros */}
          <View className="flex-1 min-w-[45%] bg-blue-950/90 rounded-3xl p-4 justify-center" style={{ minHeight: 110 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="people" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white text-sm">Total Pasajeros</Text>
            </View>
            <Text className="text-yellow-500 text-3xl font-bold text-center">{totalPasajeros}</Text>
          </View>
          {/* Calificación */}
          <View className="flex-1 min-w-[45%] bg-blue-950/90 rounded-3xl p-4 justify-center" style={{ minHeight: 110 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="star" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white text-sm">Calificación</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-yellow-500 text-3xl font-bold">{totalCalificaciones}</Text>
              <Ionicons name="star" size={22} color="#facc15" style={{ marginLeft: 6 }} />
            </View>
          </View>
          {/* Total Sin Pagar */}
          <View className="flex-1 min-w-[45%] bg-blue-950/90 rounded-3xl p-4 justify-center" style={{ minHeight: 110 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="card" size={22} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white text-sm">Total Sin Pagar</Text>
            </View>
            <Text className="text-yellow-500 text-3xl font-bold text-center">{totalSinPagar}€</Text>
          </View>
        </View>

        {/* ── Mid Cards ── */}
        <View className="gap-3 mb-4">
          {/* Estadísticas */}
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-500 text-xl mb-2">Estadísticas</Text>
            <Image
              source={{ uri: 'https://mexico.unir.net/wp-content/uploads/sites/6/2022/05/grafico-diagramas.jpg' }}
              className="w-full h-48 rounded-xl"
              resizeMode="cover"
            />
          </View>

          {/* Comentarios */}
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-500 text-xl mb-2">Comentarios</Text>
            <Image
              source={{ uri: 'https://img.freepik.com/vector-premium/concepto-calificacion-estrellas-resenas-clientes-gente-deja-comentarios-comentarios-estilo-moderno-dibujos-animados-planos_501813-117.jpg' }}
              className="w-full h-48 rounded-xl"
              resizeMode="cover"
            />
          </View>

          {/* Pasajeros activos */}
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-500 text-xl mb-3">Pasajeros activos</Text>
            {pasajerosActivos.map(p => (
              <View key={p.id} className="flex-row items-center mb-3">
                <View className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                  {p.img ? (
                    <Image source={{ uri: p.img }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                      <Text className="text-gray-500 text-xl">👤</Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-bold text-blue-950 ml-3">{p.nombre}</Text>
                <Text className="text-base text-black font-semibold ml-1">- {p.barrio || 'Sin dirección'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bottom Cards ── */}
        <View className="gap-3">
          {/* Top Pasajeros */}
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-500 text-xl mb-3">Top Pasajeros</Text>
            {topPasajeros.map(({ nombre, img, total }, i) => (
              <View key={i} className="flex-row items-center mb-3">
                <View className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                  {img ? (
                    <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                      <Text className="text-gray-500 text-xl">👤</Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-bold text-blue-950 ml-3">{nombre}</Text>
                <Text className="text-base text-black font-semibold ml-1">- {total}€</Text>
              </View>
            ))}
          </View>

          {/* Últimos pasajeros */}
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-500 text-xl mb-3">Últimos pasajeros</Text>
            {ultimosPasajeros.map(p => (
              <View key={p.id} className="flex-row items-center mb-3">
                <View className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                  {p.img ? (
                    <Image source={{ uri: p.img }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                      <Text className="text-gray-500 text-xl">👤</Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-bold text-blue-950 ml-3">{p.nombre}</Text>
                <Text className="text-base text-black font-semibold ml-1">- {p.barrio || 'Sin dirección'}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
