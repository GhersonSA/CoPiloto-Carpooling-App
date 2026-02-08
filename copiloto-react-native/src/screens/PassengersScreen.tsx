import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
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

type ModalView = 'detail' | 'editPassenger' | 'addPayment' | 'editPayment';

export default function PassengersScreen() {
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Modal state
  const [modalPassenger, setModalPassenger] = useState<PassengerData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('detail');
  const [ordenPagos, setOrdenPagos] = useState<'recientes' | 'antiguos'>('recientes');

  // Create passenger modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [formPassenger, setFormPassenger] = useState({ nombre: '', nacionalidad: '', barrio: '', img: '' });
  const [formPayments, setFormPayments] = useState([{ fecha: '', pago: '', estado: 'pendiente' }]);

  // Edit payment
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<{ type: 'formRow'; idx: number } | { type: 'editPayment' } | null>(null);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());

  // ── Load data ──
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

  // ── Helpers ──
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

  const getOldestDate = (id: number) => {
    const pp = getPassengerPayments(id);
    if (pp.length === 0) return null;
    const sorted = [...pp].sort((a, b) => new Date(a.fecha || '').getTime() - new Date(b.fecha || '').getTime());
    return sorted[0].fecha;
  };

  // Agrupa pagos por mes y ordena los meses
  const getMonthPayments = (id: number) => {
    const pp = getPassengerPayments(id);
    const grouped: Record<string, { pagos: PaymentData[], rawDate: Date }> = {};
    pp.forEach(pago => {
      const fecha = new Date(pago.fecha || '');
      const mes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!grouped[mes]) grouped[mes] = { pagos: [], rawDate: fecha };
      grouped[mes].pagos.push(pago);
      // Actualiza rawDate al más reciente/antiguo del mes
      if (fecha > grouped[mes].rawDate) grouped[mes].rawDate = fecha;
    });
    // Ordena pagos dentro de cada mes
    Object.values(grouped).forEach(({ pagos }) => {
      pagos.sort((a, b) => {
        const dateA = new Date(a.fecha || '').getTime();
        const dateB = new Date(b.fecha || '').getTime();
        return ordenPagos === 'recientes' ? dateB - dateA : dateA - dateB;
      });
    });
    // Ordena los meses
    const sortedMonths = Object.entries(grouped)
      .sort(([, a], [, b]) => {
        const aTime = a.rawDate.getTime();
        const bTime = b.rawDate.getTime();
        return ordenPagos === 'recientes' ? bTime - aTime : aTime - bTime;
      });
    // Devuelve array de { mes, pagos }
    return sortedMonths.map(([mes, { pagos }]) => ({ mes, pagos }));
  };

  // ── Handlers ──
  const openDetail = (passenger: PassengerData) => {
    setModalPassenger(passenger);
    setModalView('detail');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalView('detail');
    setModalPassenger(null);
    setSelectedPayment(null);
  };

  // Create passenger
  const openCreateModal = () => {
    setFormPassenger({ nombre: '', nacionalidad: '', barrio: '', img: '' });
    setFormPayments([{ fecha: '', pago: '', estado: 'pendiente' }]);
    setCreateModalVisible(true);
  };

  const handleCreatePassenger = async () => {
    if (!formPassenger.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    try {
      const res = await passengersAPI.create(formPassenger);
      const newPassenger = res.data;
      for (const pago of formPayments) {
        if (pago.fecha && pago.pago) {
          await paymentsAPI.create({
            pasajero_id: newPassenger.id,
            ...pago,
            pago: Number(pago.pago),
          });
        }
      }
      Alert.alert('Éxito', 'Pasajero creado exitosamente');
      setCreateModalVisible(false);
      loadData();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Error al crear pasajero');
    }
  };

  // Edit passenger
  const openEditPassenger = () => {
    if (!modalPassenger) return;
    setFormPassenger({
      nombre: modalPassenger.nombre || '',
      nacionalidad: modalPassenger.nacionalidad || '',
      barrio: modalPassenger.barrio || '',
      img: modalPassenger.img || '',
    });
    setModalView('editPassenger');
  };

  const handleEditPassenger = async () => {
    if (!modalPassenger) return;
    try {
      await passengersAPI.update(modalPassenger.id, formPassenger);
      Alert.alert('Éxito', 'Pasajero actualizado');
      setModalView('detail');
      loadData();
      // Update local modal passenger
      setModalPassenger({ ...modalPassenger, ...formPassenger });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Error al actualizar pasajero');
    }
  };

  // Delete passenger
  const handleDeletePassenger = () => {
    if (!modalPassenger) return;
    Alert.alert('¿Eliminar pasajero?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await passengersAPI.delete(modalPassenger.id);
            Alert.alert('Éxito', 'Pasajero eliminado');
            closeModal();
            loadData();
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Error al eliminar pasajero');
          }
        }
      },
    ]);
  };

  // Add payment
  const openAddPayment = () => {
    setFormPayments([{ fecha: '', pago: '', estado: 'pendiente' }]);
    setModalView('addPayment');
  };

  const handleAddPayment = async () => {
    if (!modalPassenger) return;
    try {
      for (const pago of formPayments) {
        if (pago.fecha && pago.pago) {
          await paymentsAPI.create({
            pasajero_id: modalPassenger.id,
            ...pago,
            pago: Number(pago.pago),
          });
        }
      }
      Alert.alert('Éxito', 'Pagos añadidos');
      setModalView('detail');
      loadData();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Error al añadir pagos');
    }
  };

  // Edit payment
  const openEditPayment = (pago: PaymentData) => {
    setSelectedPayment({ ...pago });
    setModalView('editPayment');
  };

  const handleEditPayment = async () => {
    if (!selectedPayment) return;
    try {
      await paymentsAPI.update(selectedPayment.id, {
        fecha: selectedPayment.fecha,
        pago: selectedPayment.pago,
        estado: selectedPayment.estado,
      });
      Alert.alert('Éxito', 'Pago actualizado');
      setModalView('detail');
      setSelectedPayment(null);
      loadData();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Error al actualizar pago');
    }
  };

  const handleDeletePayment = () => {
    if (!selectedPayment) return;
    Alert.alert('¿Eliminar pago?', 'Esta acción no se puede deshacer', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await paymentsAPI.delete(selectedPayment.id);
            Alert.alert('Éxito', 'Pago eliminado');
            setModalView('detail');
            setSelectedPayment(null);
            loadData();
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Error al eliminar pago');
          }
        }
      },
    ]);
  };

  const addPaymentRow = () => {
    setFormPayments(prev => [...prev, { fecha: '', pago: '', estado: 'pendiente' }]);
  };

  const updatePaymentRow = (idx: number, field: string, value: string) => {
    setFormPayments(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const daysInMonth = useMemo(() => new Date(pickerYear, pickerMonth + 1, 0).getDate(), [pickerYear, pickerMonth]);

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return 'Seleccionar fecha';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const openDatePicker = (target: { type: 'formRow'; idx: number } | { type: 'editPayment' }, currentValue?: string) => {
    const d = currentValue ? new Date(currentValue) : new Date();
    setPickerYear(d.getFullYear());
    setPickerMonth(d.getMonth());
    setPickerDay(d.getDate());
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const confirmDatePicker = () => {
    const day = Math.min(pickerDay, daysInMonth);
    const iso = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (datePickerTarget?.type === 'formRow') {
      updatePaymentRow(datePickerTarget.idx, 'fecha', iso);
    } else if (datePickerTarget?.type === 'editPayment') {
      setSelectedPayment(p => p ? { ...p, fecha: iso } : p);
    }
    setShowDatePicker(false);
    setDatePickerTarget(null);
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
    setDatePickerTarget(null);
  };

  // ── Loading ──
  if (loadingData) return <Loading message="Cargando pasajeros..." />;

  // ── Render ──
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
          {/* Title */}
          <Text style={s.title}>Pasajeros</Text>

          {/* Search + Add button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
            <TextInput
              placeholder="Buscar pasajero, nacionalidad, barrio..."
              value={busqueda}
              onChangeText={setBusqueda}
              style={s.searchInput}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity onPress={openCreateModal} activeOpacity={0.8} style={s.addButton}>
              <Ionicons name="person-add" size={18} color="#fff" />
              <Text style={s.addButtonText}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={s.tableHeader}>
            <Text style={[s.headerCell, { width: 32 }]}>Nº</Text>
            <Text style={[s.headerCell, { flex: 1 }]}>Nombre</Text>
            <Text style={[s.headerCell, { flex: 1 }]}>Dirección</Text>
            <Text style={[s.headerCell, { width: 72 }]}>Importe</Text>
            <Text style={[s.headerCell, { width: 52 }]}></Text>
          </View>

          {/* Table Rows */}
          {filteredPassengers.map((p, idx) => (
            <View key={p.id} style={[s.tableRow, { backgroundColor: idx % 2 === 0 ? '#eff6ff80' : '#fff' }]}>
              <Text style={[s.cell, { width: 32 }]}>{idx + 1}</Text>
              <Text style={[s.cell, { flex: 1, fontWeight: '500' }]} numberOfLines={1}>{p.nombre}</Text>
              <Text style={[s.cell, { flex: 1, color: '#6b7280' }]} numberOfLines={1}>{p.barrio || '-'}</Text>
              <Text style={[s.cell, { width: 72, fontWeight: '600' }]}>{getTotalPayments(p.id).toFixed(2)}€</Text>
              <TouchableOpacity onPress={() => openDetail(p)} style={{ width: 52, alignItems: 'center' }}>
                <Text style={{ color: '#172554', fontWeight: '700', fontSize: 12 }}>Ver más</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filteredPassengers.length === 0 && (
            <View style={{ backgroundColor: '#fff', paddingVertical: 32, alignItems: 'center', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <Ionicons name="people-outline" size={40} color="#9ca3af" />
              <Text style={{ color: '#9ca3af', marginTop: 8 }}>No se encontraron pasajeros</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ════════════ DETAIL / EDIT MODAL ════════════ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TouchableOpacity onPress={closeModal} style={s.closeBtn}>
              <Ionicons name="close" size={32} color="#9ca3af" />
            </TouchableOpacity>

            {modalPassenger && modalView === 'detail' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24, marginBottom: 16 }}>
                  <Avatar uri={modalPassenger.img} size="lg" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailName}>{modalPassenger.nombre}</Text>
                    <Text style={s.detailInfo}>Nacionalidad: {modalPassenger.nacionalidad || '-'}</Text>
                    <Text style={s.detailInfo}>Barrio: {modalPassenger.barrio || '-'}</Text>
                    <Text style={s.detailInfo}>
                      Fecha: {(() => {
                        const oldestDate = getOldestDate(modalPassenger.id);
                        return oldestDate ? new Date(oldestDate).toLocaleDateString('es-ES') : 'N/A';
                      })()}
                    </Text>
                    <Text style={[s.detailInfo, { fontWeight: '600' }]}>
                      Importe total: {getTotalPayments(modalPassenger.id)}€
                    </Text>
                  </View>
                </View>

                {/* Action buttons (Editar / Añadir Pago / Eliminar) */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <TouchableOpacity onPress={openEditPassenger} activeOpacity={0.8} style={[s.actionBtn, { backgroundColor: '#facc15' }]}>
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={s.actionBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={openAddPayment} activeOpacity={0.8} style={[s.actionBtn, { backgroundColor: '#84cc16' }]}>
                    <Ionicons name="cash-outline" size={16} color="#fff" />
                    <Text style={s.actionBtnText}>Añadir Pago</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeletePassenger} activeOpacity={0.8} style={[s.actionBtn, { backgroundColor: '#ef4444' }]}>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={s.actionBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>

                {/* Sort buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#172554', fontSize: 17, fontWeight: '700' }}>Todos los pagos:</Text>
                  <View style={s.sortContainer}>
                    <TouchableOpacity
                      onPress={() => setOrdenPagos('recientes')}
                      style={[s.sortBtn, ordenPagos === 'recientes' && s.sortBtnActive, ordenPagos === 'recientes' && s.sortBtnBorder]}
                    >
                      <Text style={[s.sortText, ordenPagos === 'recientes' && s.sortTextActive]}>Recientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setOrdenPagos('antiguos')}
                      style={[s.sortBtn, ordenPagos === 'antiguos' && s.sortBtnActive, ordenPagos === 'antiguos' && s.sortBtnBorder]}
                    >
                      <Text style={[s.sortText, ordenPagos === 'antiguos' && s.sortTextActive]}>Antiguos</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Payments grouped by month */}
                {getMonthPayments(modalPassenger.id).map(({ mes, pagos }) => (
                  <View key={mes} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#172554', marginBottom: 8 }}>{mes}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {pagos.map((pago: PaymentData, index: number) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => openEditPayment(pago)}
                          activeOpacity={0.75}
                          style={[
                            s.paymentBox,
                            { backgroundColor: pago.estado === 'completado' ? '#22c55e' : '#ef4444' },
                          ]}
                        >
                          <Text style={s.paymentDate}>
                            {pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-ES') : '-'}
                          </Text>
                          <Text style={s.paymentAmount}>{Number(pago.pago || 0).toFixed(2)}€</Text>
                          <Text style={s.paymentStatus}>{pago.estado}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                {getPassengerPayments(modalPassenger.id).length === 0 && (
                  <Text style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 }}>Sin pagos registrados</Text>
                )}
              </ScrollView>
            )}

            {/* ── Edit Passenger View ── */}
            {modalView === 'editPassenger' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.formTitle}>Editar Pasajero</Text>
                <Text style={s.formLabel}>Nombre:</Text>
                <TextInput style={s.formInput} value={formPassenger.nombre} onChangeText={v => setFormPassenger(p => ({ ...p, nombre: v }))} />
                <Text style={s.formLabel}>Nacionalidad:</Text>
                <TextInput style={s.formInput} value={formPassenger.nacionalidad} onChangeText={v => setFormPassenger(p => ({ ...p, nacionalidad: v }))} />
                <Text style={s.formLabel}>Barrio:</Text>
                <TextInput style={s.formInput} value={formPassenger.barrio} onChangeText={v => setFormPassenger(p => ({ ...p, barrio: v }))} />
                <Text style={s.formLabel}>Imagen (URL):</Text>
                <TextInput style={s.formInput} value={formPassenger.img} onChangeText={v => setFormPassenger(p => ({ ...p, img: v }))} />
                <View style={s.formActions}>
                  <TouchableOpacity onPress={handleEditPassenger} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#172554' }]}>
                    <Text style={s.formBtnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalView('detail')} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#6b7280' }]}>
                    <Text style={s.formBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* ── Add Payment View ── */}
            {modalView === 'addPayment' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.formTitle}>Añadir Pagos</Text>
                {formPayments.map((pago, idx) => (
                  <View key={idx} style={{ marginBottom: 12 }}>
                    <Text style={s.formLabel}>Fecha:</Text>
                    <TouchableOpacity onPress={() => openDatePicker({ type: 'formRow', idx }, pago.fecha || undefined)} style={s.datePickerBtn}>
                      <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                      <Text style={{ color: pago.fecha ? '#1f2937' : '#9ca3af', fontSize: 15 }}>{pago.fecha ? formatDateForDisplay(pago.fecha) : 'Seleccionar fecha'}</Text>
                    </TouchableOpacity>
                    <Text style={s.formLabel}>Importe:</Text>
                    <TextInput style={s.formInput} placeholder="0.00" keyboardType="numeric" value={pago.pago} onChangeText={v => updatePaymentRow(idx, 'pago', v)} placeholderTextColor="#9ca3af" />
                    <Text style={s.formLabel}>Estado:</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      {['pendiente', 'completado'].map(est => (
                        <TouchableOpacity
                          key={est}
                          onPress={() => updatePaymentRow(idx, 'estado', est)}
                          style={[s.estadoBtn, { backgroundColor: pago.estado === est ? (est === 'completado' ? '#22c55e' : '#ef4444') : '#e5e7eb' }]}
                        >
                          <Text style={{ color: pago.estado === est ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>
                            {est.charAt(0).toUpperCase() + est.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={addPaymentRow} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#84cc16', marginBottom: 12 }]}>
                  <Text style={s.formBtnText}>+ Añadir otro pago</Text>
                </TouchableOpacity>
                <View style={s.formActions}>
                  <TouchableOpacity onPress={handleAddPayment} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#172554' }]}>
                    <Text style={s.formBtnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalView('detail')} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#6b7280' }]}>
                    <Text style={s.formBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* ── Edit Payment View ── */}
            {modalView === 'editPayment' && selectedPayment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.formTitle}>Editar Pago</Text>
                <Text style={s.formLabel}>Fecha:</Text>
                <TouchableOpacity onPress={() => openDatePicker({ type: 'editPayment' }, selectedPayment.fecha || undefined)} style={s.datePickerBtn}>
                  <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                  <Text style={{ color: selectedPayment.fecha ? '#1f2937' : '#9ca3af', fontSize: 15 }}>{formatDateForDisplay(selectedPayment.fecha)}</Text>
                </TouchableOpacity>
                <Text style={s.formLabel}>Importe:</Text>
                <TextInput
                  style={s.formInput}
                  keyboardType="numeric"
                  value={String(selectedPayment.pago || '')}
                  onChangeText={v => setSelectedPayment(p => p ? { ...p, pago: Number(v) || 0 } : p)}
                  placeholderTextColor="#9ca3af"
                />
                <Text style={s.formLabel}>Estado:</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  {['pendiente', 'completado'].map(est => (
                    <TouchableOpacity
                      key={est}
                      onPress={() => setSelectedPayment(p => p ? { ...p, estado: est } : p)}
                      style={[s.estadoBtn, { backgroundColor: selectedPayment.estado === est ? (est === 'completado' ? '#22c55e' : '#ef4444') : '#e5e7eb' }]}
                    >
                      <Text style={{ color: selectedPayment.estado === est ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>
                        {est.charAt(0).toUpperCase() + est.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[s.formActions, { marginTop: 20 }]}>
                  <TouchableOpacity onPress={handleEditPayment} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#172554' }]}>
                    <Text style={s.formBtnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeletePayment} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#ef4444' }]}>
                    <Text style={s.formBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setModalView('detail'); setSelectedPayment(null); }} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#6b7280' }]}>
                    <Text style={s.formBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ════════════ CREATE PASSENGER MODAL ════════════ */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={s.closeBtn}>
              <Ionicons name="close" size={32} color="#9ca3af" />
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formTitle}>Añadir Pasajero</Text>
              <Text style={s.formLabel}>Nombre: <Text style={{ color: '#ef4444' }}>*</Text></Text>
              <TextInput style={s.formInput} value={formPassenger.nombre} onChangeText={v => setFormPassenger(p => ({ ...p, nombre: v }))} />
              <Text style={s.formLabel}>Nacionalidad:</Text>
              <TextInput style={s.formInput} value={formPassenger.nacionalidad} onChangeText={v => setFormPassenger(p => ({ ...p, nacionalidad: v }))} />
              <Text style={s.formLabel}>Barrio:</Text>
              <TextInput style={s.formInput} value={formPassenger.barrio} onChangeText={v => setFormPassenger(p => ({ ...p, barrio: v }))} />
              <Text style={s.formLabel}>Imagen (URL):</Text>
              <TextInput style={s.formInput} value={formPassenger.img} onChangeText={v => setFormPassenger(p => ({ ...p, img: v }))} />

              <Text style={[s.formTitle, { fontSize: 20, marginTop: 16 }]}>Pagos (opcional)</Text>
              {formPayments.map((pago, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <Text style={s.formLabel}>Fecha:</Text>
                  <TouchableOpacity onPress={() => openDatePicker({ type: 'formRow', idx }, pago.fecha || undefined)} style={s.datePickerBtn}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                    <Text style={{ color: pago.fecha ? '#1f2937' : '#9ca3af', fontSize: 15 }}>{pago.fecha ? formatDateForDisplay(pago.fecha) : 'Seleccionar fecha'}</Text>
                  </TouchableOpacity>
                  <Text style={s.formLabel}>Importe:</Text>
                  <TextInput style={s.formInput} placeholder="0.00" keyboardType="numeric" value={pago.pago} onChangeText={v => updatePaymentRow(idx, 'pago', v)} placeholderTextColor="#9ca3af" />
                  <Text style={s.formLabel}>Estado:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {['pendiente', 'completado'].map(est => (
                      <TouchableOpacity
                        key={est}
                        onPress={() => updatePaymentRow(idx, 'estado', est)}
                        style={[s.estadoBtn, { backgroundColor: pago.estado === est ? (est === 'completado' ? '#22c55e' : '#ef4444') : '#e5e7eb' }]}
                      >
                        <Text style={{ color: pago.estado === est ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>
                          {est.charAt(0).toUpperCase() + est.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={addPaymentRow} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#84cc16', marginBottom: 12 }]}>
                <Text style={s.formBtnText}>+ Añadir otro pago</Text>
              </TouchableOpacity>
              <View style={s.formActions}>
                <TouchableOpacity onPress={handleCreatePassenger} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#172554' }]}>
                  <Text style={s.formBtnText}>Crear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#6b7280' }]}>
                  <Text style={s.formBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════ DATE PICKER MODAL ════════════ */}
      <Modal visible={showDatePicker} animationType="fade" transparent statusBarTranslucent>
        <View style={[s.modalOverlay, { zIndex: 9999 }]}>
          <View style={[s.modalCard, { padding: 24, maxWidth: 360, elevation: 10 }]}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#172554', textAlign: 'center', marginBottom: 16 }}>Seleccionar Fecha</Text>

            {/* Month / Year navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => { if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); } else setPickerMonth(m => m - 1); }}>
                <Ionicons name="chevron-back" size={28} color="#172554" />
              </TouchableOpacity>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#172554' }}>{MONTHS[pickerMonth]} {pickerYear}</Text>
              <TouchableOpacity onPress={() => { if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); } else setPickerMonth(m => m + 1); }}>
                <Ionicons name="chevron-forward" size={28} color="#172554" />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
                <Text key={d} style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 13, color: '#6b7280' }}>{d}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {/* Empty cells for offset */}
              {Array.from({ length: (new Date(pickerYear, pickerMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
                <View key={`e${i}`} style={{ width: '14.28%', height: 40 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === Math.min(pickerDay, daysInMonth);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setPickerDay(day)}
                    style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <View style={[
                      { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
                      isSelected && { backgroundColor: '#172554' },
                    ]}>
                      <Text style={{ fontSize: 15, fontWeight: isSelected ? '700' : '400', color: isSelected ? '#fff' : '#1f2937' }}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <TouchableOpacity onPress={confirmDatePicker} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#172554' }]}>
                <Text style={s.formBtnText}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelDatePicker} activeOpacity={0.8} style={[s.formBtn, { backgroundColor: '#6b7280' }]}>
                <Text style={s.formBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── Styles ── */
const s = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '500', marginBottom: 16, color: '#1f2937' },
  searchInput: {
    flex: 1, backgroundColor: '#f9fafb', height: 52, borderRadius: 16,
    paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: '#172554',
  },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#3b82f6', height: 52, paddingHorizontal: 16,
    borderRadius: 12, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tableHeader: {
    backgroundColor: '#172554', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 8,
  },
  headerCell: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 13 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#dbeafe',
  },
  cell: { textAlign: 'center', color: '#1f2937', fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxHeight: '88%',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  closeBtn: { position: 'absolute', top: 12, right: 16, zIndex: 10 },
  detailName: { color: '#172554', fontSize: 22, fontWeight: '700' },
  detailInfo: { color: '#6b7280', fontSize: 15, marginTop: 2 },
  // Action buttons
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 3,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  // Sort
  sortContainer: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  sortBtnActive: { backgroundColor: '#fff' },
  sortBtnBorder: { borderBottomWidth: 3, borderBottomColor: '#172554' },
  sortText: { fontSize: 13, color: '#6b7280' },
  sortTextActive: { color: '#172554', fontWeight: '700' },
  // Payment boxes
  paymentBox: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 90 },
  paymentDate: { color: '#eff6ff', fontSize: 11 },
  paymentAmount: { color: '#eff6ff', fontSize: 20, fontWeight: '700' },
  paymentStatus: { color: '#eff6ff', fontSize: 11 },
  // Forms
  formTitle: { color: '#172554', fontSize: 24, fontWeight: '700', marginTop: 20, marginBottom: 12, textAlign: 'center' },
  formLabel: { color: '#374151', fontSize: 15, fontWeight: '500', marginTop: 10, fontStyle: 'italic' },
  formInput: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
    height: 48, paddingHorizontal: 14, fontSize: 15, marginTop: 6, color: '#1f2937',
  },
  formActions: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16, marginBottom: 20 },
  formBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, elevation: 2 },
  formBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  estadoBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
    height: 48, paddingHorizontal: 14, marginTop: 6,
  },
});
