import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginNavigationProp>();

  const handleLogin = () => {
    // TODO: Implementar autenticación real con backend
    navigation.navigate("Home");
  };

  const handleGuest = () => {
    navigation.navigate("Home");
  };

  return (
    <View className="flex-1 justify-center items-center bg-blue-950 px-6">
      <Text className="text-white text-5xl font-bold mb-4">🚗 CoPiloto</Text>
      <Text className="text-gray-300 text-xl mb-10 italic">Tu compañero de ruta</Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor="#9ca3af"
        value={username}
        onChangeText={setUsername}
        className="bg-white w-full p-4 rounded-xl mb-4 text-lg"
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="bg-white w-full p-4 rounded-xl mb-6 text-lg"
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-500 w-full p-4 rounded-xl mb-4"
      >
        <Text className="text-white text-center text-xl font-semibold">
          Iniciar Sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGuest}>
        <Text className="text-gray-300 text-lg underline">Entrar como invitado</Text>
      </TouchableOpacity>
    </View>
  );
}
