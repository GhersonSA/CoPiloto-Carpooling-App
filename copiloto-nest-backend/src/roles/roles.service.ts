import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private db: DatabaseService) {}

  async findByUserId(userId: number) {
    const result = await this.db.query(
      'SELECT * FROM roles WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async create(userId: number, createRoleDto: CreateRoleDto) {
    const { tipo, data } = createRoleDto;

    // Validación según tipo
    if (tipo === 'chofer') {
      const required = [
        'direccion',
        'barrio',
        'img_chofer',
        'marca',
        'modelo',
        'color',
        'matricula',
        'plazas',
        'img_vehiculo',
      ];
      for (const field of required) {
        if (!data[field]) {
          throw new BadRequestException(`Falta el campo ${field}`);
        }
      }
    }

    if (tipo === 'pasajero') {
      const required = ['nacionalidad', 'barrio', 'img_pasajero'];
      for (const field of required) {
        if (!data[field]) {
          throw new BadRequestException(`Falta el campo ${field}`);
        }
      }
    }

    // Verificar si ya tiene este rol
    const existing = await this.db.query(
      'SELECT id FROM roles WHERE user_id = $1 AND tipo = $2',
      [userId, tipo],
    );

    let rolId: number;

    if (existing.rows.length > 0) {
      rolId = existing.rows[0].id;
      await this.db.query('UPDATE roles SET activo=true WHERE id=$1', [rolId]);
    } else {
      const roleResult = await this.db.query(
        'INSERT INTO roles (user_id, tipo, activo, creado_en) VALUES ($1, $2, true, NOW()) RETURNING id',
        [userId, tipo],
      );
      rolId = roleResult.rows[0].id;
    }

    // Insertar datos según tipo
    if (tipo === 'chofer') {
      await this.createDriverProfile(userId, rolId, data);
    } else if (tipo === 'pasajero') {
      await this.createPassengerProfile(userId, rolId, data);
    }

    return { message: 'Rol activado correctamente', roleId: rolId };
  }

  private async createDriverProfile(userId: number, rolId: number, data: any) {
    const profileExist = await this.db.query(
      'SELECT id FROM driver_profiles WHERE role_id=$1',
      [rolId],
    );

    let driverProfileId: number;

    if (profileExist.rows.length > 0) {
      driverProfileId = profileExist.rows[0].id;
      await this.db.query(
        'UPDATE driver_profiles SET direccion=$1, barrio=$2, img_chofer=$3, telefono=$4 WHERE role_id=$5',
        [
          data.direccion,
          data.barrio,
          data.img_chofer,
          data.telefono || null,
          rolId,
        ],
      );
    } else {
      const insertProfile = await this.db.query(
        'INSERT INTO driver_profiles (role_id, direccion, barrio, img_chofer, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [
          rolId,
          data.direccion,
          data.barrio,
          data.img_chofer,
          data.telefono || null,
        ],
      );
      driverProfileId = insertProfile.rows[0].id;
    }

    // Vehículo
    const vehicleExist = await this.db.query(
      'SELECT id FROM vehicles WHERE driver_profile_id=$1',
      [driverProfileId],
    );

    if (vehicleExist.rows.length > 0) {
      await this.db.query(
        `UPDATE vehicles SET marca=$1, modelo=$2, color=$3, matricula=$4, plazas=$5, img_vehiculo=$6 WHERE driver_profile_id=$7`,
        [
          data.marca,
          data.modelo,
          data.color,
          data.matricula,
          data.plazas,
          data.img_vehiculo,
          driverProfileId,
        ],
      );
    } else {
      await this.db.query(
        'INSERT INTO vehicles (driver_profile_id, marca, modelo, color, matricula, plazas, img_vehiculo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          driverProfileId,
          data.marca,
          data.modelo,
          data.color,
          data.matricula,
          data.plazas,
          data.img_vehiculo,
        ],
      );
    }

    // Rutas
    if (data.rutas && Array.isArray(data.rutas)) {
      await this.db.query('DELETE FROM routes WHERE chofer_id = $1', [userId]);

      for (const ruta of data.rutas) {
        await this.db.query(
          `INSERT INTO routes (chofer_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            userId,
            ruta.origen || null,
            ruta.destino || null,
            ruta.dias || null,
            ruta.hora_salida || null,
            ruta.hora_llegada || null,
            ruta.hora_regreso || null,
            ruta.hora_llegada_regreso || null,
          ],
        );
      }
    }
  }

  private async createPassengerProfile(
    userId: number,
    rolId: number,
    data: any,
  ) {
    const profileExist = await this.db.query(
      'SELECT id FROM passenger_profiles WHERE role_id=$1',
      [rolId],
    );

    if (profileExist.rows.length > 0) {
      await this.db.query(
        'UPDATE passenger_profiles SET nacionalidad=$1, barrio=$2, img_pasajero=$3, telefono=$4 WHERE id=$5',
        [
          data.nacionalidad,
          data.barrio,
          data.img_pasajero,
          data.telefono || null,
          profileExist.rows[0].id,
        ],
      );
    } else {
      await this.db.query(
        'INSERT INTO passenger_profiles (role_id, nacionalidad, barrio, img_pasajero, telefono) VALUES ($1, $2, $3, $4, $5)',
        [
          rolId,
          data.nacionalidad,
          data.barrio,
          data.img_pasajero,
          data.telefono || null,
        ],
      );
    }

    // Rutas de pasajero
    if (data.rutas && Array.isArray(data.rutas)) {
      await this.db.query(
        'DELETE FROM route_passengers WHERE pasajero_id = $1',
        [userId],
      );

      for (const ruta of data.rutas) {
        await this.db.query(
          `INSERT INTO route_passengers 
          (pasajero_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            userId,
            ruta.origen || null,
            ruta.destino || null,
            ruta.dias || null,
            ruta.hora_salida || null,
            ruta.hora_llegada || null,
            ruta.hora_regreso || null,
            ruta.hora_llegada_regreso || null,
          ],
        );
      }
    }
  }

  async delete(userId: number, tipo: string) {
    const roleRes = await this.db.query(
      'SELECT id FROM roles WHERE user_id = $1 AND tipo = $2',
      [userId, tipo],
    );

    if (roleRes.rows.length === 0) {
      throw new NotFoundException('Rol no encontrado');
    }

    const rolId = roleRes.rows[0].id;

    if (tipo === 'pasajero') {
      await this.db.query('DELETE FROM passenger_profiles WHERE role_id = $1', [
        rolId,
      ]);
      await this.db.query(
        'DELETE FROM route_passengers WHERE pasajero_id = $1',
        [userId],
      );
    }

    if (tipo === 'chofer') {
      const driverProfiles = await this.db.query(
        'SELECT id FROM driver_profiles WHERE role_id = $1',
        [rolId],
      );

      for (const profile of driverProfiles.rows) {
        await this.db.query(
          'DELETE FROM vehicles WHERE driver_profile_id = $1',
          [profile.id],
        );
      }

      await this.db.query('DELETE FROM driver_profiles WHERE role_id = $1', [
        rolId,
      ]);
      await this.db.query('DELETE FROM routes WHERE chofer_id = $1', [userId]);
    }

    await this.db.query('DELETE FROM roles WHERE id = $1', [rolId]);

    return { message: 'Rol eliminado correctamente' };
  }
}
