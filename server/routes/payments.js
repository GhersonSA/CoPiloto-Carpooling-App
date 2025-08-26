const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { pasajero_id, chofer_id, ruta_id, fecha, pago, estado } = req.body;
    const userId = req.user.id;

    const newPayment = await pool.query(
      `INSERT INTO payments (pasajero_id, chofer_id, ruta_id, fecha, pago, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pasajero_id, chofer_id || null, ruta_id || null, fecha, pago, estado]
    );
    res.json(newPayment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear pago');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPayments = await pool.query('SELECT p.* FROM payments p JOIN passengers pa ON p.pasajero_id = pa.id WHERE pa.user_id = $1', [userId]);
    res.json(allPayments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener pagos');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await pool.query('SELECT p.* FROM payments p JOIN passengers pa ON p.pasajero_id = pa.id WHERE p.id = $1 AND pa.user_id = $2', [id, userId]);
    if (payment.rows.length === 0) return res.status(404).send('Pago no encontrado');
    res.json(payment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener pago');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, pago, estado } = req.body;
    const userId = req.user.id;

    const updatedPayment = await pool.query(
      `UPDATE payments p SET fecha=$1, pago=$2, estado=$3 FROM passengers pa WHERE p.id=$4 AND p.pasajero_id = pa.id AND pa.user_id=$5 RETURNING p.*`,
      [fecha, pago, estado, id, userId]
    );
    if (updatedPayment.rows.length === 0) return res.status(404).send('Pago no encontrado');
    res.json(updatedPayment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar pago');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedPayment = await pool.query('DELETE FROM payments p USING passengers pa WHERE p.id=$1 AND p.pasajero_id = pa.id AND pa.user_id=$2 RETURNING p.*', [id, userId]);
    if (deletedPayment.rows.length === 0) return res.status(404).send('Pago no encontrado');
    res.json({ mensaje: 'Pago eliminado', pago: deletedPayment.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar pago');
  }
});
/*
// Registrar un pago para un pasajero
router.post('/payments', async (req, res) => {
  try {
    const { pasajero_id, fecha, pago, estado } = req.body;

    const newPayment = await pool.query(
      `INSERT INTO payments (pasajero_id, fecha, pago, estado)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pasajero_id, fecha, pago, estado]
    );

    res.json(newPayment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear pago');
  }
});

// POST /payments
router.post('/', auth, async (req, res) => {
  try {
    const { pasajero_id, chofer_id, ruta_id, fecha, pago, estado } = req.body;
    const userId = req.user.id;
    
    if (!pasajero_id) {
      return res.status(400).send('Debe especificar el pasajero_id');
    }

    const newPayment = await pool.query(
      `INSERT INTO payments (pasajero_id, chofer_id, ruta_id, fecha, pago, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pasajero_id, chofer_id || null, ruta_id || null, fecha, pago, estado]
    );
    
    res.json(newPayment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear pago');
  }
});
*/
module.exports = router;
