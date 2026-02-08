import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!nombre.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setError('');
    setLoading(true);
    const result = await register(nombre.trim(), username.trim(), email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Error al registrarse');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-blue-950"
      >
        <View className="flex-1 justify-center items-center px-8 py-12">
          <View className="items-center mb-6">
            <Text className="text-white text-4xl font-bold">Crear Cuenta</Text>
            <Text className="text-blue-300 text-base mt-2">Únete a CoPiloto</Text>
          </View>

          <View className="w-full max-w-sm">
            {error ? (
              <View className="bg-red-500/20 border border-red-400 rounded-xl p-3 mb-4">
                <Text className="text-red-300 text-center">{error}</Text>
              </View>
            ) : null}

            <Input
              placeholder="Nombre completo"
              placeholderTextColor="#94a3b8"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />

            <Input
              placeholder="Nombre de usuario"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Input
              placeholder="Correo electrónico"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              placeholder="Contraseña"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              placeholder="Confirmar contraseña"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View className="mt-2">
              <Button
                title="Registrarse"
                onPress={handleRegister}
                loading={loading}
                variant="primary"
              />
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-blue-400 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
