import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { rolesAPI } from '../../api/client';
import { useToast } from '../../hooks/useToast';
import RoleFormModal from './RoleFormModal';

interface Props {
  roles: any[];
  fetchRoles: () => Promise<void>;
  onRoleCreated: () => Promise<void>;
}

export default function RoleSelector({ roles, fetchRoles, onRoleCreated }: Props) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const tieneChofer = roles.some((r: any) => r.tipo === 'chofer');
  const tienePasajero = roles.some((r: any) => r.tipo === 'pasajero');

  if (tieneChofer && tienePasajero) return null;

  const abrirModal = (tipo: 'chofer' | 'pasajero') => {
    setFormData({ tipo });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormData(null);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      const { tipo, ...data } = formData;
      await rolesAPI.create({ tipo, data });
      await fetchRoles();
      await onRoleCreated();
      cerrarModal();
      toast.success(`Rol ${tipo} creado exitosamente`);
    } catch (err) {
      console.error(err);
      toast.error('Error al crear rol');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Añadir Rol</Text>
      <View style={s.btnRow}>
        {!tieneChofer && (
          <TouchableOpacity onPress={() => abrirModal('chofer')} style={s.choferBtn}>
            <Ionicons name="car" size={18} color="#fff" />
            <Text style={s.btnText}>Ser Chofer</Text>
          </TouchableOpacity>
        )}
        {!tienePasajero && (
          <TouchableOpacity onPress={() => abrirModal('pasajero')} style={s.pasajeroBtn}>
            <Ionicons name="person" size={18} color="#fff" />
            <Text style={s.btnText}>Ser Pasajero</Text>
          </TouchableOpacity>
        )}
      </View>

      <RoleFormModal
        visible={showModal}
        onClose={cerrarModal}
        onSubmit={handleSubmit}
        formRole={formData}
        setFormRole={setFormData}
        mode="create"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pasajeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
