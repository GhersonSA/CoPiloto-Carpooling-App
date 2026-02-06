'use client';

import TripCard from "@/components/HomeCards/TripCard";
import { Trip } from "@/types/Trip";

interface Props {
    routes: Trip[];
    abrirModal: (tipo: string, data: any) => void;
    busqueda?: string;
}

const TripSection = ({ routes, abrirModal, busqueda = "" }: Props) => {
    const normalizeText = (text: string) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = normalizeText(busqueda);

    const filtrados = routes.filter((route) =>
        normalizeText(route.origen).includes(query) ||
        normalizeText(route.destino).includes(query)
    );

    return (
        <div className="flex flex-wrap justify-center lg:justify-start gap-5 m-5">
            {filtrados.length === 0 ? (
                <p className="text-gray-500 text-xl italic">
                    No se encontraron viajes
                </p>
            ) : (
                filtrados.map((route) => (
                    <TripCard
                        key={route.id}
                        img={route.img}
                        nombre={`${route.origen} - ${route.destino}`}
                        onClick={() => abrirModal("viaje", {
                            ...route,
                            horaSalida: route.hora_salida,
                            horaRegreso: route.hora_regreso
                        })}
                    />
                ))
            )}
        </div>
    );
}

export default TripSection;