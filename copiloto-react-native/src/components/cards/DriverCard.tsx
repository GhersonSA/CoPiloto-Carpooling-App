import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Driver } from '../../types';

interface DriverCardProps {
    driver: Driver;
    onPress?: () => void;
}

export function DriverCard({ driver, onPress }: DriverCardProps) {
    return (
        <Card onPress={onPress} className="mb-3">
            <View className="flex-row items-center">
                <Avatar uri={driver.img_chofer} size="md" />
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-semibold text-gray-800">
                        {driver.nombre}
                    </Text>
                    {driver.direccion && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="location" size={14} color="#6b7280" />
                            <Text className="text-gray-500 ml-1">{driver.direccion}</Text>
                        </View>
                    )}
                    {driver.telefono && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="call" size={14} color="#6b7280" />
                            <Text className="text-gray-500 ml-1">{driver.telefono}</Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
        </Card>
    );
}