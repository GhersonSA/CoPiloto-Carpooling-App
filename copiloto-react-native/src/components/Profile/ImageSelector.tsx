import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import apiClient from '../../api/client';
import { getImageUrl } from '../../lib/imageUtils';

export interface PresetImage {
  source: ImageSourcePropType;
  id: string;
}

interface ImageSelectorProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
  presetImages: PresetImage[];
  label: string;
  type: 'chofer' | 'pasajero' | 'vehiculo';
}

export default function ImageSelector({
  currentImage,
  onImageSelect,
  presetImages,
  label,
  type,
}: ImageSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const presetIds = presetImages.map((p) => p.id);

  const isCustomImage =
    currentImage &&
    !presetIds.includes(currentImage) &&
    (currentImage.includes('/uploads/') || currentImage.startsWith('http'));

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para subir imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `${type}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      formData.append('type', type);

      if (isCustomImage && currentImage) {
        formData.append('oldImageUrl', currentImage);
      }

      const response = await apiClient.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url) {
        setUploadedUrl(response.data.url);
        onImageSelect(response.data.url);
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // Combine custom uploaded images + preset local images
  const customUrls: string[] = [];
  if (uploadedUrl && !presetIds.includes(uploadedUrl)) {
    customUrls.push(uploadedUrl);
  }
  if (isCustomImage && currentImage !== uploadedUrl) {
    customUrls.push(currentImage!);
  }

  return (
    <View style={s.container}>
      <Text style={s.label}>
        <Ionicons name="image" size={14} color="#a855f7" /> {label}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll}>
        {customUrls.map((url, i) => {
          const fullUrl = getImageUrl(url);
          const isSelected = currentImage === url;
          return (
            <TouchableOpacity
              key={`custom-${i}`}
              onPress={() => onImageSelect(url)}
              style={[s.imageBox, isSelected && s.imageBoxSelected]}
            >
              {fullUrl ? (
                <Image source={{ uri: fullUrl }} style={s.presetImage} />
              ) : (
                <Ionicons name="person" size={28} color="#9ca3af" />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Preset local images */}
        {presetImages.map((preset) => {
          const isSelected = currentImage === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onImageSelect(preset.id)}
              style={[s.imageBox, isSelected && s.imageBoxSelected]}
            >
              <Image source={preset.source} style={s.presetImage} />
            </TouchableOpacity>
          );
        })}

        {/* Pick from gallery */}
        <TouchableOpacity onPress={pickFromGallery} style={s.uploadButton} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#3b82f6" size="small" />
          ) : (
            <Ionicons name="cloud-upload" size={28} color="#9ca3af" />
          )}
        </TouchableOpacity>
      </ScrollView>

      <Text style={s.hint}>
        <Ionicons name="information-circle" size={12} color="#9ca3af" /> Selecciona una imagen o sube la tuya (máx. 5MB)
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  scroll: {
    flexDirection: 'row',
  },
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  imageBoxSelected: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadButton: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
});
