const express = require('express');
const pool = require('../db/connection.js');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const passengersQuery = await pool.query(`
        SELECT
            pp.id AS passenger_profile_id,
            r.id AS role_id,
            u.id AS user_id,
            u.nombre,
            u.username,
            pp.nacionalidad,
            pp.barrio,
            pp.img_pasajero,
            rp.id AS route_passenger_id,
            rp.origen,
            rp.destino,
            rp.dias,
            rp.hora_salida,
            rp.hora_llegada,
            rp.hora_regreso,
            rp.hora_llegada_regreso
        FROM passenger_profiles pp
        JOIN roles r ON pp.role_id = r.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN route_passengers rp ON rp.pasajero_id = pp.id
        WHERE r.tipo = 'pasajero' AND r.activo = true
        ORDER BY pp.id, rp.id;
    `);

    // Transformar filas planas → objeto agrupado
    const passengers = {};
    passengersQuery.rows.forEach(row => {
    if (!passengers[row.passenger_profile_id]) {
        passengers[row.passenger_profile_id] = {
        id: row.passenger_profile_id,
        user_id: row.user_id,
        nombre: row.nombre || row.username,
        img_pasajero: row.img_pasajero,
        nacionalidad: row.nacionalidad,
        barrio: row.barrio,
        rutas: []
        };
    }

    if (row.route_passenger_id) {
        passengers[row.passenger_profile_id].rutas.push({
        id: row.route_passenger_id,
        origen: row.origen,
        destino: row.destino,
        dias: row.dias,
        hora_salida: row.hora_salida,
        hora_llegada: row.hora_llegada,
        hora_regreso: row.hora_regreso,
        hora_llegada_regreso: row.hora_llegada_regreso
        });
    }
    });

    res.json(Object.values(passengers));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener perfiles de pasajeros", error: err.message });
  }
});

module.exports = router;