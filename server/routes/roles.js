const express = require('express');
const pool = require('../db/connection.js');
const auth = require('../middlewares/auth');
const router = express.Router();

// Activar o actualizar rol
router.post('/', auth, async (req, res) => {
  const { tipo, data } = req.body;
  const user_id = req.user?.id;

  if (!user_id) return res.status(400).json({ message: "Usuario no válido" });
  if (!tipo || (tipo !== 'chofer' && tipo !== 'pasajero'))
    return res.status(400).json({ message: "Tipo de rol inválido" });

  try {
    let roleId;

    const existingRole = await pool.query(
      "SELECT id FROM roles WHERE user_id=$1 AND tipo=$2",
      [user_id, tipo]
    );

    if (existingRole.rows.length > 0) {
      roleId = existingRole.rows[0].id;
      await pool.query("UPDATE roles SET activo=true WHERE id=$1", [roleId]);
    } else {
      const insertRole = await pool.query(
        "INSERT INTO roles (user_id, tipo, activo, creado_en) VALUES ($1,$2,true,NOW()) RETURNING id",
        [user_id, tipo]
      );
      roleId = insertRole.rows[0].id;
    }

    // Datos de chofer
    if (tipo === "chofer" && data) {
      const { direccion, barrio, img_chofer, vehiculo, rutas } = data;

      let driverProfileId;
      const profileExist = await pool.query(
        "SELECT id FROM driver_profiles WHERE role_id=$1",
        [roleId]
      );

      if (profileExist.rows.length > 0) {
        driverProfileId = profileExist.rows[0].id;
        await pool.query(
          "UPDATE driver_profiles SET direccion=$1, barrio=$2, img_chofer=$3 WHERE role_id=$4",
          [direccion || null, barrio || null, img_chofer || null, roleId]
        );
      } else {
        const insertProfile = await pool.query(
          "INSERT INTO driver_profiles (role_id, direccion, barrio, img_chofer) VALUES ($1,$2,$3,$4) RETURNING id",
          [roleId, direccion, barrio, img_chofer]
        );
        driverProfileId = insertProfile.rows[0].id;
      }

      // Vehículo
      if (vehiculo && Object.keys(vehiculo).length > 0) {
        const { marca, modelo, color, matricula, plazas, img_vehiculo } = vehiculo;
        const vehicleExist = await pool.query(
          "SELECT id FROM vehicles WHERE driver_profile_id=$1",
          [driverProfileId]
        );

        if (vehicleExist.rows.length > 0) {
          await pool.query(
            `UPDATE vehicles
            SET marca=$1, modelo=$2, color=$3, matricula=$4, plazas=$5, img_vehiculo=$6
            WHERE driver_profile_id=$7`,
            [marca || null, modelo || null, color || null, matricula || null, plazas || null, img_vehiculo, driverProfileId]
          );
        } else {
          await pool.query(
            `INSERT INTO vehicles (driver_profile_id, marca, modelo, color, matricula, plazas, img_vehiculo)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [driverProfileId, marca, modelo, color, matricula, plazas, img_vehiculo]
          );
        }
      }

    // Rutas
      if (Array.isArray(rutas)) {
        await pool.query("DELETE FROM routes WHERE chofer_id = $1", [user_id]);

        for (const ruta of rutas) {
          const { origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso } = ruta;

          await pool.query(
            `INSERT INTO routes (chofer_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [user_id, origen || null, destino || null, dias || null, hora_salida || null, hora_llegada || null, hora_regreso || null, hora_llegada_regreso || null]
          );
        }
      }
    }

    // Datos de pasajero
  if (tipo === "pasajero" && data) {
    const { nacionalidad, barrio, img_pasajero, rutas } = data;

    let passengerProfileId;
    const profileExist = await pool.query(
      "SELECT id FROM passenger_profiles WHERE role_id=$1",
      [roleId]
    );

    if (profileExist.rows.length > 0) {
      passengerProfileId = profileExist.rows[0].id;
      await pool.query(
        "UPDATE passenger_profiles SET nacionalidad=$1, barrio=$2, img_pasajero=$3 WHERE id=$4",
        [nacionalidad || null, barrio || null, img_pasajero || null, passengerProfileId]
      );
    } else {
      const insertProfile = await pool.query(
        "INSERT INTO passenger_profiles (role_id, nacionalidad, barrio, img_pasajero) VALUES ($1,$2,$3,$4) RETURNING id",
        [roleId, nacionalidad || null, barrio || null, img_pasajero || null]
      );
      passengerProfileId = insertProfile.rows[0].id;
    }

    // Guardar rutas seleccionadas en route_passengers
    if (Array.isArray(rutas)) {
      await pool.query("DELETE FROM route_passengers WHERE pasajero_id = $1", [user_id]);

      for (const ruta of rutas) {
        const { origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso } = ruta;

        await pool.query(
          `INSERT INTO route_passengers 
          (pasajero_id, origen, destino, dias, hora_salida, hora_llegada, hora_regreso, hora_llegada_regreso)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [user_id, origen || null, destino || null, dias || null, hora_salida || null, hora_llegada || null, hora_regreso || null, hora_llegada_regreso || null]
        );
      }
    }
  }

    res.json({ message: "Rol activado correctamente", roleId });
  } catch (err) {
    console.error("Error al activar rol:", err.message, err.stack);
    res.status(500).json({ message: "Error interno al activar el rol", error: err.message,  stack: err.stack });
  }
});

// GET /roles/mis-roles
router.get('/mis-roles', auth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query(
      "SELECT id, tipo, activo FROM roles WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener roles");
  }
});

router.get('/:tipo', auth, async (req, res) => {
  try {
    const { tipo } = req.params;
    const role = await pool.query(
      "SELECT * FROM roles WHERE user_id = $1 AND tipo = $2",
      [req.user.id, tipo]
    );
    if (role.rows.length === 0) return res.status(404).send("Rol no encontrado");
    res.json(role.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener rol");
  }
});

// PUT /roles/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, direccion, barrio, img_chofer, vehiculo, nacionalidad, img_pasajero } = req.body;

    const roleRes = await pool.query(
      "SELECT * FROM roles WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (roleRes.rows.length === 0) {
      return res.status(404).send("Rol no encontrado");
    }

    // Actualizar según tipo
    if (tipo === "chofer") {
      const profileRes = await pool.query(
        "SELECT id FROM driver_profiles WHERE role_id = $1",
        [id]
      );

      let driverProfileId;
      if (profileRes.rows.length > 0) {
        driverProfileId = profileRes.rows[0].id;
        await pool.query(
          `UPDATE driver_profiles
           SET direccion=$1, barrio=$2, img_chofer=$3
           WHERE id=$4`,
          [direccion || null, barrio || null, img_chofer || null, driverProfileId]
        );
      } else {
        const insertProfile = await pool.query(
          `INSERT INTO driver_profiles (role_id, direccion, barrio, img_chofer)
           VALUES ($1,$2,$3,$4) RETURNING id`,
          [id, direccion || null, barrio || null, img_chofer || null]
        );
        driverProfileId = insertProfile.rows[0].id;
      }

      if (vehiculo) {
        const { marca, modelo, color, matricula, plazas, img_vehiculo } = vehiculo;

        const vehicleRes = await pool.query(
          "SELECT id FROM vehicles WHERE driver_profile_id = $1",
          [driverProfileId]
        );

        if (vehicleRes.rows.length > 0) {
          await pool.query(
            `UPDATE vehicles
             SET marca=$1, modelo=$2, color=$3, matricula=$4, plazas=$5, img_vehiculo=$6
             WHERE driver_profile_id=$7`,
            [marca, modelo, color, matricula, plazas, img_vehiculo, driverProfileId]
          );
        } else {
          await pool.query(
            `INSERT INTO vehicles (driver_profile_id, marca, modelo, color, matricula, plazas, img_vehiculo)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [driverProfileId, marca, modelo, color, matricula, plazas, img_vehiculo]
          );
        }
      }

      res.json({ message: "Perfil de chofer actualizado correctamente" });
    } else if (tipo === "pasajero") {
      const profileRes = await pool.query(
        "SELECT id FROM passenger_profiles WHERE role_id = $1",
        [id]
      );

      if (profileRes.rows.length > 0) {
        await pool.query(
          `UPDATE passenger_profiles
           SET nacionalidad=$1, barrio=$2, img_pasajero=$3
           WHERE id=$4`,
          [nacionalidad || null, barrio || null, img_pasajero || null, profileRes.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO passenger_profiles (role_id, nacionalidad, barrio, img_pasajero)
           VALUES ($1,$2,$3,$4)`,
          [id, nacionalidad || null, barrio || null, img_pasajero || null]
        );
      }

      res.json({ message: "Perfil de pasajero actualizado correctamente" });
    } else {
      return res.status(400).send("Tipo de rol no válido");
    }
  } catch (err) {
    console.error("Error al actualizar rol:", err);
    res.status(500).send("Error al actualizar rol");
  }
});

router.delete('/:tipo', auth, async (req, res) => {
  try {
    const { tipo } = req.params;
    await pool.query(
      "DELETE FROM roles WHERE user_id = $1 AND tipo = $2",
      [req.user.id, tipo]
    );
    res.send({ message: "Rol eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar rol");
  }
});



module.exports = router;