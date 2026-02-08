import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PassengersScreen from '../screens/PassengersScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#172554' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#eab308',  // yellow-500 — matches web active sidebar
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#172554',       // blue-950 — matches web sidebar bg
          borderTopWidth: 0,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Dashboard':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Passengers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Payments':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', headerTitle: '🚗 CoPiloto' }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard', headerTitle: 'Dashboard' }}
      />
      <Tab.Screen
        name="Passengers"
        component={PassengersScreen}
        options={{ title: 'Pasajeros', headerTitle: 'Pasajeros' }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ title: 'Pagos', headerTitle: 'Pagos' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerTitle: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
}
