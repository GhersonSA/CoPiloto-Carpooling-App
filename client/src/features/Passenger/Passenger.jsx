import { useState, useRef } from 'react';
import { useRoleData } from '../../hooks/useRoleData';

const Passenger = () => {

    const { passengers, payments } = useRoleData();

    const getDate = (passengerId) => {
        const payment = payments.find(payment => payment.pasajeroId === passengerId);
        if (!payment || payment.pagos.length === 0) return null;

        const date = [...payment.pagos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
        return date;
    }

    const getTotalPayments = (passengerId) => {
        const payment = payments.find(payment => payment.pasajeroId === passengerId);
        if(!payment || payment.pagos.length === 0) return 0;

        return payment.pagos.reduce((total, pago) => total + pago.pago, 0);
    }

    const [modalData, setModalData] = useState(null);
    const modalRef = useRef(null);

    const abrirModal = (passenger) => {
        setModalData(passenger);
        modalRef.current?.showModal();
    };

    const cerrarModal = () => {
        modalRef.current?.close();
        setModalData(null);
    };

    const [ordenPagos, setOrdenPagos] = useState("recientes");

    const orderedPayments = modalData? payments.find(p => p.pasajeroId === modalData.id)?.pagos
        .slice()
        .sort((a, b) => ordenPagos === "recientes"
            ? new Date(b.fecha) - new Date(a.fecha)
            : new Date(a.fecha) - new Date(b.fecha)
        ) : [];

    const monthPayments = orderedPayments?.reduce((acc, pago) => {
        const fechaObj = new Date(pago.fecha);
        const mes = fechaObj.toLocaleDateString("es-ES", { month: "long" });
        const year = fechaObj.getFullYear();
        const clave = `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${year}`;

        if (!acc[clave]) acc[clave] = [];
        acc[clave].push(pago);
        return acc;
    }, {});

    return (
        <section className="section-container">
            <h2 className="section-h2">Pasajeros</h2>
            <div className="flex justify-center items-center m-5">
                <table className="w-full text-center border-collapse sm:text-2xl">
                    <thead className="bg-blue-950 h-25 font-bold text-white">
                        <tr className="table-border">
                            <td className="w-20 sm:w-30 md:w-40">ID</td>
                            <td className="table-border">Nombre</td>
                            <td className="table-border hidden sm:table-cell">Nacionalidad</td>
                            <td className="table-border ">Dirección</td>
                            <td className="table-border hidden sm:table-cell">Fecha</td>
                            <td className="table-border">Importe</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody className="bg-[#eff9ff]">
                        {passengers.map((passenger) => {
                            const date = getDate(passenger.id);
                            return (
                                <tr key={passenger.id} className="table-border h-25 hover:bg-blue-100">
                                    <td>{passenger.id}</td>
                                    <td>{passenger.nombre}</td>
                                    <td className="hidden sm:table-cell">{passenger.nacionalidad}</td>
                                    <td>{passenger.direccion}</td>
                                    <td className="hidden sm:table-cell">{date ? date.fecha : 'N/A'} </td>
                                    <td>{getTotalPayments(passenger.id)}€</td>
                                    <td className="text-blue-950 font-bold cursor-pointer">
                                        <button onClick={() => abrirModal(passenger)} className="cursor-pointer">
                                            Ver más
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                {modalData && (
                    <>
                        <div className="flex justify-center items-center gap-5 mt-20">
                            <div>
                                <img src={modalData.img} alt="" className="w-50 h-50 sm:w-60 sm:h-60 object-cover rounded-4xl" />
                            </div>
                            <div>
                                <h2 className="text-blue-950 text-2xl sm:text-3xl font-bold">{modalData.nombre}</h2>
                                <p className="passenger-modal-p"><strong>Nacionalidad:</strong> {modalData.nacionalidad} </p>
                                <p className="passenger-modal-p"><strong>Barrio:</strong> {modalData.barrio}</p>
                                <p className="passenger-modal-p"><strong>Fecha:</strong> {getDate(modalData.id)?.fecha || "N/A"} </p>
                                <p className="passenger-modal-p"><strong>Importe total:</strong> {getTotalPayments(modalData.id)}€</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-10">
                            <h3 className="text-blue-950 text-xl sm:text-2xl font-bold">Todos los pagos: </h3>
                            <div className="bg-gray-300 font-secondary">
                                <button onClick={() => setOrdenPagos("recientes")} className={`modal-button ${ordenPagos === "recientes" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                                    Recientes
                                </button>
                                <button onClick={() => setOrdenPagos("antiguos")} className={`modal-button ${ordenPagos === "antiguos" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                                    Antiguos
                                </button>
                            </div>
                        </div>
                        
                        {Object.entries(monthPayments).map(([mes, pagos]) => (
                            <div key={mes} className="mt-5 mb-5">
                                <h3 className="text-xl font-bold text-blue-950 mb-3">{mes}</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-5 mt-5">
                                    {pagos.map((pago, index) => (
                                        <div key={index} className={`flex flex-col justify-center items-center w-30 h-20 text-blue-50 rounded transition-colors duration-300 ${pago.estado === "Completado" ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"}`} title={`${pago.fecha} - ${pago.pago}€ - ${pago.estado}`} >
                                            <p className="text-sm font-semibold">{pago.fecha}</p>
                                            <p className="font-bold text-2xl">{pago.pago}€</p>
                                            <p className="text-xs">{pago.estado}</p> {/* Quitar */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </>
                )}

                <button onClick={cerrarModal} className="absolute top-4 right-4 text-6xl text-gray-400 hover:text-gray-600 active:text-primary cursor-pointer">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </dialog>
        </section>
    )
}

export default Passenger;