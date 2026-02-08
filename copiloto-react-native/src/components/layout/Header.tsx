import { View, Text, Image, TouchableOpacity, Linking, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onProfilePress?: () => void;
  onNavigate?: (screen: string) => void;
}

const MENU_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', screen: 'Home' },
  { icon: 'map-outline' as const, label: 'Viajes', screen: 'Home' },
  { icon: 'stats-chart-outline' as const, label: 'Dashboard', screen: 'Dashboard' },
  { icon: 'people-outline' as const, label: 'Pasajeros', screen: 'Passengers' },
  { icon: 'card-outline' as const, label: 'Pagos', screen: 'Payments' },
  { icon: 'star-outline' as const, label: 'Calificaciones', screen: 'Dashboard' },
  { icon: 'person-circle-outline' as const, label: 'Tu Perfil', screen: 'Profile' },
  { icon: 'settings-outline' as const, label: 'Ajustes', screen: 'Profile' },
];

const Header = ({ onProfilePress, onNavigate }: HeaderProps) => {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuNav = (screen: string) => {
    setMenuOpen(false);
    onNavigate?.(screen);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
      {/* ===== HEADER BAR ===== */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
        {/* Hamburger */}
        <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <Ionicons name="menu" size={32} color="#1f2937" />
        </TouchableOpacity>

        {/* Logo */}
        <TouchableOpacity onPress={() => onNavigate?.('Home')} activeOpacity={0.8}>
          <Image
            source={require('../../../assets/CoPiloto-logo-4.png')}
            style={{ width: 140, height: 48 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* User info + icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ color: '#6b7280', fontSize: 14 }} numberOfLines={1}>
            {loading ? 'Cargando...' : (user?.nombre || user?.username || user?.email || 'Invitado')}
          </Text>
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={32} color="#172554" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== FULLSCREEN MENU (hamburguesa) ===== */}
      <Modal visible={menuOpen} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
          {/* Close X */}
          <TouchableOpacity
            onPress={() => setMenuOpen(false)}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10}}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={40} color="#333" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Image
              source={require('../../../assets/CoPiloto-logo-4.png')}
              style={{ width: 300, height: 64 }}
              resizeMode="contain"
            />
          </View>

          {/* Nav links */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 }}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => handleMenuNav(item.screen)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <Ionicons name={item.icon} size={26} color="#172554" />
                <Text style={{ fontSize: 22, color: '#172554', fontWeight: '500' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}
            >
              <Ionicons name="log-out-outline" size={26} color="#dc2626" />
              <Text style={{ fontSize: 22, color: '#dc2626', fontWeight: '500' }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Social links + footer */}
          <View style={{ alignItems: 'center', paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 24, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.linkedin.com/in/gherson-sa/')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-linkedin" size={32} color="#172554" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://github.com/GhersonSA')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-github" size={32} color="#172554" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>© CoPiloto by GhersonSA. 2025.</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default Header;