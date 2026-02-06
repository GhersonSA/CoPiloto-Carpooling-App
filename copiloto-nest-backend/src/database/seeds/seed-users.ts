// seed-users.ts
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedUsers() {
  const client = await pool.connect();

  try {
    const adminPass = process.env.ADMIN_PASS;
    const guestPass = process.env.GUEST_PASS;

    if (!adminPass || !guestPass) {
      throw new Error(
        'Debes definir ADMIN_PASS y GUEST_PASS en el entorno antes de ejecutar el seed.',
      );
    }

    const adminHash = await bcrypt.hash(adminPass, 10);
    const guestHash = await bcrypt.hash(guestPass, 10);

    // Crear usuario admin si no existe
    await client.query(
      `INSERT INTO users (email, password, username, nombre, provider, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET role = $6`,
      ['admin@demo.com', adminHash, 'admin', 'Administrador', 'local', 'admin'],
    );

    // Crear usuario invitado si no existe
    await client.query(
      `INSERT INTO users (email, password, username, nombre, provider, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET role = $6`,
      ['guest@demo.com', guestHash, 'invitado', 'Invitado', 'local', 'guest'],
    );
  } catch (error) {
    console.error('Error al crear usuarios:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
