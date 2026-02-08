import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, TextInput, Linking, Alert, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNombre('');
    setUsername('');
    setError('');
  };

  const openModal = () => {
    resetForm();
    setIsRegisterMode(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (isRegisterMode) {
      if (!nombre.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setError('Por favor, completa todos los campos.');
        setLoading(false);
        return;
      }
      const result = await register(nombre.trim(), username.trim(), email.trim(), password);
      setLoading(false);
      if (result.success) {
        setIsRegisterMode(false);
        resetForm();
      } else {
        setError(result.error || 'Error al registrarse');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Por favor, completa todos los campos.');
        setLoading(false);
        return;
      }
      const result = await login(email.trim(), password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas');
      }
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    const guestEmail = process.env.EXPO_PUBLIC_GUEST_EMAIL || 'guest@demo.com';
    const guestPass = process.env.EXPO_PUBLIC_GUEST_PASSWORD || 'guest';
    const result = await login(guestEmail, guestPass);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Error al entrar como invitado');
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Próximamente disponible en la app móvil');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 70, paddingHorizontal: 24, backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
        <TouchableOpacity onPress={() => Linking.openURL('https://ghersonsa.com/')}>
          <Image source={require('../../assets/G-black.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/gherson-sa/')}>
            <Ionicons name="logo-linkedin" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://github.com/GhersonSA')}>
            <Ionicons name="logo-github" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <ImageBackground
        source={require('../../assets/city-2.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
        imageStyle={{ opacity: 0.3 }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <Image source={require('../../assets/CoPiloto-logo-1.png')} style={{ width: 350, height: 120 }} resizeMode="contain" />
          <Text style={{ fontSize: 28, color: '#172554', fontStyle: 'italic', fontWeight: '600', marginBottom: 24, marginTop: 2, textAlign: 'center' }}>
            Tu compañero de ruta
          </Text>
          <View style={{ width: 288, marginTop: 20, gap: 16 }}>
            <TouchableOpacity
              onPress={openModal}
              style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#9ca3af', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 3 }}
            >
              <Text style={{ color: '#1f2937', fontSize: 24, fontWeight: '600' }}>Empezar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGuest}
              style={{ backgroundColor: '#172554', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 3 }}
            >
              <Text style={{ color: '#fff', fontSize: 24, fontStyle: 'italic' }}>Modo Invitado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Footer */}
      <View style={{ height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#6b7280', fontSize: 12, textAlign: 'center' }}>
          © CoPiloto by GhersonSA. Todos los derechos reservados.
        </Text>
      </View>

      {/* ========== LOGIN/REGISTER MODAL ========== */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full max-w-lg"
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            >
              <View
                className="bg-white rounded-lg p-6 relative"
                style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
              >
                {/* Close X */}
                <TouchableOpacity onPress={closeModal} className="absolute top-4 right-4 z-10">
                  <Ionicons name="close" size={40} color="#9ca3af" />
                </TouchableOpacity>

                {/* Title */}
                <Text className="text-blue-950 text-4xl font-bold mb-2 mt-2">
                  {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
                </Text>

                {/* Subtitle */}
                <Text className="text-gray-500 text-base italic mb-4">
                  {isRegisterMode ? 'Crea una cuenta nueva' : 'Encuentra tu recorrido ideal con CoPiloto'}
                </Text>

                {/* Error */}
                {error ? (
                  <View className="bg-red-100 border border-red-400 rounded px-4 py-3 mb-3">
                    <Text className="text-red-700 text-center">{error}</Text>
                  </View>
                ) : null}

                {/* ===== REGISTER ===== */}
                {isRegisterMode && (
                  <>
                    {/* Nombre */}
                    <Text className="text-base font-medium mt-2.5 mb-1">
                      Nombre<Text className="text-red-600">*</Text>
                    </Text>
                    <TextInput
                      placeholder="Nombre"
                      value={nombre}
                      onChangeText={setNombre}
                      className="border border-gray-300 rounded h-12 px-4 text-base mb-2"
                      placeholderTextColor="#9ca3af"
                    />

                    {/* Usuario */}
                    <Text className="text-base font-medium mt-2.5 mb-1">
                      Usuario<Text className="text-red-600">*</Text>
                    </Text>
                    <TextInput
                      placeholder="Usuario"
                      value={username}
                      onChangeText={setUsername}
                      className="border border-gray-300 rounded h-12 px-4 text-base mb-2"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                    />

                    {/* Correo (register) */}
                    <Text className="text-base font-medium mt-2.5 mb-1">
                      Correo Electrónico<Text className="text-red-600">*</Text>
                    </Text>
                    <TextInput
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      className="border border-gray-300 rounded h-12 px-4 text-base mb-2"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Correo (login) */}
                {!isRegisterMode && (
                  <>
                    <Text className="text-base font-medium mt-2.5 mb-1">
                      Correo Electrónico<Text className="text-red-600">*</Text>
                    </Text>
                    <TextInput
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      className="border border-gray-300 rounded h-12 px-4 text-base mb-2"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Contraseña */}
                <Text className="text-base font-medium mt-2.5 mb-1">
                  Contraseña<Text className="text-red-600">*</Text>
                </Text>
                <TextInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  className="border border-gray-300 rounded h-12 px-4 text-base mb-4"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                />

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#090098',
                    paddingVertical: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginHorizontal: 32,
                    marginTop: 20,
                    opacity: loading ? 0.6 : 1,
                  }}>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>
                    {loading ? 'Cargando...' : isRegisterMode ? 'Registrarse' : 'Iniciar sesión'}
                  </Text>
                </TouchableOpacity>

                {/* Google */}
                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingVertical: 14,
                    marginHorizontal: 32,
                    marginTop: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    elevation: 2,
                  }}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </Svg>
                  <Text style={{ color: '#374151', fontSize: 18, marginLeft: 8 }}>Continuar con Google</Text>
                </TouchableOpacity>

                {/* Guest */}
                <TouchableOpacity
                  onPress={handleGuest}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#d1d5db',
                    borderRadius: 12,
                    paddingVertical: 14,
                    marginHorizontal: 32,
                    marginTop: 12,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.10,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ color: '#111', fontSize: 20 }}>Entrar como invitado</Text>
                </TouchableOpacity>

                {/* Toggle */}
                <TouchableOpacity
                  onPress={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                  className="mx-8 mt-4"
                >
                  <Text className="text-blue-600 text-center text-base mt-5">
                    {isRegisterMode ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Registrarse'}
                  </Text>
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity onPress={closeModal} className="mt-3 mb-2">
                  <Text className="text-gray-500 text-center underline text-base">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
