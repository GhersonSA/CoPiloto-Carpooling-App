const express = require('express');
const pool = require('../db/connection.js');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const driversQuery = await pool.query(`
        SELECT 
            dp.id AS driver_profile_id,
            r.id AS role_id,
            u.id AS user_id,
            u.nombre,
            dp.img_chofer,
            dp.direccion,
            dp.barrio,
            dp.calificacion,
            v.id AS vehicle_id,
            v.marca,
            v.modelo,
            v.color,
            v.matricula,
            v.plazas,
            v.img_vehiculo,
            rt.id AS route_id,
            rt.origen,
            rt.destino,
            rt.dias,
            rt.hora_salida,
            rt.hora_llegada,
            rt.hora_regreso,
            rt.hora_llegada_regreso
        FROM driver_profiles dp
        JOIN roles r ON dp.role_id = r.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN vehicles v ON v.driver_profile_id = dp.id
        LEFT JOIN routes rt ON rt.chofer_id = u.id
        WHERE r.tipo = 'chofer' AND r.activo = true
        ORDER BY dp.id, rt.id;
    `);

    // Transformar filas planas → objeto agrupado
    const drivers = {};
    driversQuery.rows.forEach(row => {
      if (!drivers[row.driver_profile_id]) {
        drivers[row.driver_profile_id] = {
          id: row.driver_profile_id,
          user_id: row.user_id,
          nombre: row.nombre,
          img_chofer: row.img_chofer,
          direccion: row.direccion,
          barrio: row.barrio,
          calificacion: row.calificacion,
          vehiculo: row.vehicle_id ? {
            id: row.vehicle_id,
            marca: row.marca,
            modelo: row.modelo,
            color: row.color,
            matricula: row.matricula,
            plazas: row.plazas,
            img_vehiculo: row.img_vehiculo
          } : null,
          rutas: []
        };
      }

      if (row.route_id) {
        drivers[row.driver_profile_id].rutas.push({
          id: row.route_id,
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

    res.json(Object.values(drivers));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener drivers", error: err.message });
  }
});

module.exports = router;