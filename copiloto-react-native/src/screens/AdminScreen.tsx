import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usersAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  nombre: string;
  provider: string;
  role: string;
  created_at: string;
}

export default function AdminScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email !== 'admin@demo.com') {
      navigation.goBack();
      return;
    }
    fetchUsers();
  }, [user, fetchUsers, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  const handleDelete = (u: AdminUser) => {
    if (u.role === 'admin' || u.role === 'guest') {
      Alert.alert('Error', 'No puedes eliminar este usuario');
      return;
    }

    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de eliminar a ${u.nombre || u.username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersAPI.delete(u.id);
              setUsers((prev) => prev.filter((x) => x.id !== u.id));
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ],
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#ef4444', text: '#fff' };
      case 'guest': return { bg: '#6b7280', text: '#fff' };
      default: return { bg: '#3b82f6', text: '#fff' };
    }
  };

  const getProviderBadge = (provider: string) => {
    return provider === 'google'
      ? { bg: '#fee2e2', text: '#b91c1c' }
      : { bg: '#dcfce7', text: '#15803d' };
  };

  if (loading) {
    return (
      <View style={st.loadingContainer}>
        <ActivityIndicator size="large" color="#172554" />
        <Text style={st.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={st.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#172554']} />}
    >
      <View style={st.content}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#172554" />
        </TouchableOpacity>

        <Text style={st.sectionTitle}>Panel de Administración</Text>

        <View style={st.containerCard}>
          <Text style={st.cardTitle}>
            Usuarios Registrados ({users.length})
          </Text>

          <View style={st.tableHeader}>
            <Text style={[st.thText, { flex: 0.4 }]}>ID</Text>
            <Text style={[st.thText, { flex: 1 }]}>Nombre</Text>
            <Text style={[st.thText, { flex: 0.8 }]}>Rol</Text>
            <Text style={[st.thText, { flex: 0.6, textAlign: 'right' }]}>Acciones</Text>
          </View>

          {users.map((u, index) => {
            const roleBadge = getRoleBadge(u.role);
            const provBadge = getProviderBadge(u.provider);
            const canDelete = u.role !== 'admin' && u.role !== 'guest';
            const isEven = index % 2 === 0;

            return (
              <View key={u.id} style={[st.userRow, { backgroundColor: isEven ? '#f9fafb' : '#fff' }]}>
                {/* Compact table row */}
                <View style={st.tableRow}>
                  <Text style={[st.cellId, { flex: 0.4 }]}>{u.id}</Text>
                  <Text style={[st.cellName, { flex: 1 }]} numberOfLines={1}>{u.nombre || '-'}</Text>
                  <View style={{ flex: 0.8 }}>
                    <View style={[st.badge, { backgroundColor: roleBadge.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[st.badgeText, { color: roleBadge.text }]}>
                        {u.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
                    {canDelete ? (
                      <TouchableOpacity onPress={() => handleDelete(u)} style={st.deleteBtn}>
                        <Ionicons name="trash" size={13} color="#fff" />
                        <Text style={st.deleteBtnText}>Eliminar</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={st.protectedText}>Protegido</Text>
                    )}
                  </View>
                </View>

                {/* Detail rows beneath */}
                <View style={st.detailRows}>
                  <View style={st.detailRow}>
                    <Ionicons name="mail-outline" size={14} color="#6b7280" />
                    <Text style={st.detailText} numberOfLines={1}>{u.email}</Text>
                  </View>
                  <View style={st.detailRow}>
                    <Ionicons name="person-outline" size={14} color="#6b7280" />
                    <Text style={st.detailText}>@{u.username}</Text>
                  </View>
                  <View style={st.detailRow}>
                    <Ionicons name={u.provider === 'google' ? 'logo-google' : 'lock-closed-outline'} size={14} color={provBadge.text} />
                    <View style={[st.badge, { backgroundColor: provBadge.bg }]}>
                      <Text style={[st.badgeText, { color: provBadge.text }]}>
                        {u.provider === 'google' ? 'Google' : 'Local'}
                      </Text>
                    </View>
                  </View>
                  <View style={st.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                    <Text style={st.detailText}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {users.length === 0 && (
            <View style={st.emptyState}>
              <Text style={st.emptyText}>No hay usuarios registrados</Text>
            </View>
          )}
        </View>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6b7280' },

  backBtn: { marginBottom: 12, padding: 4, alignSelf: 'flex-start' },

  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 16,
  },

  containerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 16,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#172554',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  thText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  userRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172554',
  },
  cellName: {
    fontSize: 14,
    color: '#111827',
  },

  detailRows: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  protectedText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
