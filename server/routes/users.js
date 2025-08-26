const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, username, email, password } = req.body;
    const newUser = await pool.query(
      `INSERT INTO users (nombre, username, email, password)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre, username, email, password ]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear usuario');
  }
});

// READ all
router.get('/', async (req, res) => {
  try {
    const allUsers = await pool.query('SELECT * FROM users');
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener usuarios');
  }
});

// READ one
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).send('Usuario no encontrado');
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener usuario');
  }
});

// GET usuario logeado
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener usuario logeado");
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, username, email } = req.body;
    const updatedUser = await pool.query(
      `UPDATE users SET nombre=$1,username=$2,email=$3
       WHERE id=$4 RETURNING *`,
      [nombre, username, email, id]
    );
    if (updatedUser.rows.length === 0) return res.status(404).send('Usuario no encontrado');
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar usuario');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
    if (deletedUser.rows.length === 0) return res.status(404).send('Usuario no encontrado');
    res.json({ mensaje: 'Usuario eliminado', usuario: deletedUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar usuario');
  }
});

// CREATE passenger
router.post('/pasajeros', async (req, res) => {
  try {
    const { nombre, img, barrio, nacionalidad } = req.body;

    const newPassenger = await pool.query(
      `INSERT INTO users (nombre, img, barrio, nacionalidad, tipo_usuario)
       VALUES ($1, $2, $3, $4, 'pasajero') RETURNING *`,
      [nombre, img, barrio, nacionalidad]
    );

    res.json(newPassenger.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear pasajero');
  }
});


module.exports = router;