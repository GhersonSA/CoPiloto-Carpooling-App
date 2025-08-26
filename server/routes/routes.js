const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso } = req.body;
    const chofer_id = req.user.id;
    const newRoute = await pool.query(
      `INSERT INTO routes (chofer_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [chofer_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso]
    );
    res.json(newRoute.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear ruta');
  }
});

router.get('/', async (req, res) => {
  try {
    const allRoutes = await pool.query('SELECT * FROM routes');
    res.json(allRoutes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener rutas');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const route = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    if (route.rows.length === 0) return res.status(404).send('Ruta no encontrada');
    res.json(route.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener ruta');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso } = req.body;
    const chofer_id = req.user.id;

    const routeCheck = await pool.query('SELECT * FROM routes WHERE id=$1', [id]);
    if (routeCheck.rows.length === 0) return res.status(404).send('Ruta no encontrada');
    if (routeCheck.rows[0].chofer_id !== chofer_id) return res.status(403).send('No autorizado');

    const updatedRoute = await pool.query(
      `UPDATE routes SET origen=$1, destino=$2, dias=$3, hora_salida=$4, hora_llegada=$5, hora_regreso=$6, hora_llegada_regreso=$7 WHERE id=$8 RETURNING *`,
      [ origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso, id]
    );
    if (updatedRoute.rows.length === 0) return res.status(404).send('Ruta no encontrada');
    res.json(updatedRoute.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar ruta');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const chofer_id = req.user.id;

    const routeCheck = await pool.query('SELECT * FROM routes WHERE id=$1', [id]);
    if (routeCheck.rows.length === 0) return res.status(404).send('Ruta no encontrada');
    if (routeCheck.rows[0].chofer_id !== chofer_id) return res.status(403).send('No autorizado');

    const deletedRoute = await pool.query('DELETE FROM routes WHERE id=$1 RETURNING *', [id]);
    if (deletedRoute.rows.length === 0) return res.status(404).send('Ruta no encontrada');
    res.json({ mensaje: 'Ruta eliminada', ruta: deletedRoute.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar ruta');
  }
});

module.exports = router;
