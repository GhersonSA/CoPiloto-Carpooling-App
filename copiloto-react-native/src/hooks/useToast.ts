import { useCallback, useRef } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';

export function useToast() {
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // iOS: usar Alert como fallback
      Alert.alert(
        type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Info',
        message
      );
    }
  }, []);

  const success = useCallback((msg: string) => show(msg, 'success'), [show]);
  const error = useCallback((msg: string) => show(msg, 'error'), [show]);
  const info = useCallback((msg: string) => show(msg, 'info'), [show]);

  return { success, error, info };
}
