import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File, type: string, oldImageUrl?: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se recibió archivo');
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', type);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Eliminar imagen anterior si existe
    if (oldImageUrl) {
      await this.deleteOldImage(oldImageUrl);
    }

    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, file.buffer);

    // Devolver URL absoluta del backend
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
    const publicUrl = `${backendUrl}/uploads/${type}/${fileName}`;

    return publicUrl;
  }

  /**
   * Elimina una imagen antigua del sistema de archivos
   */
  async deleteOldImage(imageUrl: string): Promise<void> {
    try {
      // Extraer la ruta relativa de la URL
      // Ejemplo: http://localhost:4000/uploads/chofer/123_foto.jpg -> /uploads/chofer/123_foto.jpg
      const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
      let relativePath = imageUrl;
      
      if (imageUrl.startsWith(backendUrl)) {
        relativePath = imageUrl.replace(backendUrl, '');
      } else if (imageUrl.startsWith('http')) {
        // Es una URL externa, no la eliminamos
        return;
      }
      
      // Limpiar la ruta
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1);
      }
      
      const filePath = join(process.cwd(), 'public', relativePath);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`Imagen anterior eliminada: ${filePath}`);
      }
    } catch (error) {
      // No lanzar error si falla la eliminación, solo loguearlo
      console.error('Error eliminando imagen anterior:', error);
    }
  }
}
