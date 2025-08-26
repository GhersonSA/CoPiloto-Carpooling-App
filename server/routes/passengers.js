const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

// CREATE passenger
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, img, barrio, nacionalidad } = req.body;
    const userId = req.user.id;

    const newPassenger = await pool.query(
      `INSERT INTO passengers (nombre, img, barrio, nacionalidad, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, img, barrio, nacionalidad, userId]
    );

    res.json(newPassenger.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear pasajero');
  }
});

// READ all passengers
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPassengers = await pool.query('SELECT * FROM passengers WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(allPassengers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener pasajeros');
  }
});

// READ one passenger
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const passenger = await pool.query('SELECT * FROM passengers WHERE id = $1 AND user_id = $2', [id, userId]);
    if (passenger.rows.length === 0) return res.status(404).send('Pasajero no encontrado');
    res.json(passenger.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener pasajero');
  }
});

// UPDATE passenger
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, img, barrio, nacionalidad } = req.body;
    const userId = req.user.id;

    const updatedPassenger = await pool.query(
      `UPDATE passengers SET nombre=$1, img=$2, barrio=$3, nacionalidad=$4 WHERE id=$5 AND user_id=$6 RETURNING *`,
      [nombre, img, barrio, nacionalidad, id, userId]
    );
    if (updatedPassenger.rows.length === 0) return res.status(404).send('Pasajero no encontrado');
    res.json(updatedPassenger.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar pasajero');
  }
});

// DELETE passenger
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedPassenger = await pool.query('DELETE FROM passengers WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (deletedPassenger.rows.length === 0) return res.status(404).send('Pasajero no encontrado');
    res.json({ mensaje: 'Pasajero eliminado', pasajero: deletedPassenger.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar pasajero');
  }
});

module.exports = router;
