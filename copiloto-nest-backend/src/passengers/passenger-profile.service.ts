import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PassengerProfilesService {
  private backendUrl: string;

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
  }

  private normalizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `${this.backendUrl}${url}`;
    return url;
  }

  async findAll() {
    const result = await this.db.query(`
      SELECT
        pp.id AS passenger_profile_id,
        r.id AS role_id,
        u.id AS user_id,
        u.nombre,
        u.username,
        pp.nacionalidad,
        pp.barrio,
        pp.img_pasajero,
        pp.calificacion,
        pp.telefono,
        rp.id AS route_passenger_id,
        rp.origen,
        rp.destino,
        rp.dias,
        rp.hora_salida,
        rp.hora_llegada,
        rp.hora_regreso,
        rp.hora_llegada_regreso
      FROM passenger_profiles pp
      JOIN roles r ON pp.role_id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN route_passengers rp ON rp.pasajero_id = u.id
      WHERE r.tipo = 'pasajero' AND r.activo = true
      ORDER BY pp.id, rp.id
    `);

    // Agrupar
    const passengers: Record<number, any> = {};
    result.rows.forEach((row: any) => {
      if (!passengers[row.passenger_profile_id]) {
        passengers[row.passenger_profile_id] = {
          id: row.passenger_profile_id,
          user_id: row.user_id,
          nombre: row.nombre || row.username,
          username: row.username,
          img_pasajero: this.normalizeImageUrl(row.img_pasajero),
          nacionalidad: row.nacionalidad,
          barrio: row.barrio,
          calificacion: row.calificacion,
          telefono: row.telefono,
          rutas: [],
        };
      }

      if (row.route_passenger_id) {
        passengers[row.passenger_profile_id].rutas.push({
          id: row.route_passenger_id,
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

    return Object.values(passengers);
  }

  async findByRoleId(roleId: number) {
    const result = await this.db.query(
      `SELECT 
        pp.*,
        u.nombre,
        u.username,
        u.email
      FROM passenger_profiles pp
      JOIN roles r ON pp.role_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE pp.role_id = $1`,
      [roleId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const profile = result.rows[0];
    return {
      ...profile,
      img_pasajero: this.normalizeImageUrl(profile.img_pasajero),
    };
  }
}
