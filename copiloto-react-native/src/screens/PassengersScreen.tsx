import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { passengersAPI, paymentsAPI } from '../api/client';
import { Avatar } from '../components/ui/Avatar';
import { Loading } from '../components/ui/Loading';

interface PassengerData {
  id: number;
  nombre: string;
  nacionalidad?: string;
  barrio?: string;
  img?: string;
  username?: string;
}

interface PaymentData {
  id: number;
  pasajero_id: number;
  pago?: number;
  estado?: string;
  fecha?: string;
}

export default function PassengersScreen() {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modalPassenger, setModalPassenger] = useState<PassengerData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenPagos, setOrdenPagos] = useState<'recientes' | 'antiguos'>('recientes');

  const loadData = useCallback(async () => {
    try {
      const [pRes, payRes] = await Promise.all([
        passengersAPI.getAll().catch(() => ({ data: [] })),
        paymentsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setPassengers(Array.isArray(pRes.data) ? pRes.data : []);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
    } catch (err) {
      console.error('Error cargando pasajeros:', err);
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

  const filteredPassengers = busqueda
    ? passengers.filter(p =>
        (p.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (p.nacionalidad?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (p.barrio?.toLowerCase() || '').includes(busqueda.toLowerCase())
      )
    : passengers;

  const getPassengerPayments = (id: number) => payments.filter(p => Number(p.pasajero_id) === id);

  const getTotalPayments = (id: number) =>
    getPassengerPayments(id).reduce((acc, curr) => acc + Number(curr.pago || 0), 0);

  const getLastDate = (id: number) => {
    const pp = getPassengerPayments(id);
    if (pp.length === 0) return null;
    const sorted = [...pp].sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime());
    return sorted[0].fecha;
  };

  const openDetail = (passenger: PassengerData) => {
    setModalPassenger(passenger);
    setModalVisible(true);
  };

  const getMonthPayments = (id: number) => {
    const pp = getPassengerPayments(id);
    const grouped: Record<string, PaymentData[]> = {};
    pp.forEach(pago => {
      const fecha = new Date(pago.fecha || '');
      const mes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!grouped[mes]) grouped[mes] = [];
      grouped[mes].push(pago);
    });
    Object.keys(grouped).forEach(mes => {
      grouped[mes].sort((a, b) => {
        const dateA = new Date(a.fecha || '').getTime();
        const dateB = new Date(b.fecha || '').getTime();
        return ordenPagos === 'recientes' ? dateB - dateA : dateA - dateB;
      });
    });
    return grouped;
  };

  if (loadingData) return <Loading message="Cargando pasajeros..." />;

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}>
        <View className="px-4 pt-4 pb-8">
          {/* Title */}
          <Text className="text-4xl font-medium mb-4">Pasajeros</Text>

          {/* Search */}
          <View className="flex-row items-center mb-4 gap-2">
            <TextInput
              placeholder="Buscar pasajero, nacionalidad, barrio..."
              value={busqueda}
              onChangeText={setBusqueda}
              className="flex-1 bg-gray-50 h-14 rounded-2xl px-4 text-base border border-blue-950"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Table Header */}
          <View className="bg-blue-950 rounded-t-2xl flex-row py-4 px-2">
            <Text className="text-white font-bold text-center w-8">Nº</Text>
            <Text className="text-white font-bold flex-1 text-center">Nombre</Text>
            <Text className="text-white font-bold flex-1 text-center">Dirección</Text>
            <Text className="text-white font-bold w-20 text-center">Importe</Text>
            <Text className="text-white font-bold w-16 text-center"></Text>
          </View>

          {/* Table Rows */}
          {filteredPassengers.map((p, idx) => (
            <View
              key={p.id}
              className={`flex-row items-center py-3 px-2 border-b border-blue-100 ${idx % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}`}
            >
              <Text className="text-center w-8 text-gray-700">{idx + 1}</Text>
              <Text className="flex-1 text-center text-gray-800 font-medium" numberOfLines={1}>{p.nombre}</Text>
              <Text className="flex-1 text-center text-gray-600" numberOfLines={1}>{p.barrio || '-'}</Text>
              <Text className="w-20 text-center font-semibold text-gray-800">{getTotalPayments(p.id).toFixed(2)}€</Text>
              <TouchableOpacity onPress={() => openDetail(p)} className="w-16 items-center">
                <Text className="text-blue-950 font-bold text-xs">Ver más</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filteredPassengers.length === 0 && (
            <View className="bg-white py-8 items-center rounded-b-2xl">
              <Ionicons name="people-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-400 mt-2">No se encontraron pasajeros</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Passenger Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View
            className="bg-white rounded-2xl p-5 w-full max-w-lg max-h-[85%] relative"
            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)} className="absolute top-3 right-4 z-10">
              <Ionicons name="close" size={32} color="#9ca3af" />
            </TouchableOpacity>

            {modalPassenger && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center gap-4 mt-6 mb-4">
                  <Avatar uri={modalPassenger.img} size="lg" />
                  <View className="flex-1">
                    <Text className="text-blue-950 text-2xl font-bold">{modalPassenger.nombre}</Text>
                    <Text className="text-gray-500 text-base">Nacionalidad: {modalPassenger.nacionalidad || '-'}</Text>
                    <Text className="text-gray-500 text-base">Barrio: {modalPassenger.barrio || '-'}</Text>
                    <Text className="text-gray-500 text-base">
                      Fecha: {(() => {
                        const lastDate = getLastDate(modalPassenger.id);
                        return lastDate ? new Date(lastDate).toLocaleDateString('es-ES') : 'N/A';
                      })()}
                    </Text>
                    <Text className="text-gray-500 text-base font-semibold">
                      Importe total: {getTotalPayments(modalPassenger.id)}€
                    </Text>
                  </View>
                </View>

                {/* Sort buttons — matches web */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-blue-950 text-lg font-bold">Todos los pagos:</Text>
                  <View className="flex-row bg-gray-200 rounded-lg overflow-hidden">
                    <TouchableOpacity
                      onPress={() => setOrdenPagos('recientes')}
                      className={`px-3 py-1.5 ${ordenPagos === 'recientes' ? 'bg-white' : ''}`}
                    >
                      <Text className={`text-sm ${ordenPagos === 'recientes' ? 'text-blue-950 font-bold' : 'text-gray-500'}`}>Recientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setOrdenPagos('antiguos')}
                      className={`px-3 py-1.5 ${ordenPagos === 'antiguos' ? 'bg-white' : ''}`}
                    >
                      <Text className={`text-sm ${ordenPagos === 'antiguos' ? 'text-blue-950 font-bold' : 'text-gray-500'}`}>Antiguos</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Payments grouped by month — matches web colored boxes */}
                {Object.entries(getMonthPayments(modalPassenger.id)).map(([mes, pagos]) => (
                  <View key={mes} className="mb-4">
                    <Text className="text-lg font-bold text-blue-950 mb-2">{mes}</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {pagos.map((pago, index) => (
                        <View
                          key={index}
                          className={`items-center justify-center rounded-lg px-3 py-2 ${
                            pago.estado === 'completado' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ minWidth: 90 }}
                        >
                          <Text className="text-blue-50 text-xs">
                            {pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-ES') : '-'}
                          </Text>
                          <Text className="text-blue-50 text-xl font-bold">{Number(pago.pago || 0).toFixed(2)}€</Text>
                          <Text className="text-blue-50 text-xs">{pago.estado}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {getPassengerPayments(modalPassenger.id).length === 0 && (
                  <Text className="text-gray-400 italic text-center py-4">Sin pagos registrados</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
