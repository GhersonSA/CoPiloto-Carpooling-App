import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="pt-14 px-4 pb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-blue-500 text-lg">← Volver</Text>
        </TouchableOpacity>

        <Text className="text-blue-950 text-3xl font-bold mb-6">Dashboard</Text>

        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-500 text-sm">💵 Total Ingresos</Text>
            <Text className="text-blue-950 text-2xl font-bold mt-2">150€</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-500 text-sm">👥 Total Pasajeros</Text>
            <Text className="text-blue-950 text-2xl font-bold mt-2">8</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-500 text-sm">⭐ Calificación</Text>
            <Text className="text-blue-950 text-2xl font-bold mt-2">4.8</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm">
            <Text className="text-gray-500 text-sm">⏳ Sin Pagar</Text>
            <Text className="text-red-500 text-2xl font-bold mt-2">25€</Text>
          </View>
        </View>

        <Text className="text-blue-950 text-xl font-bold mb-4">Últimos Pasajeros</Text>
        
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <Text className="text-blue-950 font-semibold">Juan García</Text>
          <Text className="text-gray-500">Torrero → Plaza Aragón</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <Text className="text-blue-950 font-semibold">María López</Text>
          <Text className="text-gray-500">Delicias → Centro</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-blue-950 font-semibold">Carlos Ruiz</Text>
          <Text className="text-gray-500">Actur → Romareda</Text>
        </View>
      </View>
    </ScrollView>
  );
}
