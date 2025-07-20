import PassengerCard from "../HomeCards/PassengerCard";

const PassengerSection = ({ passengers, abrirModal, busqueda }) => {
    const normalizeText = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const query = normalizeText(busqueda);

    const filtrados = passengers.filter((passenger) =>
        normalizeText(passenger.nombre).includes(query) ||
        normalizeText(passenger.direccion).includes(query) ||
        normalizeText(passenger.trabajo).includes(query)
    );

    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-5 m-5">
            {filtrados.length === 0 ? (
                <p className="text-gray-500 text-xl italic">
                    No se encontraron pasajeros
                </p>
            ) :
            (filtrados.map((passenger) => (
                <PassengerCard
                    key={passenger.id}
                    img={passenger.img}
                    nombre={passenger.nombre}
                    direccion={passenger.direccion}
                    trabajo={passenger.trabajo}
                    onClick={() => abrirModal("pasajero", passenger)} 
                />
            ))
        )}
        </div>
    );
};

export default PassengerSection;