import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    danger: 'bg-red-500',
    outline: 'bg-transparent border-2 border-blue-500',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    danger: 'text-white',
    outline: 'text-blue-500',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full p-4 rounded-xl flex-row justify-center items-center ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3b82f6' : 'white'} />
      ) : (
        <Text className={`text-lg font-semibold ${textVariants[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}