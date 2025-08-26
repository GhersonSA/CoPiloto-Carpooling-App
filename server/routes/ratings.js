const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { para_usuario_id, tipo, comentario, calificacion } = req.body;
    const de_usuario_id = req.user.id;

    const newRating = await pool.query(
      `INSERT INTO ratings (de_usuario_id, para_usuario_id, tipo, comentario, calificacion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [de_usuario_id, para_usuario_id, tipo, comentario, calificacion]
    );
    res.json(newRating.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear calificación');
  }
});

router.get('/', async (req, res) => {
  try {
    const allRatings = await pool.query('SELECT * FROM ratings');
    res.json(allRatings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener calificaciones');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await pool.query('SELECT * FROM ratings WHERE id = $1', [id]);
    if (rating.rows.length === 0) return res.status(404).send('Calificación no encontrada');
    res.json(rating.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener calificación');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { para_usuario_id, tipo, comentario, calificacion } = req.body;
    const de_usuario_id = req.user.id;

    const ratingCheck = await pool.query('SELECT * FROM ratings WHERE id=$1', [id]);
    if (ratingCheck.rows.length === 0) return res.status(404).send('Calificación no encontrada');
    if (ratingCheck.rows[0].de_usuario_id !== de_usuario_id) return res.status(403).send('No autorizado');

    const updatedRating = await pool.query(
      `UPDATE ratings SET tipo=$1, comentario=$2, calificacion=$3 WHERE id=$4 RETURNING *`,
      [tipo, comentario, calificacion, id]
    );
    if (updatedRating.rows.length === 0) return res.status(404).send('Calificación no encontrada');
    res.json(updatedRating.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar calificación');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const de_usuario_id = req.user.id;

    const ratingCheck = await pool.query('SELECT * FROM ratings WHERE id=$1', [id]);
    if (ratingCheck.rows.length === 0) return res.status(404).send('Calificación no encontrada');
    if (ratingCheck.rows[0].de_usuario_id !== de_usuario_id) return res.status(403).send('No autorizado');
    
    const deletedRating = await pool.query('DELETE FROM ratings WHERE id=$1 RETURNING *', [id]);
    if (deletedRating.rows.length === 0) return res.status(404).send('Calificación no encontrada');
    res.json({ mensaje: 'Calificación eliminada', calificacion: deletedRating.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar calificación');
  }
});

module.exports = router;
