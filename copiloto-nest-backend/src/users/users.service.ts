import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findByEmail(email: string) {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows[0];
  }

  async findByEmailAndProvider(email: string, provider: string) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1 AND provider = $2',
      [email, provider],
    );
    return result.rows[0];
  }

  async findById(id: number) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [
      id,
    ]);
    return result.rows[0];
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT id, email, username, nombre, provider, role, created_at 
       FROM users 
       ORDER BY id DESC`,
    );
    return result.rows;
  }

  async delete(id: number) {
    const user = await this.findById(id);
    if (user?.role === 'admin' || user?.role === 'guest') {
      throw new Error('No se puede eliminar este usuario');
    }
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { message: 'Usuario eliminado' };
  }

  async create(data: {
    email: string;
    password: string | null;
    username: string;
    nombre: string;
    provider?: string;
    role?: string;
  }) {
    const result = await this.db.query(
      `INSERT INTO users (email, password, username, nombre, provider, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.email,
        data.password,
        data.username,
        data.nombre,
        data.provider || 'local',
        data.role || 'user',
      ],
    );
    return result.rows[0];
  }
}
