const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { ruta_id } = req.body;
    const userId = req.user.id;

    const passengerResult = await pool.query(
      `SELECT id FROM passengers WHERE user_id = $1`,
      [userId]
    );

    if (passengerResult.rows.length === 0) {
      return res.status(400).json({ error: "Este usuario no tiene pasajero asociado" });
    }

    const pasajero_id = passengerResult.rows[0].id;

    const newRP = await pool.query(
      `INSERT INTO route_passengers (ruta_id, pasajero_id) VALUES ($1, $2) RETURNING *`,
      [ruta_id, pasajero_id]
    );
    res.json(newRP.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al añadir pasajero a ruta');
  }
});

router.get('/', async (req, res) => {
  try {
    const allRP = await pool.query('SELECT * FROM route_passengers');
    res.json(allRP.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener pasajeros en rutas');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rp = await pool.query('SELECT * FROM route_passengers WHERE id = $1', [id]);
    if (rp.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json(rp.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener registro');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { ruta_id } = req.body;
    const userId = req.user.id;

    const passengerResult = await pool.query(
      `SELECT id FROM passengers WHERE user_id = $1`,
      [userId]
    );

    if (passengerResult.rows.length === 0) {
      return res.status(400).json({ error: "Este usuario no tiene pasajero asociado" });
    }

    const pasajero_id = passengerResult.rows[0].id;

    const updatedRP = await pool.query(
      `UPDATE route_passengers SET ruta_id=$1, pasajero_id=$2 WHERE id=$3 RETURNING *`,
      [ruta_id, pasajero_id, id]
    );
    if (updatedRP.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json(updatedRP.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar registro');
  }
});

// GET /route-passengers/mis-rutas
router.get('/mis-rutas', auth, async (req, res) => {
  try {
    const passengerResult = await pool.query(
      `SELECT id FROM passengers WHERE user_id = $1`,
      [req.user.id]
    );

    if (passengerResult.rows.length === 0) {
      return res.status(400).json({ error: "Este usuario no tiene pasajero asociado" });
    }

    const pasajero_id = passengerResult.rows[0].id;

    const result = await pool.query(
      `SELECT rp.id as route_passenger_id, rp.ruta_id,
              r.origen, r.destino, r.dias,
              r.hora_salida, r.hora_llegada,
              r.hora_regreso, r.hora_llegada_regreso
       FROM route_passengers rp
       JOIN routes r ON rp.ruta_id = r.id
       WHERE rp.pasajero_id = $1`,
      [pasajero_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /route-passengers/mis-rutas:", err);
    res.status(500).send("Error al obtener rutas del pasajero");
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const passengerResult = await pool.query(
      `SELECT id FROM passengers WHERE user_id = $1`,
      [userId]
    );

    if (passengerResult.rows.length === 0) {
      return res.status(400).json({ error: "Este usuario no tiene pasajero asociado" });
    }

    const pasajero_id = passengerResult.rows[0].id;

    const deletedRP = await pool.query(`DELETE FROM route_passengers WHERE id=$1 AND pasajero_id=$2 RETURNING *`, [id, pasajero_id]);
    if (deletedRP.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json({ mensaje: 'Registro eliminado', registro: deletedRP.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar registro');
  }
});

module.exports = router;
