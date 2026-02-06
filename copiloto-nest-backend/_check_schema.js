require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW()")
  .then(() => {
    console.log('Columna created_at agregada correctamente');
    pool.end();
  })
  .catch(e => {
    console.log('ERROR:', e.message);
    pool.end();
  });
