import PassengerCard from "../HomeCards/PassengerCard";
import { useFetchData } from "../../hooks/useFetchData";

const PassengerSection = ({ passengers, abrirModal, busqueda = "" }) => {

    const users = useFetchData("users");
    const passengerProfiles = useFetchData("passengerProfiles");
    const routePassengers = useFetchData("routePassengers");

    const normalizeText = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const query = normalizeText(busqueda);

    const filtrados = passengers.filter((passenger) => {
        const nombreMatch = normalizeText(passenger.nombre).includes(query);
        const direccionMatch = normalizeText(passenger.direccion).includes(query);
        const rutasMatch = routePassengers?.some(rp =>
            normalizeText(rp.origen).includes(query) ||
            normalizeText(rp.destino).includes(query)
        );
        return nombreMatch || direccionMatch || rutasMatch;
    });

    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-5 m-5">
            {filtrados.length === 0 ? (
                <p className="text-gray-500 text-xl italic">No se encontraron choferes</p>
            ) : (
                filtrados.map((passenger) => {

                    const passengerRoutes = routePassengers.filter(rp => rp.passenger_profile_id === passenger.id);

                    return (
                        <PassengerCard
                            key={passenger.id}
                            img={passenger.img_pasajero}
                            nombre={passenger.nombre || passenger.username}
                            nacionalidad={passenger.nacionalidad || "Desconocida"}
                            direccion={passenger.barrio}
                            trabajo={passenger.trabajo}
                            rutas={passengerRoutes}
                            onClick={() => abrirModal("pasajero", passenger)}
                        />
                    );
                })
            )}
        </div>
    );
};

export default PassengerSection;