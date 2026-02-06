import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private db: DatabaseService) {}

  async findByUserId(userId: number) {
    const result = await this.db.query(
      `SELECT * FROM payments 
       WHERE pasajero_id IN (SELECT id FROM passengers WHERE user_id = $1) 
       OR chofer_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async create(createDto: CreatePaymentDto) {
    const result = await this.db.query(
      `INSERT INTO payments (pasajero_id, chofer_id, ruta_id, fecha, pago, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        createDto.pasajero_id,
        createDto.chofer_id || null,
        createDto.ruta_id || null,
        createDto.fecha,
        createDto.pago,
        createDto.estado || 'pendiente',
      ],
    );
    return result.rows[0];
  }

  async update(id: number, updateDto: UpdatePaymentDto) {
    const result = await this.db.query(
      `UPDATE payments SET fecha=$1, pago=$2, estado=$3 WHERE id=$4 RETURNING *`,
      [updateDto.fecha, updateDto.pago, updateDto.estado, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Pago no encontrado');
    }

    return result.rows[0];
  }

  async delete(id: number) {
    const result = await this.db.query(
      'DELETE FROM payments WHERE id=$1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Pago no encontrado');
    }

    return { message: 'Pago eliminado' };
  }
}
