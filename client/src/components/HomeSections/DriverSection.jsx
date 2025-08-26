import DriverCard from "../HomeCards/DriverCard";
import { useFetchData } from "../../hooks/useFetchData";

const DriverSection = ({ drivers, abrirModal, busqueda = "" }) => {

    const routes = useFetchData("routes");

    const normalizeText = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = normalizeText(busqueda);

    const filtrados = drivers.filter((driver) => {
        const nombreMatch = normalizeText(driver.nombre).includes(query);
        const marcaMatch = normalizeText(driver?.vehiculo?.marca).includes(query);
        const rutasMatch = driver.routes?.some(route =>
            normalizeText(route.origen).includes(query) ||
            normalizeText(route.destino).includes(query)
        );
        return nombreMatch || marcaMatch || rutasMatch;
    });

    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-5 m-5">
            {filtrados.length === 0 ? (
                <p className="text-gray-500 text-xl italic">No se encontraron choferes</p>
            ) : (
                filtrados.map((driver) => {

                    const driverRoutes = routes.filter(route => route.driver_id === driver.id);

                    return (
                        <DriverCard
                            key={driver.id}
                            img={driver.img_chofer}
                            nombre={driver.nombre || driver.username}
                            direccion={driver.direccion}
                            barrio={driver.barrio}
                            marca={driver.vehiculo?.marca}
                            modelo={driver.vehiculo?.modelo}
                            color={driver.vehiculo?.color}
                            matricula={driver.vehiculo?.matricula}
                            plazas={driver.vehiculo?.plazas}
                            imgVehiculo={driver.vehiculo?.img_vehiculo}
                            rutas={driverRoutes}
                            onClick={() => abrirModal("chofer", driver)}
                        />
                    );
                })
            )}
        </div>
    );
};


export default DriverSection;