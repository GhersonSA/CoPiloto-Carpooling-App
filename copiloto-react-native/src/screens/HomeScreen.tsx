import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="pt-14 px-4 pb-6">
        <Text className="text-blue-950 text-3xl font-bold mb-2">
          Bienvenido a CoPiloto
        </Text>
        <Text className="text-gray-500 text-lg mb-6">
          Gestiona tus viajes compartidos
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          className="bg-white rounded-2xl p-6 shadow-md mb-4"
        >
          <Text className="text-xl font-semibold text-blue-950">📊 Dashboard</Text>
          <Text className="text-gray-500 mt-2">Ver estadísticas y resumen</Text>
        </TouchableOpacity>

        <View className="bg-white rounded-2xl p-6 shadow-md mb-4">
          <Text className="text-xl font-semibold text-blue-950">👥 Pasajeros</Text>
          <Text className="text-gray-500 mt-2">Administra tu lista de pasajeros</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-md mb-4">
          <Text className="text-xl font-semibold text-blue-950">🚗 Viajes</Text>
          <Text className="text-gray-500 mt-2">Gestiona tus rutas y viajes</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-md mb-4">
          <Text className="text-xl font-semibold text-blue-950">💰 Pagos</Text>
          <Text className="text-gray-500 mt-2">Revisa el historial de pagos</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-md mb-4">
          <Text className="text-xl font-semibold text-blue-950">⭐ Calificaciones</Text>
          <Text className="text-gray-500 mt-2">Ver reseñas y valoraciones</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          className="bg-red-500 p-4 rounded-xl mt-6"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
