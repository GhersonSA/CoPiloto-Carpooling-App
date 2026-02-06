import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Cargando...' }: LoadingProps) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <ActivityIndicator size="large" color="#1e3a5f" />
      <Text className="text-gray-600 mt-4">{message}</Text>
    </View>
  );
}