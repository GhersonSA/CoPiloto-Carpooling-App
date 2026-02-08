import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ uri, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: { size: 40, icon: 20 },
    md: { size: 64, icon: 32 },
    lg: { size: 96, icon: 48 },
    xl: { size: 128, icon: 64 },
  };

  const containerSize = sizes[size].size;
  const iconSize = sizes[size].icon;

  const isValidUri = uri && uri.trim() !== '' && (uri.startsWith('http://') || uri.startsWith('https://'));

  return (
    <View style={[s.container, { width: containerSize, height: containerSize, borderRadius: containerSize / 2 }]}>
      {isValidUri ? (
        <Image 
          source={{ uri }} 
          style={s.image}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="person" size={iconSize} color="#6b7280" />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});