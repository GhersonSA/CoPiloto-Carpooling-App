import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useRoles } from '../hooks/useRoles';
import { useToast } from '../hooks/useToast';
import { Avatar } from '../components/ui/Avatar';
import {
  driverProfilesAPI,
  vehiclesAPI,
  passengerProfilesAPI,
  routesAPI,
  routePassengersAPI,
  rolesAPI,
} from '../api/client';

// Profile sub-components
import DriverProfileCard from '../components/Profile/DriverProfileCard';
import PassengerProfileCard from '../components/Profile/PassengerProfileCard';
import RoleSelector from '../components/Profile/RoleSelector';
import RoleFormModal from '../components/Profile/RoleFormModal';
import RouteChoferModal from '../components/Profile/RouteChoferModal';
import RoutePasajeroModal from '../components/Profile/RoutePasajeroModal';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const { roles, isChofer, isPasajero, fetchRoles, deleteRole } = useRoles();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [perfilChofer, setPerfilChofer] = useState<any>(null);
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [perfilPasajero, setPerfilPasajero] = useState<any>(null);

  // Routes (originals = read-only display, editable copies for modals)
  const [rutaChoferOriginal, setRutaChoferOriginal] = useState<any>(null);
  const [rutaPasajeroOriginal, setRutaPasajeroOriginal] = useState<any>(null);

  const [editRoleModal, setEditRoleModal] = useState(false);
  const [formRole, setFormRole] = useState<any>(null);

  const [showRutasChoferModal, setShowRutasChoferModal] = useState(false);
  const [rutaChofer, setRutaChofer] = useState<any>(null);
  const [paradasSeleccionadas, setParadasSeleccionadas] = useState<{ pasajero_id: string; direccion: string }[]>([]);

  const [showRutasPasajeroModal, setShowRutasPasajeroModal] = useState(false);
  const [rutaPasajero, setRutaPasajero] = useState<any>(null);

  // ─── Load all profile data ───
  const loadProfileData = useCallback(async () => {
    if (!user || roles.length === 0) {
      setLoading(false);
      return;
    }

    const rolChofer = roles.find((r) => r.tipo === 'chofer');
    const rolPasajero = roles.find((r) => r.tipo === 'pasajero');

    try {
      // Chofer
      if (rolChofer) {
        const [perfilRes, rutaRes] = await Promise.all([
          driverProfilesAPI.getByRoleId(rolChofer.id).catch(() => null),
          routesAPI.getAll({ chofer_id: user.id }).catch(() => null),
        ]);
        if (perfilRes?.data) {
          setPerfilChofer(perfilRes.data);
          const vRes = await vehiclesAPI.getByProfileId(perfilRes.data.id).catch(() => null);
          if (vRes?.data) setVehiculo(vRes.data);
        }
        if (rutaRes?.data) {
          const ruta = rutaRes.data.find((r: any) => r.chofer_id === user.id) || null;
          setRutaChoferOriginal(ruta);
        }
      } else {
        setPerfilChofer(null);
        setVehiculo(null);
        setRutaChoferOriginal(null);
      }

      // Pasajero
      if (rolPasajero) {
        const [perfilRes, rutaRes] = await Promise.all([
          passengerProfilesAPI.getByRoleId(rolPasajero.id).catch(() => null),
          routePassengersAPI.getMisRutas().catch(() => null),
        ]);
        if (perfilRes?.data) setPerfilPasajero(perfilRes.data);
        if (rutaRes?.data) setRutaPasajeroOriginal(rutaRes.data[0] || null);
      } else {
        setPerfilPasajero(null);
        setRutaPasajeroOriginal(null);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [user, roles]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoles();
    await loadProfileData();
    setRefreshing(false);
  }, [fetchRoles, loadProfileData]);

  // ─── Helper ───
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const rolActual = roles.length > 0 ? roles.map((r) => capitalize(r.tipo)).join(' y ') : 'Ninguno';

  // ─── Delete Role ───
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

  // ─── Edit Role ───
  const handleEditRole = async (rol: any) => {
    let rolInicial: any = { tipo: rol.tipo };

    try {
      if (rol.tipo === 'chofer') {
        const perfilRes = await driverProfilesAPI.getByRoleId(rol.id).catch(() => null);
        if (perfilRes?.data) {
          const perfil = perfilRes.data;
          rolInicial = { ...rolInicial, direccion: perfil.direccion, barrio: perfil.barrio, telefono: perfil.telefono, img_chofer: perfil.img_chofer };
          const vRes = await vehiclesAPI.getByProfileId(perfil.id).catch(() => null);
          if (vRes?.data) {
            const veh = vRes.data;
            rolInicial = { ...rolInicial, marca: veh.marca, modelo: veh.modelo, color: veh.color, matricula: veh.matricula, plazas: veh.plazas, img_vehiculo: veh.img_vehiculo };
          }
        }
      }

      if (rol.tipo === 'pasajero') {
        const perfilRes = await passengerProfilesAPI.getByRoleId(rol.id).catch(() => null);
        if (perfilRes?.data) {
          const perfil = perfilRes.data;
          rolInicial = { ...rolInicial, nacionalidad: perfil.nacionalidad, barrio: perfil.barrio, telefono: perfil.telefono, img_pasajero: perfil.img_pasajero };
        }
      }
    } catch (err) {
      console.error('Error fetching role data:', err);
    }

    setFormRole(rolInicial);
    setEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!formRole) {
      toast.error('No hay datos del rol para actualizar');
      return;
    }

    try {
      const { tipo, ...data } = formRole;
      await rolesAPI.create({ tipo, data });
      await fetchRoles();
      await loadProfileData();
      setEditRoleModal(false);
      setFormRole(null);
      toast.success('Rol actualizado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar');
    }
  };

  // ─── Route Chofer ───
  const abrirModalRutasChofer = () => {
    if (rutaChoferOriginal) {
      setRutaChofer({ ...rutaChoferOriginal });
      if (rutaChoferOriginal.paradas && Array.isArray(rutaChoferOriginal.paradas)) {
        setParadasSeleccionadas(
          rutaChoferOriginal.paradas.map((p: any) => ({
            pasajero_id: p.pasajero_id || '',
            direccion: p.direccion || '',
          }))
        );
      } else {
        setParadasSeleccionadas([]);
      }
    } else {
      setRutaChofer(null);
      setParadasSeleccionadas([]);
    }
    setShowRutasChoferModal(true);
  };

  const cerrarModalRutasChofer = () => {
    setShowRutasChoferModal(false);
    setRutaChofer(null);
    setParadasSeleccionadas([]);
  };

  const guardarRutaChofer = async () => {
    try {
      const rutaConParadas = {
        ...rutaChofer,
        paradas: paradasSeleccionadas.filter((p) => p.direccion),
        chofer_id: user?.id,
      };

      if (rutaChofer?.id) {
        await routesAPI.update(rutaChofer.id, rutaConParadas);
      } else {
        await routesAPI.create(rutaConParadas);
      }

      // Reload routes
      const rutaRes = await routesAPI.getAll({ chofer_id: user?.id }).catch(() => null);
      if (rutaRes?.data) {
        const ruta = rutaRes.data.find((r: any) => r.chofer_id === user?.id) || null;
        setRutaChoferOriginal(ruta);
      }
      setParadasSeleccionadas([]);
      cerrarModalRutasChofer();
      toast.success('Ruta de chofer guardada exitosamente');
    } catch (err) {
      console.error('Error guardando ruta de chofer:', err);
      toast.error('Error al guardar ruta de chofer');
    }
  };

  const eliminarRutaChofer = () => {
    if (!rutaChoferOriginal?.id) return;
    Alert.alert('Eliminar Ruta', '¿Seguro que quieres eliminar tu ruta de chofer?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await routesAPI.delete(rutaChoferOriginal.id);
            setRutaChoferOriginal(null);
            toast.success('Ruta de chofer eliminada exitosamente');
          } catch (err) {
            console.error(err);
            toast.error('Error al eliminar ruta de chofer');
          }
        },
      },
    ]);
  };

  // ─── Route Pasajero ───
  const abrirModalRutasPasajero = () => {
    if (rutaPasajeroOriginal) {
      setRutaPasajero({ ...rutaPasajeroOriginal });
    } else {
      setRutaPasajero({
        id: 0,
        origen: '',
        destino: '',
        dias: '',
        hora_salida: '',
        hora_llegada: '',
        hora_regreso: '',
        hora_llegada_regreso: '',
      });
    }
    setShowRutasPasajeroModal(true);
  };

  const cerrarModalRutasPasajero = () => {
    setShowRutasPasajeroModal(false);
    setRutaPasajero(null);
  };

  const guardarRutaPasajero = async () => {
    try {
      await routePassengersAPI.create({ ...rutaPasajero });
      // Reload routes
      const rutaRes = await routePassengersAPI.getMisRutas().catch(() => null);
      if (rutaRes?.data) setRutaPasajeroOriginal(rutaRes.data[0] || null);
      cerrarModalRutasPasajero();
      toast.success('Ruta de pasajero guardada exitosamente');
    } catch (err) {
      console.error('Error guardando ruta de pasajero:', err);
      toast.error('Error al guardar ruta de pasajero');
    }
  };

  const eliminarRutaPasajero = () => {
    Alert.alert('Eliminar Ruta', '¿Seguro que quieres eliminar tu ruta de pasajero?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await routePassengersAPI.delete();
            setRutaPasajeroOriginal(null);
            toast.success('Ruta de pasajero eliminada exitosamente');
          } catch (err) {
            console.error(err);
            toast.error('Error al eliminar ruta de pasajero');
          }
        },
      },
    ]);
  };

  // ─── Logout ───
  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, cerrar', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={st.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={st.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={st.screen}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
      >
        <View style={st.content}>
          {/* Title */}
          <Text style={st.screenTitle}>Perfil</Text>

          {/* Main card */}
          <View style={st.mainCard}>
            {/* Avatar + Name */}
            <View style={st.userHeader}>
              <Avatar size="xl" />
              <Text style={st.userName}>{user ? user.nombre || user.username : 'Cargando...'}</Text>
              {user?.email === 'admin@demo.com' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Admin')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#dc2626',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 10,
                    marginTop: 8,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Admin</Text>
                </TouchableOpacity>
              )}
              <Text style={st.userRole}>Rol actual: {rolActual}</Text>
              <Text style={st.userRating}>Calificación: Próximamente...</Text>
            </View>

            {/* Profile Cards */}
            {perfilChofer && (
              <DriverProfileCard
                perfil={perfilChofer}
                vehiculo={vehiculo}
                rutaOriginal={rutaChoferOriginal}
                onGestionarRuta={abrirModalRutasChofer}
                onEliminarRuta={eliminarRutaChofer}
              />
            )}

            {perfilPasajero && (
              <PassengerProfileCard
                perfil={perfilPasajero}
                rutaOriginal={rutaPasajeroOriginal}
                onGestionarRuta={abrirModalRutasPasajero}
                onEliminarRuta={eliminarRutaPasajero}
              />
            )}

            {/* Roles list */}
            <View style={st.rolesSection}>
              <Text style={st.rolesSectionTitle}>Tus Roles</Text>
              {roles.length === 0 ? (
                <Text style={st.noRoles}>No tienes roles asignados</Text>
              ) : (
                roles.map((rol) => (
                  <View key={rol.tipo} style={st.roleItem}>
                    <View style={st.roleItemLeft}>
                      <Ionicons
                        name={rol.tipo === 'chofer' ? 'car' : 'person'}
                        size={20}
                        color={rol.tipo === 'chofer' ? '#172554' : '#15803d'}
                      />
                      <Text style={st.roleItemName}>{capitalize(rol.tipo)}</Text>
                    </View>
                    <View style={st.roleItemActions}>
                      {user?.role !== 'guest' && (
                        <>
                          <TouchableOpacity onPress={() => handleEditRole(rol)} style={st.editBtn}>
                            <Ionicons name="pencil" size={14} color="#fff" />
                            <Text style={st.editBtnText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteRole(rol.tipo)} style={st.deleteRoleBtn}>
                            <Ionicons name="trash" size={14} color="#fff" />
                            <Text style={st.deleteRoleBtnText}>Eliminar</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Add Role */}
            <RoleSelector roles={roles} fetchRoles={fetchRoles} onRoleCreated={loadProfileData} />
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} style={st.logoutBtn}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={st.logoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* ─── Modals ─── */}

      {/* Edit Role Modal */}
      <RoleFormModal
        visible={editRoleModal}
        onClose={() => {
          setEditRoleModal(false);
          setFormRole(null);
        }}
        onSubmit={handleUpdateRole}
        formRole={formRole}
        setFormRole={setFormRole}
        mode="edit"
      />

      {/* Route Chofer Modal */}
      <RouteChoferModal
        visible={showRutasChoferModal}
        onClose={cerrarModalRutasChofer}
        onSave={guardarRutaChofer}
        rutaChofer={rutaChofer}
        setRutaChofer={setRutaChofer}
        paradasSeleccionadas={paradasSeleccionadas}
        setParadasSeleccionadas={setParadasSeleccionadas}
      />

      {/* Route Pasajero Modal */}
      <RoutePasajeroModal
        visible={showRutasPasajeroModal}
        onClose={cerrarModalRutasPasajero}
        onSave={guardarRutaPasajero}
        rutaPasajero={rutaPasajero}
        setRutaPasajero={setRutaPasajero}
      />
    </>
  );
}

const st = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },

  // Main card
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },

  // User header
  userHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 10,
  },
  userRole: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
  },
  userRating: {
    fontSize: 16,
    color: '#eab308',
    textAlign: 'center',
    marginTop: 4,
  },

  // Roles section
  rolesSection: {
    marginTop: 16,
  },
  rolesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  noRoles: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  roleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  roleItemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eab308',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteRoleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
