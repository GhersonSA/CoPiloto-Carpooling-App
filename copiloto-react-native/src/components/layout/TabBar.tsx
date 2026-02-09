import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/* Tab definitions */
type TabDef = {
  routeName: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
  isMain?: boolean;
};

const TABS: TabDef[] = [
  { routeName: 'Passengers', icon: 'people-outline', iconFocused: 'people', label: 'Pasajeros' },
  { routeName: 'Payments', icon: 'card-outline', iconFocused: 'card', label: 'Pagos' },
  { routeName: 'Home', icon: 'earth-outline', iconFocused: 'earth', label: 'Inicio', isMain: true },
  { routeName: 'Dashboard', icon: 'stats-chart-outline', iconFocused: 'stats-chart', label: 'Stats' },
  { routeName: 'Profile', icon: 'person-circle-outline', iconFocused: 'person-circle', label: 'Perfil' },
];

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, 18),
            marginBottom: insets.bottom > 0 ? 0 : 12,
          },
        ]}
      >
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.routeName);
          const isFocused = state.index === routeIndex;
          const iconName = isFocused ? tab.iconFocused : tab.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented && !isFocused) {
              navigation.navigate(tab.routeName);
            }
          };

          /* ── Center elevated "Inicio" button ── */
          if (tab.isMain) {
            return (
              <View key={tab.routeName} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', position: 'absolute', top: 0, zIndex: 10 }}>
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.8}
                  style={styles.mainWrapper}
                >
                  <View
                    style={[
                      styles.mainButton,
                      isFocused ? styles.mainButtonActive : styles.mainButtonInactive,
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={34}
                      color={isFocused ? '#fff' : '#172554'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.routeName}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tab}
            >
              {/* Active indicator line */}
              {isFocused && <View style={styles.activeIndicator} />}

              <Ionicons
                name={iconName}
                size={28}
                color={isFocused ? '#172554' : '#9ca3af'}
                style={{ marginBottom: 4 }}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? '#172554' : '#9ca3af', fontSize: 13, marginTop: 2 },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Logout confirmation modal ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.8}
                style={styles.btnLogout}
              >
                <Text style={styles.btnLogoutText}>Sí, cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
                style={styles.btnCancel}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TabBar;

/* ── Styles ── */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: Platform.OS === 'ios' ? 88 : 120,
    paddingTop: 6,
    ...Platform.select({
      tab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        paddingVertical: 12,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingVertical: 10, // Más espacio vertical
    paddingBottom: 6, // Más espacio inferior
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    left: '50%',
    transform: [{ translateX: -24 }],
    width: 48,
    height: 3,
    backgroundColor: '#172554',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  /* Main (center) elevated button */
  mainWrapper: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingBottom: 8,
    marginBottom: 40,
  },
  mainButton: {
    position: 'absolute',
    top: -24,
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  mainButtonActive: {
    backgroundColor: '#172554',
    borderColor: '#172554',
  },
  mainButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#172554',
  },
  /* Logout modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  btnLogout: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnLogoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnCancel: {
    backgroundColor: '#d1d5db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnCancelText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 15,
  },
});