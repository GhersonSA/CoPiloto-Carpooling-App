'use client';

import { useState, useEffect, useRef } from 'react';
import DriverSection from '../../components/HomeSections/DriverSection';
import PassengerSection from '../../components/HomeSections/PassengerSection';
import TripSection from '../../components/HomeSections/TripSection';
import InteractiveMap from '../../components/Map/InteractiveMap';
import { useFetchData } from '../../hooks/useFetchData';
import { useRoles } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';
import Footer from '@/components/layout/Footer';
import { getProxiedImageUrl } from '@/lib/imageUtils';

const Home = () => {
    const { user, loading: userLoading } = useAuth();
    const { roles } = useRoles(user, userLoading);
    const [vista, setVista] = useState<'mapa' | 'todo' | 'choferes' | 'pasajeros' | 'viajes'>('mapa');

    const drivers = useFetchData('drivers');
    const passengerProfiles = useFetchData('passenger-profiles');
    const routes = useFetchData('routes');
    const routePassengers = useFetchData('route-passengers');

    const [modalData, setModalData] = useState<any>(null);
    const [modalTipo, setModalTipo] = useState<string | null>(null);
    const modalRef = useRef<HTMLDialogElement>(null);

    const abrirModal = (tipo: string, data: any) => {
        setModalTipo(tipo);
        setModalData(data);
        modalRef.current?.showModal();
    };

    const cerrarModal = () => {
        modalRef.current?.close();
        setModalData(null);
        setModalTipo(null);
    };

    const [busqueda, setBusqueda] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setBusqueda(query);
        if (query) setVista('todo');
    };

    const esChofer = roles.some(r => r.tipo === 'chofer');
    const esPasajero = roles.some(r => r.tipo === 'pasajero');

    function formatHora(hora: string) {
        return hora ? hora.slice(0, 5) : '';
    }

    return (
        <section className="h-full">
            {/* 
            <div className="bg-blue-950 lg:bg-blue-950/90 justify-center items-center flex-col w-full hidden sm:flex sm:h-50 lg:h-55">
                <h1 className="text-white text-4xl sm:text-5xl font-secondary font-bold mb-6 ml-6 sm:ml-0">
                    Encuentra tu recorrido ideal
                </h1>
                <input
                    type="text"
                    id="searchInput"
                    placeholder="Buscar chofer, pasajero, lugar, viaje..."
                    value={busqueda}
                    onChange={handleSearch}
                    className="bg-gray-50 h-20 w-120 sm:w-250 text-2xl rounded-2xl p-5 border border-blue-950"
                />
            </div> 
            <div className='bg-white h-5'></div> */}
            <div>
                {vista === 'mapa' && (
                    <div className="w-full h-full sm:px-5 sm:pt-5 sm:bg-white">
                        <InteractiveMap
                            drivers={drivers}
                            passengers={passengerProfiles}
                            routes={routes}
                            routePassengers={routePassengers}
                            onOpenModal={abrirModal}
                        />
                    </div>
                )}

                {vista === 'todo' && (
                    <div className="p-6 space-y-10">
                        <section>
                            <h2 className="home-titles"><i className="fa-solid fa-car text-red-800"></i> Buscar Choferes</h2>
                            <DriverSection drivers={drivers} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>
                        <section>
                            <h2 className="home-titles"><i className="fa-solid fa-person-walking text-sky-600"></i> Buscar Pasajeros</h2>
                            <PassengerSection passengers={passengerProfiles} routePassengers={routePassengers} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>
                        <section>
                            <h2 className="home-titles"><i className="fa-solid fa-map-location-dot text-green-700"></i> Buscar Viajes</h2>
                            <TripSection routes={routes} abrirModal={abrirModal} busqueda={busqueda} />
                        </section>
                    </div>
                )}
                {vista === 'choferes' && (
                    <div className="p-6">
                        <DriverSection drivers={drivers} abrirModal={abrirModal} busqueda={busqueda} />
                    </div>
                )}
                {vista === 'pasajeros' && (
                    <div className="p-6">
                        <PassengerSection passengers={passengerProfiles} routePassengers={routePassengers} abrirModal={abrirModal} busqueda={busqueda} />
                    </div>
                )}
                {vista === 'viajes' && (
                    <div className="p-6">
                        <TripSection routes={routes} abrirModal={abrirModal} busqueda={busqueda} />
                    </div>
                )}

                <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl min-h-[500px] max-h-[90vh] w-11/12 sm:w-full backdrop:bg-black/50 m-auto overflow-y-auto">
                    <div className="relative flex justify-end items-center mb-4">
                        <button onClick={cerrarModal}>
                            <i className="fa-solid fa-xmark text-3xl text-gray-500 hover:text-gray-800 cursor-pointer"></i>
                        </button>
                    </div>
                    {modalTipo === 'chofer' && modalData && (
                        <>
                            <div className="modal-container">
                                <div className="relative w-24 h-24">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getProxiedImageUrl(modalData.img_chofer)} alt="Chofer" className="w-full h-full rounded-full object-cover border-4 border-blue-950" />
                                </div>
                                <div className="ml-5">
                                    <h2 className="modal-h2">{modalData?.nombre || modalData?.username || 'Sin nombre'}</h2>
                                    <p className="modal-p1 text-yellow-600">⭐ {modalData.calificacion || '0.0'}</p>
                                </div>
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>📍 Dirección:</strong> {modalData.direccion}</p>
                                <p className="modal-p2"><strong>🏘️ Barrio:</strong> {modalData.barrio}</p>
                                {modalData.vehiculo && (
                                    <>
                                        <p className="modal-p2"><strong>🚗 Vehículo:</strong> {modalData.vehiculo?.marca} {modalData.vehiculo?.modelo} ({modalData.vehiculo?.color})</p>
                                        <p className="modal-p2"><strong>🔢 Matrícula:</strong> {modalData.vehiculo?.matricula}</p>
                                        <p className="modal-p2"><strong>💺 Plazas:</strong> {modalData.vehiculo?.plazas}</p>
                                    </>
                                )}
                            </div>
                            {modalData.vehiculo?.img_vehiculo && (
                                <div className="modal-container-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getProxiedImageUrl(modalData.vehiculo.img_vehiculo)} alt="vehículo" className="w-full h-full object-cover rounded-lg" />
                                </div>
                            )}
                            <button className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-lg text-lg transition mt-4">
                                🚗 Solicitar Plaza
                            </button>
                        </>
                    )}
                    {modalTipo === 'pasajero' && modalData && (
                        <>
                            <div className="modal-container">
                                <div className="relative w-24 h-24">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getProxiedImageUrl(modalData.img_pasajero)} alt="Pasajero" className="w-full h-full rounded-full object-cover border-4 border-green-600" />
                                </div>
                                <div className="ml-5">
                                    <h2 className="modal-h2 text-green-700">{modalData?.nombre || modalData?.username || 'Sin nombre'}</h2>
                                </div>
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>🌍 Nacionalidad:</strong> {modalData.nacionalidad}</p>
                                <p className="modal-p2"><strong>🏘️ Barrio:</strong> {modalData.barrio}</p>
                            </div>
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition mt-4">
                                👋 Enviar Invitación
                            </button>
                        </>
                    )}
                    {modalTipo === 'viaje' && modalData && (
                        <>
                            <div className="modal-container">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://www.enjoyzaragoza.es/wp-content/uploads/2021/04/Imagen-3.jpg" alt="Viaje" width={400} height={300} className="modal-trip-img" />
                            </div>
                            <div className="modal-container-2">
                                <p className="modal-p2"><strong>Origen:</strong> {modalData.origen}</p>
                                <p className="modal-p2"><strong>Destino:</strong> {modalData.destino}</p>
                                <p className="modal-p2"><strong>Hora Salida:</strong> {formatHora(modalData.horaSalida)} <strong>Regreso:</strong> {formatHora(modalData.horaRegreso)} </p>
                                <p className="modal-p2"><strong>Días:</strong> {modalData.dias ? modalData.dias.split(',').join(', ') : '-'}</p>
                            </div>
                        </>
                    )}
                </dialog>
            </div>
            <Footer />
        </section>
    );
};

export default Home;