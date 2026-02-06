import { View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const content = (
    <View className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}