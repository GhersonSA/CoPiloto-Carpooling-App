import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      )}
      <TextInput
        className={`bg-white p-4 rounded-xl text-lg border ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}