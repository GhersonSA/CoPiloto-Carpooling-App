import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DriversService {
  private backendUrl: string;

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
  }

  // Helper para normalizar URLs de imágenes
  private normalizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `${this.backendUrl}${url}`;
    return url;
  }

  async findAll() {
    const result = await this.db.query(`
      SELECT 
        u.id AS user_id,
        u.nombre,
        u.email,
        dp.id AS driver_profile_id,
        dp.direccion,
        dp.barrio,
        dp.calificacion,
        dp.img_chofer,
        dp.telefono,
        v.id AS vehicle_id,
        v.marca,
        v.modelo,
        v.color,
        v.matricula,
        v.plazas,
        v.img_vehiculo,
        r.id AS route_id,
        r.origen,
        r.destino,
        r.dias,
        r.hora_salida,
        r.hora_llegada,
        r.hora_regreso,
        r.hora_llegada_regreso
      FROM users u
      INNER JOIN roles ro ON ro.user_id = u.id AND ro.tipo = 'chofer'
      INNER JOIN driver_profiles dp ON dp.role_id = ro.id
      LEFT JOIN vehicles v ON v.driver_profile_id = dp.id
      LEFT JOIN routes r ON r.chofer_id = u.id
      WHERE ro.activo = true
      ORDER BY dp.id, r.id
    `);

    // Agrupar resultados
    const drivers: Record<number, any> = {};
    result.rows.forEach((row: any) => {
      if (!drivers[row.driver_profile_id]) {
        drivers[row.driver_profile_id] = {
          id: row.driver_profile_id,
          user_id: row.user_id,
          nombre: row.nombre,
          email: row.email,
          img_chofer: this.normalizeImageUrl(row.img_chofer),
          direccion: row.direccion,
          barrio: row.barrio,
          calificacion: row.calificacion,
          telefono: row.telefono,
          vehiculo: row.vehicle_id
            ? {
                id: row.vehicle_id,
                marca: row.marca,
                modelo: row.modelo,
                color: row.color,
                matricula: row.matricula,
                plazas: row.plazas,
                img_vehiculo: this.normalizeImageUrl(row.img_vehiculo),
              }
            : null,
          rutas: [],
        };
      }

      if (
        row.route_id &&
        !drivers[row.driver_profile_id].rutas.find(
          (r: any) => r.id === row.route_id,
        )
      ) {
        drivers[row.driver_profile_id].rutas.push({
          id: row.route_id,
          origen: row.origen,
          destino: row.destino,
          dias: row.dias,
          hora_salida: row.hora_salida,
          hora_llegada: row.hora_llegada,
          hora_regreso: row.hora_regreso,
          hora_llegada_regreso: row.hora_llegada_regreso,
        });
      }
    });

    return Object.values(drivers);
  }

  async findByRoleId(roleId: number) {
    const result = await this.db.query(
      'SELECT * FROM driver_profiles WHERE role_id = $1',
      [roleId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const profile = result.rows[0];
    return {
      ...profile,
      img_chofer: this.normalizeImageUrl(profile.img_chofer),
    };
  }
}
