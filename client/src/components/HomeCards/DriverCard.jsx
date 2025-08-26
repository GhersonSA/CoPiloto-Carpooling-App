import React, { useEffect, useState } from "react";
import { BACKEND_URL } from '../../config';
import { useFetchData } from "../../hooks/useFetchData";

const DriverCard = ({ img, nombre, direccion, barrio, marca, modelo, color, matricula, plazas, imgVehiculo, origen, destino, dias, horaSalida, horaLlegada, horaRegreso, horaLlegadaRegreso, rutas = [], onClick }) => {

    const routes = useFetchData("routes");
    const drivers = useFetchData("drivers");
    const users = useFetchData("users");

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
                <div className="img-driver-cards-container">
                    <img src={img} alt={user?.nombre} className="img-home-cards"/>
                </div>
                <h2 className="text-4xl text-blue-950 font-bold mb-2 mt-6">{user ? (user.nombre || user.username) : "Cargando..."}</h2>
                {direccion && <span className="text-xl text-gray-700"><strong className="text-blue-950">Dirección:</strong> {direccion} →</span>}
                {barrio && <span className="text-xl text-gray-700"><strong className="text-blue-950"> Barrio:</strong> {barrio}</span>}



                {routes.length > 0 && (
                    <div className="mt-4">
                        {routes.map((ruta, i) => (
                            <div key={i} className="border-t border-gray-300 mt-2 pt-2">
                                <p className="text-xl text-gray-700"><strong className="text-blue-950">Ruta:</strong> {ruta.origen} - {ruta.destino}</p>
                                <p className="text-xl text-gray-700"><strong className="text-blue-950">Días:</strong> {ruta.dias}</p>
                                <p className="mt-1 text-xl text-gray-600">
                                    <strong className="text-blue-950">Salida:</strong> {ruta.hora_salida || "-"} → {ruta.hora_llegada || "-"} <br />
                                    <strong className="text-blue-950">Regreso:</strong> {ruta.hora_regreso || "-"} → {ruta.hora_llegada_regreso || "-"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverCard;