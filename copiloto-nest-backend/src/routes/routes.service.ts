import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query(`
      SELECT 
        r.id,
        r.origen,
        r.destino,
        r.dias,
        r.hora_salida,
        r.hora_llegada,
        r.hora_regreso,
        r.hora_llegada_regreso,
        r.paradas,
        u.id as chofer_id,
        u.nombre as chofer_nombre,
        u.username as chofer_username,
        dp.img_chofer,
        dp.direccion,
        dp.barrio,
        dp.calificacion,
        dp.telefono,
        v.marca,
        v.modelo,
        v.color,
        v.matricula,
        v.plazas,
        v.img_vehiculo
      FROM routes r
      INNER JOIN users u ON r.chofer_id = u.id
      INNER JOIN roles ro ON ro.user_id = u.id AND ro.tipo = 'chofer'
      INNER JOIN driver_profiles dp ON dp.role_id = ro.id
      LEFT JOIN vehicles v ON v.driver_profile_id = dp.id
      WHERE ro.activo = true
      ORDER BY r.id DESC
    `);

    return result.rows;
  }

  async findByUserId(userId: number) {
    const result = await this.db.query(
      `SELECT id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso, paradas
       FROM routes
       WHERE chofer_id = $1
       ORDER BY id DESC`,
      [userId],
    );
    return result.rows;
  }

  async create(userId: number, createDto: CreateRouteDto) {
    const result = await this.db.query(
      `INSERT INTO routes (chofer_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso, paradas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        userId,
        createDto.origen,
        createDto.destino,
        createDto.dias,
        createDto.hora_salida,
        createDto.hora_llegada,
        createDto.hora_regreso,
        createDto.hora_llegada_regreso,
        JSON.stringify(createDto.paradas || []),
      ],
    );

    return result.rows[0];
  }

  async update(id: number, userId: number, updateDto: UpdateRouteDto) {
    const result = await this.db.query(
      `UPDATE routes SET origen=$1, destino=$2, dias=$3, hora_salida=$4, hora_llegada=$5, 
       hora_regreso=$6, hora_llegada_regreso=$7, paradas=$8 WHERE id=$9 AND chofer_id=$10 RETURNING *`,
      [
        updateDto.origen,
        updateDto.destino,
        updateDto.dias,
        updateDto.hora_salida,
        updateDto.hora_llegada,
        updateDto.hora_regreso,
        updateDto.hora_llegada_regreso,
        JSON.stringify(updateDto.paradas || []),
        id,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return result.rows[0];
  }

  async delete(id: number, userId: number) {
    const result = await this.db.query(
      'DELETE FROM routes WHERE id=$1 AND chofer_id=$2 RETURNING *',
      [id, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return { message: 'Ruta eliminada' };
  }
}
