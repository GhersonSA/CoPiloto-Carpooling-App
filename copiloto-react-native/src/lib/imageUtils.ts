import { ImageSourcePropType } from 'react-native';

const DEV_IP = process.env.EXPO_PUBLIC_DEV_IP || '192.168.0.21';
const PROD_URL = process.env.EXPO_PUBLIC_PROD_URL || 'http://localhost:4000';

const BACKEND_BASE = __DEV__
  ? `http://${DEV_IP}:4000`
  : PROD_URL;

const PRESET_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  '/assets/imgChofer1.png': require('../../assets/imgChofer1.png'),
  '/assets/imgChofer2.jpg': require('../../assets/imgChofer2.jpg'),
  '/assets/imgChofer3.png': require('../../assets/imgChofer3.png'),
  '/assets/imgVehiculo1.jpg': require('../../assets/imgVehiculo1.jpg'),
  '/assets/imgVehiculo2.jpeg': require('../../assets/imgVehiculo2.jpeg'),
  '/assets/imgVehiculo3.jpg': require('../../assets/imgVehiculo3.jpg'),
  '/assets/imgPasajero1.jpg': require('../../assets/imgPasajero1.jpg'),
  '/assets/imgPasajero2.jpg': require('../../assets/imgPasajero2.jpg'),
  '/assets/imgPasajero3.png': require('../../assets/imgPasajero3.png'),
};

export function getLocalPresetSource(url: string | null | undefined): ImageSourcePropType | null {
  if (!url) return null;
  return PRESET_IMAGE_MAP[url] || null;
}

export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (PRESET_IMAGE_MAP[url]) return null;

  if ((url.startsWith('https://') || url.startsWith('http://')) && !url.includes('localhost')) {
    return url;
  }

  if (url.includes('localhost:4000')) {
    return url.replace(/http:\/\/localhost:4000/, BACKEND_BASE);
  }

  if (url.startsWith('/')) {
    return `${BACKEND_BASE}${url}`;
  }

  return url;
}
