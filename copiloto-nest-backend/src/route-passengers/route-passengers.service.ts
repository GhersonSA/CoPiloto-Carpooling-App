import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRoutePassengerDto } from './dto/create-route-passenger.dto';
import { UpdateRoutePassengerDto } from './dto/update-route-passenger.dto';

@Injectable()
export class RoutePassengersService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query('SELECT * FROM route_passengers');
    return result.rows;
  }

  async findByUserId(userId: number) {
    const result = await this.db.query(
      'SELECT * FROM route_passengers WHERE pasajero_id = $1',
      [userId],
    );
    return result.rows;
  }

  async findById(id: number) {
    const result = await this.db.query(
      'SELECT * FROM route_passengers WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Registro no encontrado');
    }

    return result.rows[0];
  }

  async findMyRoutes(userId: number) {
    const result = await this.db.query(
      `SELECT id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso
       FROM route_passengers
       WHERE pasajero_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async create(userId: number, createDto: CreateRoutePassengerDto) {
    const {
      origen,
      destino,
      dias,
      hora_salida,
      hora_llegada,
      hora_regreso,
      hora_llegada_regreso,
    } = createDto;

    if (!origen || !destino || !dias || !hora_salida || !hora_llegada) {
      throw new BadRequestException('Faltan campos requeridos');
    }

    // Verificar si ya existe
    const existing = await this.db.query(
      'SELECT * FROM route_passengers WHERE pasajero_id = $1',
      [userId],
    );

    if (existing.rows.length > 0) {
      // Actualizar existente
      const result = await this.db.query(
        `UPDATE route_passengers 
         SET origen = $1, destino = $2, dias = $3, hora_salida = $4, hora_llegada = $5, 
             hora_regreso = $6, hora_llegada_regreso = $7
         WHERE pasajero_id = $8
         RETURNING *`,
        [
          origen,
          destino,
          dias,
          hora_salida,
          hora_llegada,
          hora_regreso || null,
          hora_llegada_regreso || null,
          userId,
        ],
      );
      return result.rows[0];
    }

    // Crear nuevo
    const result = await this.db.query(
      `INSERT INTO route_passengers 
       (pasajero_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        userId,
        origen,
        destino,
        dias,
        hora_salida,
        hora_llegada,
        hora_regreso || null,
        hora_llegada_regreso || null,
      ],
    );

    return result.rows[0];
  }

  async update(id: number, userId: number, updateDto: UpdateRoutePassengerDto) {
    // Verificar propiedad
    const checkOwnership = await this.db.query(
      'SELECT * FROM route_passengers WHERE id = $1 AND pasajero_id = $2',
      [id, userId],
    );

    if (checkOwnership.rows.length === 0) {
      throw new ForbiddenException('No tienes permiso para editar esta ruta');
    }

    const result = await this.db.query(
      `UPDATE route_passengers 
       SET origen = $1, destino = $2, dias = $3, 
           hora_salida = $4, hora_llegada = $5, 
           hora_regreso = $6, hora_llegada_regreso = $7
       WHERE id = $8 AND pasajero_id = $9
       RETURNING *`,
      [
        updateDto.origen,
        updateDto.destino,
        updateDto.dias,
        updateDto.hora_salida,
        updateDto.hora_llegada,
        updateDto.hora_regreso || null,
        updateDto.hora_llegada_regreso || null,
        id,
        userId,
      ],
    );

    return result.rows[0];
  }

  async deleteById(id: number, userId: number) {
    const result = await this.db.query(
      'DELETE FROM route_passengers WHERE id = $1 AND pasajero_id = $2 RETURNING *',
      [id, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Ruta no encontrada o sin permiso');
    }

    return { message: 'Ruta eliminada exitosamente' };
  }

  async deleteAllByUserId(userId: number) {
    const result = await this.db.query(
      'DELETE FROM route_passengers WHERE pasajero_id = $1 RETURNING *',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('No tienes rutas para eliminar');
    }

    return {
      message: 'Rutas eliminadas exitosamente',
      deleted: result.rows.length,
    };
  }
}
