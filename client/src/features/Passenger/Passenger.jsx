import { useState, useRef, useMemo, useEffect } from 'react';
import { BACKEND_URL } from '../../config';
import { useFetchData } from "../../hooks/useFetchData";

const Passenger = () => {

    const passengers = useFetchData("passengers");
    const payments = useFetchData("payments");
    const [paymentsData, setPaymentsData] = useState([]);

    const [passengersList, setPassengersList] = useState([]);

    useEffect(() => {
    if (passengers) setPassengersList(passengers);
    }, [passengers]);

    useEffect(() => {
    if (payments) setPaymentsData(payments);
    }, [payments]);

    const [ordenPagos, setOrdenPagos] = useState("recientes");

    const [createPassengerModal, setCreatePassengerModal] = useState(false);
    const [editPassengerModal, setEditPassengerModal] = useState(false);
    const [addPaymentModal, setAddPaymentModal] = useState(false);
    const [editPaymentModal, setEditPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [formPassenger, setFormPassenger] = useState({ nombre: "", nacionalidad: "", barrio: "", img: "" });
    const [formPayment, setFormPayment] = useState([{ fecha: "", pago: "", estado: "pendiente" }]);



    // Modal para ver pasajero
    const [modalPassenger, setModalPassenger] = useState(null);
    const modalRef = useRef(null); // dialog principal DETALLES PASAJERO
    const addModalRef = useRef(null); // dialog AÑADIR pasajero

    // Abrir modal de pasajero
    const abrirModal = (passenger) => {
        setModalPassenger(passenger);
        modalRef.current?.showModal();
    };

    // Cerrar modal de pasajero
    const cerrarModal = () => {
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

    // PASSENGER //

    // Crear pasajero
    const handleCreatePassenger = async (e) => {
        e.preventDefault();
        try {
        const res = await fetch(`${BACKEND_URL}/passengers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formPassenger),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Error creando pasajero");
        const newPassenger = await res.json();

        setPassengersList(prev => [...prev, newPassenger]);

        for (const pago of formPayment) {
            if (pago.fecha && pago.pago) {
                const resPago = await fetch(`${BACKEND_URL}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...pago, pasajero_id: newPassenger.id }),
                credentials: "include"
                });
                
                if (resPago.ok) {
                const newPayment = await resPago.json();

                setPaymentsData(prev => [...prev, newPayment]);
                }
            }
        }

        setFormPassenger({ nombre: "", nacionalidad: "", barrio: "", img: "" });
        setFormPayment([{ fecha: "", pago: "", estado: "pendiente" }]);
        cerrarAddModal();

        } catch (err) {
        alert(err.message);
        }
    };

    // Editar pasajero
    const handleEditPassenger = async (e) => {
        e.preventDefault();
        try {
        const res = await fetch(`${BACKEND_URL}/passengers/${formPassenger.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formPassenger),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Error editando pasajero");
        const updated = await res.json();
        setPassengersList(prev => prev.map(p => p.id === updated.id ? updated : p));
        setModalPassenger(updated);
        setEditPassengerModal(false);
        } catch (err) {
        alert(err.message);
        }
    };

    // Eliminar pasajero
    const handleDeletePassenger = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este pasajero?")) return;
        try {
        const res = await fetch(`${BACKEND_URL}/passengers/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error("Error eliminando pasajero");
        setPassengersList(prev => prev.filter(p => p.id !== id));
        setModalPassenger(null);
        cerrarModal();
        } catch (err) {
        alert(err.message);
        }
    };

    // PAYMENTS //

    // --- Añadir fila de pago extra ---
    const addPaymentRow = () => {
        setFormPayment((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { fecha: "", pago: "", estado: "pendiente" },
        ]);
    };

    // Añadir pago
    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
        const res = await fetch(`${BACKEND_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formPayment[0], pasajero_id: modalPassenger.id }),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Error al añadir pago");
        const newPayment = await res.json();
        setPaymentsData(prev => [...prev, newPayment]);
        setAddPaymentModal(false);
        } catch (err) {
        alert(err.message);
        }
    };

    // Editar pago
    const handleEditPayment = async (e) => {
        e.preventDefault();
        try {
        const res = await fetch(`${BACKEND_URL}/payments/${selectedPayment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fecha: selectedPayment.fecha,
                pago: selectedPayment.pago,
                estado: selectedPayment.estado,
            }),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Error al editar pago");
        const updated = await res.json();
        setPaymentsData(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditPaymentModal(false);
        } catch (err) {
        alert(err.message);
        }
    };

    // Eliminar pago
    const handleDeletePayment = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar este pago?")) return;

        try {
            const res = await fetch(`${BACKEND_URL}/payments/${selectedPayment.id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error("Error al eliminar pago");

            setPaymentsData(prev => prev.filter(p => p.id !== selectedPayment.id));
            setEditPaymentModal(false);
        } catch (err) {
            alert(err.message);
        }
    };

    // Helpers
    const getTotalPayments = (passengerId) =>
        paymentsData
        .filter(p => p.pasajero_id === passengerId)
        .reduce((acc, curr) => acc + Number(curr.pago), 0)
        .toFixed(2);

    // --- Manejo inputs pagos ---
    const handlePaymentChange = (index, e) => {
        const { name, value } = e.target;
        const updatedPayments = [...formPayment];
        updatedPayments[index][name] = value;
        setFormPayment(updatedPayments);
    };

    const monthPayments = useMemo(() => {
        if (!modalPassenger) return {};

        const pagosDelPasajero = paymentsData.filter(p => p.pasajero_id === modalPassenger.id);
        if (pagosDelPasajero.length === 0) return {};

        const pagosOrdenados = [...pagosDelPasajero].sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return ordenPagos === "recientes" ? fechaB - fechaA : fechaA - fechaB;
        });

        const agrupados = pagosOrdenados.reduce((acc, pago) => {
            const dateObj = new Date(pago.fecha);
            const mesAnio = dateObj.toLocaleString("es-ES", { month: "long", year: "numeric" });
            if (!acc[mesAnio]) acc[mesAnio] = [];
            acc[mesAnio].push(pago);
            return acc;
        }, {});

        return agrupados;

    }, [modalPassenger, paymentsData, ordenPagos]);

    const getDate = (passengerId) => {
        const pagosDelPasajero = paymentsData.filter(p => p.pasajero_id === passengerId);
        if (pagosDelPasajero.length === 0) return null;

        const fecha = [...pagosDelPasajero].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
        return fecha;
    };

    const normalizeDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().split("T")[0];
    };

    /* SEARCH BAR PASAJEROS */

    const [busqueda, setBusqueda] = useState("");

    const filteredPassengers = useMemo(() => {
    if (!busqueda) return passengersList;

    return passengersList.filter(passenger => {

        const matchPassenger =
            passenger.id.toString().includes(busqueda) ||
            passenger.nombre.toLowerCase().includes(busqueda) ||
            passenger.nacionalidad.toLowerCase().includes(busqueda) ||
            passenger.barrio.toLowerCase().includes(busqueda);

        const totalPagos = Number(getTotalPayments(passenger.id)) || 0;
        const matchPayments = totalPagos.toFixed(2).includes(busqueda);

        return matchPassenger || matchPayments;
    });
    }, [busqueda, passengersList, paymentsData, getTotalPayments]);
    /* */


    return (
        <section className="section-container">
            <h2 className="section-h2">Pasajeros</h2>
            <div className='flex justify-center sm:justify-start items-center m-5'>
                <input type="text" id="searchInput" placeholder="Buscar por pasajero, id, importe..." value={busqueda} onChange={(e) => setBusqueda(e.target.value.toLowerCase())} className="bg-gray-50 h-20 w-70 mr-2 sm:mr-0 sm:w-250 text-2xl rounded-2xl p-5 border border-blue-950" />
                <button onClick={abrirAddModal} className="btn-add bg-blue-500 h-20 w-50 font-bold rounded-xl text-white cursor-pointer sm:ml-5 shadow-md">
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
                            <td className="table-border ">Dirección</td>
                            <td className="table-border hidden sm:table-cell">Fecha</td>
                            <td className="table-border">Importe</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody className="bg-[#eff9ff]">
                        {filteredPassengers.map((passenger, index) => {
                            const date = getDate(passenger.id);
                            return (
                                <tr key={passenger.id} className="table-border h-25 hover:bg-blue-100">
                                    <td>{index + 1}</td>
                                    <td>{passenger.nombre}</td>
                                    <td className="hidden sm:table-cell">{passenger.nacionalidad}</td>
                                    <td>{passenger.barrio}</td>
                                    <td className="hidden sm:table-cell">{date ? new Date(date.fecha).toLocaleDateString("es-ES") : 'N/A'} </td>
                                    <td>{(Number(getTotalPayments(passenger.id)) || 0).toFixed(2)}€</td>
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


            <dialog ref={addModalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                {createPassengerModal && (
                    <>
                        <h3 className="text-blue-950 text-5xl font-semibold mt-20 sm:ml-5">Añadir Pasajero</h3>
                        <form onSubmit={handleCreatePassenger} className="mt-10 flex flex-col justify-center gap-2">
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Nombre:</span><span className="text-red-600">*</span></label>
                            <input type="text" name="nombre" value={formPassenger.nombre} onChange={(e) => setFormPassenger({ ...formPassenger, nombre: e.target.value })} className="form-input mt-2" required />

                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Nacionalidad:</span></label>
                            <input type="text" name="nacionalidad" value={formPassenger.nacionalidad} onChange={(e) => setFormPassenger({ ...formPassenger, nacionalidad: e.target.value })} className="form-input mt-2" />
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Barrio:</span></label>
                            <input type="text" name="barrio" value={formPassenger.barrio} onChange={(e) => setFormPassenger({ ...formPassenger, barrio: e.target.value })} className="form-input mt-2" />
                            <label className="text-left min-[450px]:ml-20 mt-2.5 text-3xl font-medium italic"><span>Imagen (URL):</span></label>
                            <input type="text" name="img" value={formPassenger.img} onChange={(e) => setFormPassenger({ ...formPassenger, img: e.target.value })} className="form-input mt-2" />

                            <h4 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">Pagos (opcional)</h4>
                            {formPayment.map((pago, idx) => (
                            <div key={idx} className="mt-5 flex flex-col gap-2">
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Fecha: </span></label>
                                <input type="date" name="fecha" value={pago.fecha} onChange={e => handlePaymentChange(idx, e)} placeholder="Fecha" className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                <input type="number" step="0.01" name="pago" value={pago.pago} onChange={e => handlePaymentChange(idx, e)}placeholder="Importe" className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                <select name="estado" value={pago.estado} onChange={e => handlePaymentChange(idx, e)} className="form-input mt-2" >
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
            <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                {modalPassenger && !editPassengerModal && !addPaymentModal && !editPaymentModal && (
                    <>
                        <div className="flex justify-center items-center gap-5 mt-20">

                            <div>
                                <img src={modalPassenger.img || "https://cdn-icons-png.flaticon.com/512/5580/5580993.png"} alt="" className="w-50 h-50 sm:w-60 sm:h-60 object-cover rounded-4xl" />
                            </div>
                            <div>
                                <h2 className="text-blue-950 text-2xl sm:text-3xl font-bold">{modalPassenger.nombre}</h2>
                                <p className="passenger-modal-p"><strong>ID:</strong> {modalPassenger.id} </p>
                                <p className="passenger-modal-p"><strong>Nacionalidad:</strong> {modalPassenger.nacionalidad} </p>
                                <p className="passenger-modal-p"><strong>Barrio:</strong> {modalPassenger.barrio}</p>
                                <p className="passenger-modal-p"><strong>Fecha:</strong> {getDate(modalPassenger.id)?.fecha ? new Date(getDate(modalPassenger.id).fecha).toLocaleDateString() : "N/A"} </p>
                                <p className="passenger-modal-p"><strong>Importe total:</strong> {getTotalPayments(modalPassenger.id)}€</p>
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-5 mt-10">
                            <button onClick={() => { setEditPassengerModal(true); setFormPassenger(modalPassenger); }} className="bg-yellow-400 p-3 rounded-xl font-medium text-xl text-white shadow-md"><i className="fa-solid fa-pen-to-square"></i> Editar Pasajero</button>
                            <button onClick={() => { setAddPaymentModal(true); setFormPayment({ fecha: "", pago: "", estado: "pendiente" }); }} className="bg-lime-400 p-3 rounded-xl font-medium text-xl text-white shadow-md"><i className="fa-solid fa-money-check-dollar"></i> Añadir Pago</button>
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
                                        <div key={index} onClick={() => { setSelectedPayment({...pago, fecha: normalizeDate(pago.fecha)}); setEditPaymentModal(true);}} className={`flex flex-col justify-center items-center w-30 h-20 text-blue-50 rounded transition-colors duration-300 ${pago.estado === "completado" ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"}`} title={`${pago.fecha} - ${pago.pago}€ - ${pago.estado}`} >
                                            <p className="text-sm font-semibold">{new Date(pago.fecha).toLocaleDateString()}</p>
                                            <p className="font-bold text-2xl">{pago.pago}€</p>
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
                                <input value={formPassenger.nombre} onChange={(e) => setFormPassenger({ ...formPassenger, nombre: e.target.value })} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Nacionalidad: </span></label>
                                <input value={formPassenger.nacionalidad} onChange={(e) => setFormPassenger({ ...formPassenger, nacionalidad: e.target.value })} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Dirección: </span></label>
                                <input value={formPassenger.barrio} onChange={(e) => setFormPassenger({ ...formPassenger, barrio: e.target.value })} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Img: </span></label>
                                <input value={formPassenger.img} onChange={(e) => setFormPassenger({ ...formPassenger, img: e.target.value })} className="form-input mt-2 mb-5" />
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
                                <input type="date" name="fecha" value={pago.fecha} onChange={(e) => handlePaymentChange(idx, e)} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                <input type="number" step="0.01" name="pago" value={pago.pago} onChange={(e) => handlePaymentChange(idx, e)} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                <select name="estado" value={pago.estado} onChange={(e) => handlePaymentChange(idx, e)} className="form-input mt-2 mb-10">
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
                                <input type="date" value={selectedPayment.fecha} onChange={(e) => setSelectedPayment({ ...selectedPayment, fecha: e.target.value })} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Importe: </span></label>
                                <input type="number" value={selectedPayment.pago} onChange={(e) => setSelectedPayment({ ...selectedPayment, pago: e.target.value })} className="form-input mt-2" />
                                <label className="text-left min-[450px]:ml-20 mt-2.5 text-2xl font-medium italic"><span>Estado: </span></label>
                                <select value={selectedPayment.estado} onChange={(e) => setSelectedPayment({ ...selectedPayment, estado: e.target.value })} className="form-input mt-2 mb-10">
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
        </section>
    )
}

export default Passenger;