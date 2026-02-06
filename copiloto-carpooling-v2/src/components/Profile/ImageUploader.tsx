'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { getProxiedImageUrl } from '@/lib/imageUtils';

interface ImageUploaderProps {
    currentImage?: string;
    onImageSelect: (imageUrl: string) => void;
    presetImages: string[];
    label: string;
    type: 'chofer' | 'pasajero' | 'vehiculo';
}

const ImageUploader = ({ currentImage, onImageSelect, presetImages, label, type }: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const toast = useToast();

    // Determinar si currentImage es una imagen personalizada (no preset)
    const isCustomImage = currentImage && 
        !presetImages.includes(currentImage) && 
        (currentImage.includes('/uploads/') || currentImage.startsWith('http://localhost'));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast.warning('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.warning('La imagen no debe superar 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            
            // Enviar la URL de la imagen anterior para que el backend la elimine
            if (isCustomImage && currentImage) {
                formData.append('oldImageUrl', currentImage);
            }

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error subiendo imagen:', errorData);
                throw new Error('Error subiendo imagen');
            }

            const data = await response.json();
            setUploadedUrl(data.url);
            onImageSelect(data.url);
            toast.success('Imagen subida correctamente');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    // Construir lista de imágenes: uploadedUrl (nueva subida) + currentImage (si es custom) + presets
    const customImages: string[] = [];
    if (uploadedUrl && !presetImages.includes(uploadedUrl)) {
        customImages.push(uploadedUrl);
    }
    if (isCustomImage && currentImage !== uploadedUrl) {
        customImages.push(currentImage);
    }
    const allImages = [...customImages, ...presetImages];

    return (
        <div className="w-full mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fa-solid fa-image mr-2 text-purple-500"></i>
                {label}
            </label>

            {/* Imágenes predefinidas + subida */}
            <div className="flex gap-3 flex-wrap items-center">
                {allImages.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={i}
                        src={getProxiedImageUrl(url)}
                        alt={`Opción ${i + 1}`}
                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-3 transition-all hover:scale-105 ${currentImage === url ? 'border-blue-500 shadow-lg ring-2 ring-blue-300' : 'border-gray-300'
                            }`}
                        onClick={() => onImageSelect(url)}
                    />
                ))}

                {/* Botón de subir imagen personalizada */}
                <label className="relative w-16 h-16 border-3 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    ) : (
                        <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-500"></i>
                    )}
                </label>
            </div>

            <p className="text-xs text-gray-500 mt-2">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Selecciona una imagen o sube la tuya (máx. 5MB)
            </p>
        </div>
    );
};

export default ImageUploader;