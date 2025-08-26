import React, { useEffect, useState } from "react";
import { useFetchData } from "../../hooks/useFetchData";

const PassengerCard = ({ img, onClick, nombre, direccion, nacionalidad, trabajo, rutas = [] }) => {

  const BACKEND_URL = "http://localhost:1234";

  const users = useFetchData("users");
  const routePassengers = useFetchData("routePassengers");

  const [user, setUser] = useState(null);

  // Traer usuario logeado
  useEffect(() => {
      const fetchUser = async () => {
      try {
          const res = await fetch(`${BACKEND_URL}/me`, {
          method: "GET",
          credentials: "include",
          });

          if (!res.ok) throw new Error("Error al obtener usuario logeado");
          const data = await res.json();
          setUser(data);
      } catch (err) {
          console.error(err.message);
      }
      };

      fetchUser();
  }, []);

  return (
    <div onClick={onClick} className="cursor-pointer">
      <div className="home-cards">
        <div className="img-home-cards-container">
          <img src={img} alt={user?.nombre} className="img-home-cards" />
        </div>
        <div className="home-card-content">
          <h2 className="text-4xl text-blue-950 font-bold mb-2 mt-6">{user ? (user.nombre || user.username) : "Cargando..."}</h2>
          <p className="text-xl text-gray-700"><strong className="text-blue-950">Nacionalidad:</strong> {nacionalidad}</p>
          <p className="text-xl text-gray-700"><strong className="text-blue-950"> Barrio:</strong> {direccion}</p>

          {routePassengers.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-blue-900">Rutas:</h3>
              {routePassengers.map((ruta, i) => (
                <div key={i} className="border-t border-gray-300 mt-2 pt-2">
                  <p className="text-xl text-gray-700">
                    <strong>Ruta:</strong> {ruta.origen} - {ruta.destino}
                  </p>
                  {routePassengers.dias && (
                    <p className="text-xl text-gray-700">
                      <strong>Días:</strong> {Array.isArray(ruta.dias) ? ruta.dias.join(", ") : ruta.dias}
                    </p>
                  )}
                  <p className="mt-1 text-xl text-gray-600">
                    <strong>Salida:</strong> {ruta.hora_salida || "-"} → {ruta.hora_llegada || "-"} <br />
                    <strong>Regreso:</strong> {ruta.hora_regreso || "-"} → {ruta.hora_llegada_regreso || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerCard;