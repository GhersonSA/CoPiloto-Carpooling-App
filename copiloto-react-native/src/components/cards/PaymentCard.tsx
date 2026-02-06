import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Payment } from '../../types';

interface PaymentCardProps {
    payment: Payment;
    onPress?: () => void;
}

export function PaymentCard({ payment, onPress }: PaymentCardProps) {
    const statusColors = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        completado: 'bg-green-100 text-green-800',
        cancelado: 'bg-red-100 text-red-800',
    };

    const statusIcons = {
        pendiente: 'time',
        completado: 'checkmark-circle',
        cancelado: 'close-circle',
    };

    return (
        <Card onPress={onPress} className="mb-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                        <Ionicons name="cash" size={24} color="#3b82f6" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-lg font-semibold text-gray-800">
                            €{payment.monto.toFixed(2)}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            {new Date(payment.fecha).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View className={`px-3 py-1 rounded-full flex-row items-center ${statusColors[payment.estado].split(' ')[0]}`}>
                    <Ionicons
                        name={statusIcons[payment.estado] as any}
                        size={14}
                        color={payment.estado === 'pendiente' ? '#92400e' : payment.estado === 'completado' ? '#166534' : '#991b1b'}
                    />
                    <Text className={`ml-1 text-sm font-medium capitalize ${statusColors[payment.estado].split(' ')[1]}`}>
                        {payment.estado}
                    </Text>
                </View>
            </View>
        </Card>
    );
}