import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Route } from '../../types';

interface RouteCardProps {
    route: Route;
    onPress?: () => void;
}

export function RouteCard({ route, onPress }: RouteCardProps) {
    return (
        <Card onPress={onPress} className="mb-3">
            <View className="flex-row items-start">
                <View className="items-center mr-3">
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                    <View className="w-0.5 h-8 bg-gray-300 my-1" />
                    <View className="w-3 h-3 rounded-full bg-red-500" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 font-medium">{route.origen}</Text>
                    <View className="h-6" />
                    <Text className="text-gray-800 font-medium">{route.destino}</Text>
                </View>
            </View>
            <View className="flex-row mt-4 pt-3 border-t border-gray-100">
                <View className="flex-row items-center flex-1">
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <Text className="text-gray-500 ml-1">{route.hora_salida}</Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="calendar" size={16} color="#6b7280" />
                    <Text className="text-gray-500 ml-1">{route.dias}</Text>
                </View>
            </View>
        </Card>
    );
}