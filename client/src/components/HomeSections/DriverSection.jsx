import DriverCard from "../HomeCards/DriverCard";

const DriverSection = ({ drivers, routes, abrirModal, busqueda = "" }) => {
    const normalizeText = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const query = normalizeText(busqueda);

    const filtrados = drivers.filter((driver) => {
        const ruta = routes.find((r) => r.choferId === driver.id);

        return (
            normalizeText(driver.nombre).includes(query) ||
            normalizeText(driver?.vehiculo?.marca).includes(query) ||
            normalizeText(ruta?.origen).includes(query) ||
            normalizeText(ruta?.destino).includes(query)
        );
    });

    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-5 m-5">
            {filtrados.length === 0 ? (
                <p className="text-gray-500 text-xl italic">
                    No se encontraron choferes
                </p>
            ) :
            (filtrados.map((driver) => {
                const ruta = routes.find(r => r.choferId === driver.id);

                return (
                    <DriverCard
                        key={driver.id}
                        img={driver.img}
                        nombre={driver.nombre}
                        marca={driver.vehiculo.marca}
                        plazas={driver.vehiculo.plazas}
                        origen={ruta?.origen}
                        destino={ruta?.destino}
                        horaSalida={ruta?.horaSalida || "-"}
                        horaLlegada={ruta?.horaLlegada || "-"}
                        horaRegreso={ruta?.horaRegreso || "-"}
                        onClick={() => abrirModal("chofer", driver)}
                    />
                );
            })
        )}
        </div>
    );
};

export default DriverSection;