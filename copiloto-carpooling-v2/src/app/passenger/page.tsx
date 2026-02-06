'use client';

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useFetchData } from "@/hooks/useFetchData";
import { useToast } from "@/components/Toast";
import { useGuest } from "@/hooks/useGuest";

export default function Passenger() {
    const { isGuest } = useGuest();
    const passengers = useFetchData('passengers');
    const payments = useFetchData('payments');
    const toast = useToast();

    const [busqueda, setBusqueda] = useState("");
    const [ordenPagos, setOrdenPagos] = useState("recientes");
    const [monthPayments, setMonthPayments] = useState<Record<string, any[]>>({});

    const [createPassengerModal, setCreatePassengerModal] = useState(false);
    const [editPassengerModal, setEditPassengerModal] = useState(false);
    const [addPaymentModal, setAddPaymentModal] = useState(false);
    const [editPaymentModal, setEditPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const [formPassenger, setFormPassenger] = useState({ nombre: "", nacionalidad: "", barrio: "", img: "" });
    const [formPayment, setFormPayment] = useState([{ fecha: "", pago: "", estado: "pendiente" }]);

    // Modal para ver pasajero
    const [modalPassenger, setModalPassenger] = useState<any>(null);
    const modalRef = useRef<HTMLDialogElement>(null);
    const addModalRef = useRef<HTMLDialogElement>(null);

    // Abrir modal detalles pasajero
    const abrirModal = (passenger: any) => {
        setModalPassenger(passenger);
        modalRef.current?.showModal();
    };

    // Cerrar modal detalles pasajero
    const cerrarModal = () => {
        setEditPassengerModal(false);
        setAddPaymentModal(false);
        setEditPaymentModal(false);
        modalRef.current?.close();
        setModalPassenger(null);
    };

    // Abrir modal añadir pasajero
    const abrirAddModal = () => {
        setCreatePassengerModal(true);
        setFormPassenger({ nombre: "", nacionalidad: "", barrio: "", img: "" });
        setFormPayment([{ fecha: "", pago: "", estado: "pendiente" }]);
        addModalRef.current?.showModal();
    };

    // Cerrar modal añadir pasajero
    const cerrarAddModal = () => {
        setCreatePassengerModal(false);
        addModalRef.current?.close();
    };

    const filteredPassengers = busqueda
        ? passengers.filter(p =>
            (p.nombre?.toLowerCase() || '').includes(busqueda) ||
            (p.username?.toLowerCase() || '').includes(busqueda) ||
            (p.nacionalidad?.toLowerCase() || '').includes(busqueda) ||
            (p.barrio?.toLowerCase() || '').includes(busqueda)
        )
        : passengers;

    const getDate = (passengerPayments: any[]) => {
        if (!passengerPayments || passengerPayments.length === 0) return null;
        const sorted = [...passengerPayments].sort((a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        return sorted[0].fecha;
    };

    function formatDateLocal(dateString: string) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const getTotalPayments = (id: number) => {
        const passengerPayments = payments.filter(p =>
            Number(p.pasajero_id) === id
        );
        return passengerPayments.reduce((acc, curr) => acc + Number(curr.pago || 0), 0);
    };

    const getPassengerPayments = (id: number) => {
        return payments.filter(p => Number(p.pasajero_id) === id);
    };

    useEffect(() => {
        if (modalPassenger) {
            const passengerPayments = getPassengerPayments(modalPassenger.id);
            const grouped: Record<string, any[]> = {};

            passengerPayments.forEach(pago => {
                const fecha = new Date(pago.fecha);
                const mes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                if (!grouped[mes]) grouped[mes] = [];
                grouped[mes].push(pago);
            });

            Object.keys(grouped).forEach(mes => {
                grouped[mes].sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();
                    return ordenPagos === "recientes" ? dateB - dateA : dateA - dateB;
                });
            });

            setMonthPayments(grouped);
        }
    }, [modalPassenger, ordenPagos, payments]);

    const handleCreatePassenger = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const passengerRes = await fetch('/api/passengers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formPassenger),
            });

            if (!passengerRes.ok) throw new Error('Error al crear pasajero');

            const newPassenger = await passengerRes.json();

            for (const pago of formPayment) {
                if (pago.fecha && pago.pago) {
                    const pagoRes = await fetch('/api/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pasajero_id: newPassenger.id,
                            ...pago,
                            pago: Number(pago.pago),
                        }),
                    });

                    if (!pagoRes.ok) {
                        console.error("Error creando pago:", await pagoRes.json());
                    }
                }
            }

            toast.success('Pasajero creado exitosamente');
            cerrarAddModal();
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al crear pasajero');
        }
    };

    const addPaymentRow = () => {
        setFormPayment(prev => [
            ...prev,
            { fecha: "", pago: "", estado: "pendiente" }
        ]);
    };

    const handleEditPassenger = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/passengers/${modalPassenger.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formPassenger),
            });

            if (!res.ok) throw new Error('Error al actualizar pasajero');

            toast.success('Pasajero actualizado exitosamente');
            setEditPassengerModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al actualizar pasajero');
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalPassenger || !modalPassenger.id) {
            toast.error('No se ha seleccionado un pasajero válido');
            return;
        }
        try {
            for (const pago of formPayment) {
                if (pago.fecha && pago.pago) {
                    const res = await fetch('/api/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pasajero_id: modalPassenger.id,
                            ...pago,
                            pago: Number(pago.pago),
                        }),
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error("Error creando pago:", errorData);
                        throw new Error(errorData.message || 'Error al crear pago');
                    }
                }
            }
            toast.success('Pagos añadidos exitosamente');
            setAddPaymentModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al añadir pagos');
        }
    };

    const handleEditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { fecha, pago, estado } = selectedPayment;
            const res = await fetch(`/api/payments/${selectedPayment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha, pago, estado }),
            });

            if (!res.ok) throw new Error('Error al actualizar pago');

            toast.success('Pago actualizado exitosamente');
            setEditPaymentModal(false);

            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al actualizar pago');
        }
    };

    const handleDeletePassenger = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este pasajero?')) return;

        try {
            const res = await fetch(`/api/passengers/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error al eliminar pasajero');

            toast.success('Pasajero eliminado exitosamente');
            cerrarModal();
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar pasajero');
        }
    };

    const handleDeletePayment = async () => {
        if (!confirm('¿Estás seguro de eliminar este pago?')) return;

        try {
            const res = await fetch(`/api/payments/${selectedPayment.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error al eliminar pago');

            toast.success('Pago eliminado exitosamente');
            setEditPaymentModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar pago');
        }
    };

    const handlePaymentChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormPayment(prev => prev.map((pago, i) => i === idx ? { ...pago, [name]: value } : pago));
    };


    return (
        <section className="section-container">
            <h2 className="section-h2">Pasajeros</h2>
            {isGuest && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-5 rounded">
                    <p className="font-semibold">
                        Modo Invitado - Solo puedes visualizar. Regístrate para crear y editar.
                    </p>
                </div>
            )}
            <div className="flex justify-center sm:justify-start items-center m-5">
                <input
                    type="text"
                    placeholder="Buscar por pasajero, nacionalidad, barrio..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value.toLowerCase())}
                    className="bg-gray-50 h-20 w-70 mr-2 sm:mr-0 sm:w-250 text-2xl rounded-2xl p-5 border border-blue-950"
                />
                <button
                    className={`btn-add bg-blue-500 h-20 w-50 font-bold rounded-xl text-white cursor-pointer sm:ml-5 shadow-md ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={!isGuest ? abrirAddModal : undefined}
                    disabled={isGuest}
                    title={isGuest ? 'Regístrate para añadir pasajeros' : ''}
                >
                    <i className="fa-solid fa-user-plus"></i> Añadir Pasajero
                </button>
            </div>
            <div className="flex justify-center items-center m-5">
                <table className="w-full text-center border-collapse sm:text-2xl">
                    <thead className="bg-blue-950 h-25 font-bold text-white">
                        <tr className="table-border">
                            <td className="w-20 sm:w-30 md:w-40">Nº</td>
                            <td className="table-border">Nombre</td>
                            <td className="table-border hidden sm:table-cell">Nacionalidad</td>
                            <td className="table-border">Dirección</td>
                            <td className="table-border hidden sm:table-cell">Fecha</td>
                            <td className="table-border">Importe</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody className="bg-[#eff9ff]">
                        {filteredPassengers.map((p, idx) => {
                            const passengerPayments = getPassengerPayments(p.id);
                            const lastDate = getDate(passengerPayments);

                            return (
                                <tr key={p.id} className="table-border h-25 hover:bg-blue-100">
                                    <td>{idx + 1}</td>
                                    <td>{p.nombre}</td>
                                    <td className="hidden sm:table-cell">{p.nacionalidad}</td>
                                    <td>{p.barrio}</td>
                                    <td className="hidden sm:table-cell">
                                        {lastDate ? new Date(lastDate).toLocaleDateString("es-ES") : 'N/A'}
                                    </td>
                                    <td>{getTotalPayments(p.id).toFixed(2)}€</td>
                                    <td>
                                        <button
                                            className="text-blue-950 font-bold cursor-pointer"
                                            onClick={() => abrirModal(p)}>
                                            Ver más
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Modal detalles pasajero */}
            <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                {modalPassenger && !editPassengerModal && !addPaymentModal && !editPaymentModal && (
                    <>
                        <div className="flex justify-center items-center gap-5 mt-20">
                            <div>
                                <Image
                                    src={modalPassenger.img || "https://cdn-icons-png.flaticon.com/512/5580/5580993.png"}
                                    alt={modalPassenger.nombre || modalPassenger.username || "Pasajero"}
                                    width={100}
                                    height={100}
                                    className="rounded-4xl"
                                />
                            </div>
                            <div>
                                <h2 className="text-blue-950 text-2xl sm:text-3xl font-bold">{modalPassenger.nombre}</h2>
                                <p className="passenger-moda-p"><strong>Nacionalidad:</strong> {modalPassenger.nacionalidad}</p>
                                <p className="passenger-modal-p"><strong>Barrio:</strong> {modalPassenger.barrio}</p>
                                <p className="passenger-modal-p">
                                    <strong>Fecha:</strong>
                                    {(() => {
                                        const passengerPayments = getPassengerPayments(modalPassenger.id);
                                        const lastDate = getDate(passengerPayments);
                                        return lastDate ? new Date(lastDate).toLocaleDateString("es-ES") : "N/A";
                                    })()}
                                </p>
                                <p className="passenger-modal-p"><strong>Importe total:</strong> {getTotalPayments(modalPassenger.id)}€</p>
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-5 mt-10">
                            <button onClick={() => { setEditPassengerModal(true); setFormPassenger(modalPassenger); }} className="bg-yellow-400 p-3 rounded-xl font-medium text-xl text-white shadow-md"><i className="fa-solid fa-pen-to-square"></i> Editar Pasajero</button>
                            <button onClick={() => { setAddPaymentModal(true); setFormPayment([{ fecha: "", pago: "", estado: "pendiente" }]); }} className="bg-lime-400 p-3 rounded-xl font-medium text-xl text-white shadow-md"><i className="fa-solid fa-money-check-dollar"></i> Añadir Pago</button>
                            <button onClick={() => handleDeletePassenger(modalPassenger.id)} className="bg-red-500 p-3 rounded-xl font-medium text-xl text-white shadow-md"><i className="fa-solid fa-trash-can"></i> Eliminar Pasajero</button>
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
                                        <div key={index} onClick={() => { setSelectedPayment(pago); setEditPaymentModal(true); }} className={`flex flex-col justify-center items-center w-30 h-20 text-blue-50 rounded transition-colors duration-300 ${pago.estado === "completado" ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"}`} title={`${pago.fecha} - ${pago.pago}€ - ${pago.estado}`} >
                                            <p className="text-sm font-semibold">{new Date(pago.fecha).toLocaleDateString()}</p>
                                            <p className="font-bold text-2xl">{Number(pago.pago).toFixed(2)}€</p>
                                            <p className="text-xs">{pago.estado}</p> {/* Quitar */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Modal Editar Pasajero */}
                {editPassengerModal && (
                    <>
                        <div className="flex flex-col justify-center items-center gap-5 mt-5">
                            <h2 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">Editar Pasajero</h2>
                            <form onSubmit={handleEditPassenger}>
                                <div className="mt-5 flex flex-col gap-2">
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Nombre: </span></label>
                                    <input value={formPassenger.nombre} onChange={(e) => setFormPassenger({ ...formPassenger, nombre: e.target.value })} className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Nacionalidad: </span></label>
                                    <input value={formPassenger.nacionalidad} onChange={(e) => setFormPassenger({ ...formPassenger, nacionalidad: e.target.value })} className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Dirección: </span></label>
                                    <input value={formPassenger.barrio} onChange={(e) => setFormPassenger({ ...formPassenger, barrio: e.target.value })} className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Img: </span></label>
                                    <input value={formPassenger.img} onChange={(e) => setFormPassenger({ ...formPassenger, img: e.target.value })} className="form-input-login mt-2 mb-5" />
                                </div>

                                <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-5">
                                    <button type="submit" className="bg-blue-950 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md">Guardar</button>
                                    <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={() => setEditPassengerModal(false)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* Modal Añadir Pago */}
                {addPaymentModal && (
                    <>
                        <div className="flex flex-col justify-center items-center gap-5 mt-10">
                            <h2 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">Añadir Pagos</h2>
                            <form onSubmit={handleAddPayment}>
                                {Array.isArray(formPayment) &&
                                    formPayment.map((pago, idx) => (
                                        <div key={idx} className="mt-5 flex flex-col gap-2">
                                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Fecha: </span></label>
                                            <input type="date" name="fecha" value={pago.fecha} onChange={(e) => handlePaymentChange(idx, e)} className="form-input-login mt-2" />
                                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                            <input type="number" step="0.01" name="pago" value={pago.pago} onChange={(e) => handlePaymentChange(idx, e)} className="form-input-login mt-2" />
                                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                            <select name="estado" value={pago.estado} onChange={(e) => handlePaymentChange(idx, e)} className="form-input-login mt-2 mb-10">
                                                <option value="pendiente">Pendiente</option>
                                                <option value="completado">Completado</option>
                                            </select>
                                        </div>
                                    ))}

                                <button type="button" className="bg-lime-400 w-110 sm:w-140 mx-auto mt-5 h-12 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md" onClick={addPaymentRow}>Añadir Pago</button>

                                <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-5">
                                    <button type="submit" className="bg-blue-950 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md">Guardar</button>
                                    <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={() => setAddPaymentModal(false)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* Modal Editar Pago */}
                {editPaymentModal && selectedPayment && (
                    <>
                        <div className="flex flex-col justify-center items-center gap-5 mt-10">
                            <h2 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">Editar Pago</h2>
                            <form onSubmit={handleEditPayment}>
                                <div className="mt-5 flex flex-col gap-2">
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Fecha: </span></label>
                                    <input type="date" value={selectedPayment.fecha ? formatDateLocal(selectedPayment.fecha) : ""} onChange={(e) => setSelectedPayment({ ...selectedPayment, fecha: e.target.value })} className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                    <input type="number" value={selectedPayment.pago} onChange={(e) => setSelectedPayment({ ...selectedPayment, pago: e.target.value })} className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                    <select value={selectedPayment.estado} onChange={(e) => setSelectedPayment({ ...selectedPayment, estado: e.target.value })} className="form-input-login mt-2 mb-10">
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completado">Completado</option>
                                    </select>

                                    <button type="button" className="bg-red-500 w-110 sm:w-140 mx-auto mt-5 h-12 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md" onClick={handleDeletePayment} >Eliminar Pago </button>

                                    <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-5">
                                        <button type="submit" className="bg-blue-950 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md">Guardar</button>
                                        <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={() => setEditPaymentModal(false)}>Cancelar</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                <button onClick={cerrarModal} className="absolute top-4 right-4 text-6xl text-gray-400 hover:text-gray-600 active:text-primary cursor-pointer">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </dialog>
            {/* Modal añadir pasajero */}
            <dialog ref={addModalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                {createPassengerModal && (
                    <>
                        <h3 className="text-blue-950 text-5xl font-semibold mt-20 sm:ml-5">Añadir Pasajero</h3>
                        <form onSubmit={handleCreatePassenger} className="mt-10 flex flex-col justify-center gap-2">
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Nombre:</span><span className="text-red-600">*</span></label>
                            <input type="text" name="nombre" value={formPassenger.nombre} onChange={(e) => setFormPassenger({ ...formPassenger, nombre: e.target.value })} className="form-input-login mt-2" required />

                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Nacionalidad:</span></label>
                            <input type="text" name="nacionalidad" value={formPassenger.nacionalidad} onChange={(e) => setFormPassenger({ ...formPassenger, nacionalidad: e.target.value })} className="form-input-login mt-2" />
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Barrio:</span></label>
                            <input type="text" name="barrio" value={formPassenger.barrio} onChange={(e) => setFormPassenger({ ...formPassenger, barrio: e.target.value })} className="form-input-login mt-2" />
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Imagen (URL):</span></label>
                            <input type="text" name="img" value={formPassenger.img} onChange={(e) => setFormPassenger({ ...formPassenger, img: e.target.value })} className="form-input-login mt-2" />

                            <h4 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">Pagos (opcional)</h4>
                            {formPayment.map((pago, idx) => (
                                <div key={idx} className="mt-5 flex flex-col gap-2">
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Fecha: </span></label>
                                    <input type="date" name="fecha" value={pago.fecha} onChange={e => handlePaymentChange(idx, e)} placeholder="Fecha" className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                    <input type="number" step="0.01" name="pago" value={pago.pago} onChange={e => handlePaymentChange(idx, e)} placeholder="Importe" className="form-input-login mt-2" />
                                    <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                    <select name="estado" value={pago.estado} onChange={e => handlePaymentChange(idx, e)} className="form-input-login mt-2" >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completado">Completado</option>
                                    </select>
                                </div>
                            ))}
                            <button type="button" className="bg-lime-400 w-110 sm:w-140 mx-auto mt-5 h-12 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md" onClick={addPaymentRow}>Añadir Pago</button>

                            <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-5">
                                <button type="submit" className="bg-blue-950 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md">Crear</button>
                                <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={cerrarAddModal}>Cancelar</button>
                            </div>
                        </form>
                        <button onClick={cerrarAddModal} className="absolute top-4 right-4 text-6xl text-gray-400 hover:text-gray-600 active:text-primary cursor-pointer">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </>
                )}
            </dialog>
        </section>
    );
}