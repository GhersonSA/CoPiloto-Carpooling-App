import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ uri, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: { container: 'w-10 h-10', icon: 20 },
    md: { container: 'w-16 h-16', icon: 32 },
    lg: { container: 'w-24 h-24', icon: 48 },
    xl: { container: 'w-32 h-32', icon: 64 },
  };

  const isValidUri = uri && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('/'));

  return (
    <View className={`${sizes[size].container} rounded-full bg-gray-200 items-center justify-center overflow-hidden`}>
      {isValidUri ? (
        <Image 
          source={{ uri }} 
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="person" size={sizes[size].icon} color="#6b7280" />
      )}
    </View>
  );
}