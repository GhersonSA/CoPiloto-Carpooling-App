'use client';

import { useState, useMemo } from "react";
import { useFetchData } from "@/hooks/useFetchData";

const Payments = () => {
    const passengers = useFetchData('passengers');
    const payments = useFetchData('payments');

    const [filterStatus, setFilterStatus] = useState("Todos");
    const [order, setOrder] = useState("recientes");

    function cutName(nombreCompleto: string) {
        const partes = nombreCompleto.split(" ");
        if (partes.length === 1) return partes[0];
        return `${partes[0]} ${partes[1][0].toUpperCase()}`;
    }

    const filteredPayments = useMemo(() => {
        if (!payments || !passengers) return [];

        return payments
            .filter(pago => {
                if (filterStatus === "Todos") return true;
                if (filterStatus === "Pagado") return pago.estado === "completado";
                if (filterStatus === "Pendiente") return pago.estado === "pendiente";
                return true;
            })
            .sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                return order === "recientes" ? fechaB.getTime() - fechaA.getTime() : fechaA.getTime() - fechaB.getTime();
            });
    }, [payments, passengers, filterStatus, order]);

    return (
        <section className="section-container">
            <h2 className="section-h2 sm:mb-0">Pagos</h2>
            <div className="m-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mt-4 sm:mt-8 mb-4 gap-4">
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setFilterStatus("Todos")} className={`modal-button ${filterStatus === "Todos" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>Todos</button>
                        <button onClick={() => setFilterStatus("Pagado")} className={`modal-button ${filterStatus === "Pagado" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>Pagados</button>
                        <button onClick={() => setFilterStatus("Pendiente")} className={`modal-button ${filterStatus === "Pendiente" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>Pendientes</button>
                    </div>
                    <div className="flex justify-center sm:justify-end items-center w-full sm:w-auto gap-4">
                        <div className="flex justify-center items-center w-full max-w-120 sm:w-100 h-15 gap-4 rounded-lg font-secondary">
                            <button onClick={() => setOrder("recientes")} className={`modal-button ${order === "recientes" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                                Recientes
                            </button>
                            <button onClick={() => setOrder("antiguos")} className={`modal-button ${order === "antiguos" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                                Antiguos
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg">
                    <table className="w-full text-center border-collapse sm:text-xl lg:text-2xl">
                        <thead className="h-20 font-bold">
                            <tr>
                                <td className="w-20 sm:w-30 md:w-40">ID</td>
                                <td>Nombre</td>
                                <td className="hidden sm:table-cell">Dirección</td>
                                <td>Fecha</td>
                                <td>Importe</td>
                                <td>Estado</td>
                            </tr>
                        </thead>
                        <tbody className="min-h-table">
                            {filteredPayments?.map((pago, index) => {
                                const pasajero = passengers?.find(pass => pass.id === pago.pasajero_id);
                                if (!pasajero) return null;

                                return (
                                    <tr key={index} className="h-20 hover:bg-gray-200">
                                        <td>{pago.id}</td>
                                        <td>{cutName(pasajero.nombre)}</td>
                                        <td className="hidden sm:table-cell text-gray-500">{pasajero.barrio}</td>
                                        <td className="text-gray-500">{pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-ES") : 'N/A'}</td>
                                        <td>{(pago.pago)}€</td>
                                        <td>
                                            <span className={`${pago.estado === "completado" ? "bg-green-400 text-green-100" : "bg-red-400 text-red-100"} px-3 py-2 rounded-xl`}>
                                                {pago.estado === "completado" ? "Pagado" : "Pendiente"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default Payments;