import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

@Injectable()
export class PassengersService {
  constructor(private db: DatabaseService) {}

  async findByUserId(userId: number) {
    const result = await this.db.query(
      'SELECT * FROM passengers WHERE user_id = $1 ORDER BY id ASC',
      [userId],
    );
    return result.rows;
  }

  async create(userId: number, createDto: CreatePassengerDto) {
    const result = await this.db.query(
      `INSERT INTO passengers (nombre, nacionalidad, barrio, img, user_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        createDto.nombre,
        createDto.nacionalidad,
        createDto.barrio,
        createDto.img,
        userId,
      ],
    );
    return result.rows[0];
  }

  async update(id: number, userId: number, updateDto: UpdatePassengerDto) {
    const result = await this.db.query(
      `UPDATE passengers SET nombre=$1, nacionalidad=$2, barrio=$3, img=$4 
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [
        updateDto.nombre,
        updateDto.nacionalidad,
        updateDto.barrio,
        updateDto.img,
        id,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    return result.rows[0];
  }

  async delete(id: number, userId: number) {
    const result = await this.db.query(
      'DELETE FROM passengers WHERE id=$1 AND user_id=$2 RETURNING *',
      [id, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    return { message: 'Pasajero eliminado' };
  }
}
