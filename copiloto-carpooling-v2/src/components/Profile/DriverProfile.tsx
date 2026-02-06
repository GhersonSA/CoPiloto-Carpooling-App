'use client';

import { getProxiedImageUrl } from '@/lib/imageUtils';

interface DriverProfileProps {
    perfil: any;
    vehiculo: any;
    rutaOriginal: any;
    onGestionarRuta: () => void;
    onEliminarRuta: () => void;
}

const DriverProfile = ({ perfil, vehiculo, rutaOriginal, onGestionarRuta, onEliminarRuta }: DriverProfileProps) => {
    if (!perfil) return null;

    const formatHora = (hora: string) => hora ? hora.slice(0, 5) : '';

    return (
        <div className="mt-6 border-4 border-blue-200 p-6 rounded-2xl bg-linear-to-br from-blue-50 to-white shadow-lg h-full">
            <div className="flex items-center gap-4 mb-4">
                <i className="fa-solid fa-car text-4xl text-blue-950"></i>
                <h3 className="text-2xl lg:text-3xl font-bold text-blue-950">Perfil Chofer</h3>
            </div>

            {/* Contenedor de perfil y vehículo alineados */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                {/* Columna Perfil Chofer */}
                <div className="flex-1 flex flex-col items-center bg-white rounded-xl p-4 shadow h-full">
                    <h4 className="font-bold text-xl mb-3 text-blue-950 flex items-center gap-2">
                        <i className="fa-solid fa-user"></i>
                        Chofer
                    </h4>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={getProxiedImageUrl(perfil.img_chofer)}
                        alt="Chofer"
                        className="rounded-full border-4 border-blue-950 shadow-md object-cover w-24 h-24 mb-2"
                    />
                    <div className="w-full grid grid-cols-1 gap-2 text-base">
                        <p>
                            <i className="fa-solid fa-location-dot text-blue-950 mr-2"></i>
                            <strong>Dirección:</strong> {perfil.direccion}
                        </p>
                        <p>
                            <i className="fa-solid fa-map-location-dot text-blue-950 mr-2"></i>
                            <strong>Barrio:</strong> {perfil.barrio}
                        </p>
                        {perfil.telefono && (
                            <p>
                                <i className="fa-solid fa-phone text-blue-950 mr-2"></i>
                                <strong>Teléfono:</strong> {perfil.telefono}
                            </p>
                        )}
                        <p>
                            <i className="fa-solid fa-star text-yellow-500 mr-2"></i>
                            <strong>Calificación:</strong> {perfil.calificacion || '0.00'}
                        </p>
                    </div>
                </div>
                {/* Columna Vehículo */}
                {vehiculo && Object.keys(vehiculo).length > 0 && (
                    <div className="flex-1 flex flex-col items-center bg-white rounded-xl p-4 shadow h-full">
                        <h4 className="font-bold text-xl mb-3 text-blue-950 flex items-center gap-2">
                            <i className="fa-solid fa-car-side"></i>
                            Vehículo
                        </h4>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getProxiedImageUrl(vehiculo.img_vehiculo)}
                            alt="Vehículo"
                            className="rounded-lg border-4 border-blue-300 shadow-md object-cover w-24 h-24 mb-2"
                        />
                        <div className="w-full grid grid-cols-1 gap-2 text-sm">
                            <p><strong>Marca:</strong> {vehiculo.marca}</p>
                            <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                            <p><strong>Color:</strong> {vehiculo.color}</p>
                            <p><strong>Matrícula:</strong> {vehiculo.matricula}</p>
                            <p>
                                <i className="fa-solid fa-users text-blue-950 mr-2"></i>
                                <strong>Plazas:</strong> {vehiculo.plazas}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de Ruta de Chofer */}
            <div className="mt-4 pt-4 border-t-2 border-blue-200">
                <h4 className="font-bold text-xl mb-3 text-blue-950 flex items-center gap-2">
                    <i className="fa-solid fa-route"></i>
                    Tu Ruta
                </h4>
                {rutaOriginal ? (
                    <div className="border-2 border-blue-300 p-3 rounded-lg mb-3 bg-white">
                        <p className="text-sm"><strong>Origen:</strong> {rutaOriginal.origen}</p>
                        <p className="text-sm"><strong>Destino:</strong> {rutaOriginal.destino}</p>
                        <p className="text-sm"><strong>Días:</strong> {rutaOriginal.dias}</p>
                        <p className="text-sm">
                            <strong>Salida:</strong> {formatHora(rutaOriginal.hora_salida)} -
                            <strong> Llegada:</strong> {formatHora(rutaOriginal.hora_llegada)}
                        </p>
                        <p className="text-sm">
                            <strong>Regreso:</strong> {formatHora(rutaOriginal.hora_regreso)} -
                            <strong> Llegada:</strong> {formatHora(rutaOriginal.hora_llegada_regreso)}
                        </p>
                        {rutaOriginal.paradas && Array.isArray(rutaOriginal.paradas) && rutaOriginal.paradas.length > 0 && (
                            <p className="mt-2 text-sm">
                                <i className="fa-solid fa-map-pin text-blue-950 mr-2"></i>
                                <strong>Paradas:</strong> {rutaOriginal.paradas.length}
                            </p>
                        )}
                        <button
                            onClick={onEliminarRuta}
                            className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 mt-2 transition-colors text-sm"
                        >
                            <i className="fa-solid fa-trash-can mr-1"></i>
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-sm">No tienes ruta definida</p>
                )}
                <button
                    onClick={onGestionarRuta}
                    className="bg-blue-950 text-white px-4 py-2 rounded-xl hover:bg-blue-900 font-bold shadow-md transition-colors w-full text-sm"
                >
                    <i className="fa-solid fa-map-location-dot mr-2"></i>
                    Gestionar Ruta
                </button>
            </div>
        </div>
    );
};

export default DriverProfile;