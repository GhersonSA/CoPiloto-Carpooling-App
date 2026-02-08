import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { passengersAPI, paymentsAPI } from '../api/client';
import { Loading } from '../components/ui/Loading';

interface PassengerData {
  id: number;
  nombre: string;
  barrio?: string;
}

interface PaymentData {
  id: number;
  pasajero_id: number;
  pago?: number;
  estado?: string;
  fecha?: string;
}

export default function PaymentsScreen() {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [order, setOrder] = useState<'recientes' | 'antiguos'>('recientes');

  const loadData = useCallback(async () => {
    try {
      const [pRes, payRes] = await Promise.all([
        passengersAPI.getAll().catch(() => ({ data: [] })),
        paymentsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setPassengers(Array.isArray(pRes.data) ? pRes.data : []);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
    } catch (err) {
      console.error('Error cargando pagos:', err);
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

  // Matches web cutName function
  const cutName = (nombreCompleto: string) => {
    const partes = nombreCompleto.split(' ');
    if (partes.length === 1) return partes[0];
    return `${partes[0]} ${partes[1][0].toUpperCase()}`;
  };

  // Matches web filtered/sorted payments
  const filteredPayments = useMemo(() => {
    if (!payments || !passengers) return [];
    return payments
      .filter(pago => {
        if (filterStatus === 'Todos') return true;
        if (filterStatus === 'Pagado') return pago.estado === 'completado';
        if (filterStatus === 'Pendiente') return pago.estado === 'pendiente';
        return true;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fecha || '');
        const fechaB = new Date(b.fecha || '');
        return order === 'recientes' ? fechaB.getTime() - fechaA.getTime() : fechaA.getTime() - fechaB.getTime();
      });
  }, [payments, passengers, filterStatus, order]);

  if (loadingData) return <Loading message="Cargando pagos..." />;

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
    >
      <View className="px-4 pt-4 pb-8">
        {/* Title */}
        <Text className="text-4xl font-medium mb-4">Pagos</Text>

        {/* Filtros arriba y centrados, orden abajo y centrado */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            {['Todos', 'Pagado', 'Pendiente'].map((status, idx) => {
              const isActive = filterStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 0,
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? '#172554' : 'transparent',
                    backgroundColor: isActive ? '#fff' : '#f3f4f6',
                    marginRight: idx < 2 ? 4 : 0,
                    minWidth: 70,
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: isActive ? '#172554' : '#6b7280',
                    textAlign: 'center',
                  }}>
                    {status === 'Pagado' ? 'Pagados' : status === 'Pendiente' ? 'Pendientes' : status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', borderRadius: 0 }}>
            {['recientes', 'antiguos'].map((ord, idx) => {
              const isActive = order === ord;
              return (
                <TouchableOpacity
                  key={ord}
                  onPress={() => setOrder(ord as 'recientes' | 'antiguos')}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 0,
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? '#172554' : 'transparent',
                    backgroundColor: isActive ? '#fff' : 'transparent',
                    minWidth: 70,
                    marginRight: idx < 1 ? 4 : 0,
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? '#172554' : '#6b7280',
                    textAlign: 'center',
                  }}>
                    {ord === 'recientes' ? 'Recientes' : 'Antiguos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Table */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <View className="flex-row py-4 px-3 border-b border-gray-200">
            <Text className="font-bold text-sm w-10 text-center">ID</Text>
            <Text className="font-bold text-sm flex-1 text-center">Nombre</Text>
            <Text className="font-bold text-sm flex-1 text-center">Fecha</Text>
            <Text className="font-bold text-sm w-20 text-center">Importe</Text>
            <Text className="font-bold text-sm w-24 text-center">Estado</Text>
          </View>

          {/* Table Rows */}
          {filteredPayments.map((pago, index) => {
            const pasajero = passengers.find(pass => Number(pass.id) === Number(pago.pasajero_id));
            if (!pasajero) return null;

            return (
              <View key={index} className="flex-row items-center py-3 px-3 border-b border-gray-100">
                <Text className="text-sm w-10 text-center text-gray-700">{pago.id}</Text>
                <Text className="text-sm flex-1 text-center text-gray-800" numberOfLines={1}>
                  {cutName(pasajero.nombre)}
                </Text>
                <Text className="text-sm flex-1 text-center text-gray-500">
                  {pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-ES') : 'N/A'}
                </Text>
                <Text className="text-sm w-20 text-center font-semibold">{pago.pago}€</Text>
                <View className="w-24 items-center">
                  <View className={`px-2 py-1 rounded-xl ${
                    pago.estado === 'completado' ? 'bg-green-400' : 'bg-red-400'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      pago.estado === 'completado' ? 'text-green-50' : 'text-red-50'
                    }`}>
                      {pago.estado === 'completado' ? 'Pagado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {filteredPayments.length === 0 && (
            <View className="py-8 items-center">
              <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-400 mt-2">No hay pagos registrados</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
