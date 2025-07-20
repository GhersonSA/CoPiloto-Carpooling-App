import { useState, useEffect, useRef } from 'react';
import { useRoleData } from '../../hooks/useRoleData.js'

import DriverSection from '../../components/HomeSections/DriverSection.jsx';
import PassengerSection from '../../components/HomeSections/PassengerSection.jsx';
import TripSection from '../../components/HomeSections/TripSection.jsx';

const Home = () => {
     
    const [vista, setVista] = useState("todo");

    const { drivers, passengers, routes } = useRoleData();

    /* PASSENGER MODE */

    /* HOME CARDS MODAL */

    const [modalData, setModalData] = useState(null);
    const [modalTipo, setModalTipo] = useState(null);
    const modalRef = useRef(null);

    const abrirModal = (tipo, data) => {
        setModalTipo(tipo);
        setModalData(data);
        modalRef.current?.showModal();
    };

    const cerrarModal = () => {
        modalRef.current?.close();
        setModalData(null);
        setModalTipo(null);
    };

    /* */

    /* SEARCH BAR */

    const [busqueda, setBusqueda] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        const input = inputRef.current;

        const handleInput = (e) => {
            const query = e.target.value.toLowerCase();
            setBusqueda(query);
            setVista("todo");

        };

        input.addEventListener('input', handleInput);
        return () => input.removeEventListener('input', handleInput);
    }, []);
    /* */


    return (
        <section className="h-full">
            <div className="bg-blue-950 lg:bg-blue-950/90 flex justify-center items-center flex-col w-full h-70">
                <h1 className="text-white text-4xl sm:text-5xl font-secondary font-bold mb-6">Encuentra tu recorrido ideal</h1>
                <input type="text" id="searchInput" placeholder="Buscar chofer, pasajero, lugar, viaje..." ref={inputRef} className="bg-gray-50 h-20 w-120 sm:w-250 text-2xl rounded-2xl p-5 border border-blue-950" />
            </div>
            <div>
                <div className="bg-gray-300 flex justify-center items-center w-full h-20 font-secondary">
                   <button onClick={() => setVista("todo")} className={`home-buttons ${vista === "todo" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                        Todo
                    </button>
                    <button onClick={() => setVista("choferes")} className={`home-buttons ${vista === "choferes" ? "text-blue-950 bg-white border-blue-950 font-bold" : "text-gray-500 border-transparent"}`}>
                        Choferes
                    </button>
                    <button onClick={() => setVista("pasajeros")} className={`home-buttons ${vista === "pasajeros" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                        Pasajeros
                    </button>
                    <button onClick={() => setVista("viajes")} className={`home-buttons ${vista === "viajes" ? "text-blue-950 bg-white font-bold" : "text-gray-500 border-transparent"}`}>
                        Viajes
                    </button>
                </div>
                {vista === "todo" && (
                    <div className="p-6 space-y-10">
                        <section>
                            <h2 className="home-titles">🚗 Buscar Choferes</h2>
                            <DriverSection drivers={drivers} routes={routes} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>

                        <section>
                            <h2 className="home-titles">🧍 Buscar Pasajeros</h2>
                            <PassengerSection passengers={passengers} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>

                        <section>
                            <h2 className="home-titles">🛣️ Buscar Viajes</h2>
                            <TripSection routes={routes} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>
                    </div>
                )}
                {vista === "choferes" && (
                    <DriverSection drivers={drivers} routes={routes} abrirModal={abrirModal} />
                )}

                {vista === "pasajeros" && (
                    <PassengerSection passengers={passengers} abrirModal={abrirModal} />
                )}

                {vista === "viajes" && (
                    <TripSection routes={routes} abrirModal={abrirModal} />
                )}
                <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-[500px] sm:h-[550px] lg:h-[560px] w-full backdrop:bg-black/50 m-auto" closedby="any">
                    <div className="relative flex justify-end items-center">
                        <button>
                            <i className="fa-solid fa-xmark text-3xl text-gray-500 hover:text-gray-800 cursor-pointer" onClick={cerrarModal}></i>
                        </button>
                    </div>
                    {modalTipo === "chofer" && modalData && (
                        <>
                            <div className="modal-container">
                                <img src={modalData.img} alt="" className="modal-img" />
                                <div className="ml-5">
                                    <h2 className="modal-h2">{modalData.nombre}</h2>
                                    <p className="modal-p1"><strong>Calificación:</strong> {modalData.calificacion}</p>
                                </div>
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>Dirección:</strong> {modalData.direccion}</p>
                                <p className="modal-p2"><strong>Barrio:</strong> {modalData.barrio}</p>
                                <p className="modal-p2"><strong>Vehículo:</strong> {modalData.vehiculo.marca} {modalData.vehiculo.modelo} ({modalData.vehiculo.color})</p>
                                <p className="modal-p2"><strong>Matrícula:</strong> {modalData.vehiculo.matricula}</p>
                                <p className="modal-p2"><strong>Plazas:</strong> {modalData.vehiculo.plazas}</p>
                            </div>
                            <div className="modal-container-3">
                                <img src={modalData.img} alt="" className="modal-img-2" />
                            </div>
                        </>
                    )}
                    {modalTipo === "pasajero" && modalData && (
                        <>
                            <div className="modal-container">
                                <img src={modalData.img} alt="" className="modal-img" />
                                <div className="ml-5">
                                    <h2 className="modal-h2">{modalData.nombre}</h2>
                                    <p className="modal-p1"><strong>Calificación:</strong> {modalData.calificacion}</p>
                                </div>
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>Dirección:</strong> {modalData.direccion}</p>
                                <p className="modal-p2"><strong>Barrio:</strong> {modalData.barrio}</p>
                            </div>
                            <div className="modal-container-3">
                                <img src={modalData.img} alt="" className="modal-img-2" />
                            </div>
                        </>
                    )}
                    {modalTipo === "viaje" && modalData && (
                        <>
                            <div className="modal-container">
                                <img src="https://www.enjoyzaragoza.es/wp-content/uploads/2021/04/Imagen-3.jpg" alt="" className="modal-trip-img" />
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>Origen:</strong> {modalData.origen}</p>
                                <p className="modal-p2"><strong>Destino:</strong> {modalData.destino}</p>
                                <p className="modal-p2"><strong>Hora Salida:</strong> {modalData.horaSalida} <strong>Regreso:</strong> {modalData.horaRegreso} </p>
                                <p className="modal-p2"><strong>Días:</strong> {modalData.dias?.join(", ")}</p>
                            </div>                         
                        </>
                    )}
                </dialog>
            </div>
        </section>
       
    )
}

export default Home;