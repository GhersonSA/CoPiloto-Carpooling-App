import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PassengersScreen from '../screens/PassengersScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoutesScreen from '../screens/RoutesScreen';
import Header from '../components/layout/Header';
import TabBar from '../components/layout/TabBar';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        header: () => <TabHeader />,
      }}
    >
      {/* Order mobileTab */}
      <Tab.Screen name="Passengers" component={PassengersScreen} options={{ title: 'Pasajeros' }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Pagos' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Routes" component={RoutesScreen} options={{ title: 'Rutas' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

/** Header wrapper que conecta navegación */
function TabHeader() {
  const navigation = useNavigation<any>();
  return (
    <Header
      onNavigate={(screen) => navigation.navigate(screen)}
      onProfilePress={() => navigation.navigate('Profile')}
    />
  );
}
