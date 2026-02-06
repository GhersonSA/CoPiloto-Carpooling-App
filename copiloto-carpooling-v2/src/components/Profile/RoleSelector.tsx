"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import ImageUploader from "./ImageUploader";
import PhoneInput from "./PhoneInput";
import { useGuest } from "@/hooks/useGuest";
import AddressAutocomplete from "@/components/Map/AddressAutocomplete";

// const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const choferImg = [
    "/assets/imgChofer1.png",
    "/assets/imgChofer2.jpg",
    "/assets/imgChofer3.png",
];

const vehiculoImg = [
    "/assets/imgVehiculo1.jpg",
    "/assets/imgVehiculo2.jpeg",
    "/assets/imgVehiculo3.jpg",
];

const pasajeroImg = [
    "/assets/imgPasajero1.jpg",
    "/assets/imgPasajero2.jpg",
    "/assets/imgPasajero3.png",
];

interface RoleSelectorProps {
    roles: any[];
    fetchRoles: () => void;
}

export default function RoleSelector({ roles, fetchRoles }: RoleSelectorProps) {
    const { isGuest } = useGuest();
    const [showModal, setShowModal] = useState(false);
    const [tipoRol, setTipoRol] = useState<"chofer" | "pasajero" | null>(null);
    const [formData, setFormData] = useState<any>({});
    const modalRef = useRef<HTMLDialogElement>(null);
    const toast = useToast();

    const abrirModal = (tipo: "chofer" | "pasajero") => {
        setTipoRol(tipo);
        setFormData({});
        setShowModal(true);
        modalRef.current?.showModal();
    };

    const cerrarModal = () => {
        modalRef.current?.close();
        setShowModal(false);
        setTipoRol(null);
        setFormData({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/roles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ tipo: tipoRol, data: formData }),
            });

            if (!res.ok) throw new Error("Error al crear rol");

            await fetchRoles();
            cerrarModal();
            toast.success(`Rol ${tipoRol} creado exitosamente`);
        } catch (err: any) {
            toast.error("Error al crear rol");
        }
    };

    const tieneChofer = roles.some((r) => r.tipo === "chofer");
    const tienePasajero = roles.some((r) => r.tipo === "pasajero");

    if (tieneChofer && tienePasajero) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-2xl font-bold mb-3">Añadir Rol</h3>
            <div className="flex gap-3">
                {!tieneChofer && (
                    <button
                        onClick={!isGuest ? () => abrirModal("chofer") : undefined}
                        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isGuest}
                    >
                        <i className="fa-solid fa-car"></i> Ser Chofer
                    </button>
                )}
                {!tienePasajero && (
                    <button
                        onClick={!isGuest ? () => abrirModal("pasajero") : undefined}
                        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isGuest}
                    >
                        <i className="fa-solid fa-user"></i> Ser Pasajero
                    </button>
                )}
            </div>

            <dialog
                ref={modalRef}
                className="rounded-lg p-6 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full backdrop:bg-black/50 m-auto"
            >
                {showModal && (
                    <div className="flex flex-col justify-center items-center gap-5 mt-5">
                        <div className="flex items-center gap-3">
                            <i className={`fa-solid ${tipoRol === 'chofer' ? 'fa-car text-blue-950' : 'fa-user text-green-700'} text-4xl`}></i>
                            <h2 className={`${tipoRol === 'chofer' ? 'text-blue-950' : 'text-green-700'} text-4xl font-bold`}>
                                Crear Rol: {tipoRol === 'chofer' ? 'Chofer' : 'Pasajero'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full">
                            {tipoRol === "chofer" && (
                                <>
                                    <div className="border-2 border-blue-200 p-5 rounded-xl bg-blue-50/50 mt-4">
                                        <h4 className="font-bold text-xl text-blue-950 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-user-tie"></i>
                                            Datos Personales
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-location-dot mr-2 text-blue-600"></i>
                                                    Dirección
                                                </label>
                                                <AddressAutocomplete
                                                    value={formData.direccion || ''}
                                                    onChange={(address) => setFormData({ ...formData, direccion: address })}
                                                    placeholder="Ej: Calle Gran Vía 25, Zaragoza"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-map-pin mr-2 text-purple-600"></i>
                                                    Barrio
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Centro, Delicias, Actur..."
                                                    required
                                                    className="form-input"
                                                    onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-phone mr-2 text-green-600"></i>
                                                    Teléfono de Contacto
                                                </label>
                                                <PhoneInput
                                                    value={formData.telefono || ''}
                                                    onChange={(value) => setFormData({ ...formData, telefono: value })}
                                                />
                                            </div>

                                            <ImageUploader
                                                currentImage={formData.img_chofer}
                                                onImageSelect={(url) => setFormData({ ...formData, img_chofer: url })}
                                                presetImages={choferImg}
                                                label="Imagen del Chofer"
                                                type="chofer"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-2 border-orange-200 p-5 rounded-xl bg-orange-50/50 mt-4">
                                        <h4 className="font-bold text-xl text-orange-700 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-car-side"></i>
                                            Datos del Vehículo
                                        </h4>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                        <i className="fa-solid fa-industry mr-2 text-gray-600"></i>
                                                        Marca
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Toyota, Ford..."
                                                        required
                                                        className="form-input"
                                                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                        <i className="fa-solid fa-car mr-2 text-blue-600"></i>
                                                        Modelo
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Corolla, Focus..."
                                                        required
                                                        className="form-input"
                                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                        <i className="fa-solid fa-palette mr-2 text-pink-500"></i>
                                                        Color
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Blanco, Negro, Rojo..."
                                                        required
                                                        className="form-input"
                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                        <i className="fa-solid fa-id-card mr-2 text-indigo-600"></i>
                                                        Matrícula
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: 1234 ABC"
                                                        required
                                                        className="form-input"
                                                        onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                    <i className="fa-solid fa-users mr-2 text-green-600"></i>
                                                    Plazas Disponibles
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="Ej: 4"
                                                    required
                                                    min="1"
                                                    max="8"
                                                    className="form-input"
                                                    onChange={(e) => setFormData({ ...formData, plazas: parseInt(e.target.value) })}
                                                />
                                            </div>

                                            <ImageUploader
                                                currentImage={formData.img_vehiculo}
                                                onImageSelect={(url) => setFormData({ ...formData, img_vehiculo: url })}
                                                presetImages={vehiculoImg}
                                                label="Imagen del Vehículo"
                                                type="vehiculo"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {tipoRol === "pasajero" && (
                                <div className="border-2 border-green-200 p-5 rounded-xl bg-green-50/50 mt-4">
                                    <h4 className="font-bold text-xl text-green-700 mb-4 flex items-center gap-2">
                                        <i className="fa-solid fa-user"></i>
                                        Datos Personales
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-green-700 mb-1">
                                                <i className="fa-solid fa-globe mr-2 text-blue-600"></i>
                                                Nacionalidad
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Española, Colombiana..."
                                                required
                                                className="form-input"
                                                onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-green-700 mb-1">
                                                <i className="fa-solid fa-map-pin mr-2 text-purple-600"></i>
                                                Barrio
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Centro, Delicias, Actur..."
                                                required
                                                className="form-input"
                                                onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-green-700 mb-1">
                                                <i className="fa-solid fa-phone mr-2 text-green-600"></i>
                                                Teléfono de Contacto
                                            </label>
                                            <PhoneInput
                                                value={formData.telefono || ''}
                                                onChange={(value) => setFormData({ ...formData, telefono: value })}
                                            />
                                        </div>

                                        <ImageUploader
                                            currentImage={formData.img_pasajero}
                                            onImageSelect={(url) => setFormData({ ...formData, img_pasajero: url })}
                                            presetImages={pasajeroImg}
                                            label="Imagen del Pasajero"
                                            type="pasajero"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    type="submit"
                                    className={`${tipoRol === 'chofer' ? 'bg-blue-950 hover:bg-blue-900' : 'bg-green-600 hover:bg-green-700'} px-8 py-3 font-bold rounded-xl text-white text-lg cursor-pointer shadow-md flex items-center gap-2`}
                                >
                                    <i className="fa-solid fa-check"></i>
                                    Crear Rol
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 px-8 py-3 font-bold rounded-xl text-white text-lg hover:bg-gray-500 cursor-pointer shadow-md flex items-center gap-2"
                                    onClick={cerrarModal}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <button
                    onClick={cerrarModal}
                    className="absolute top-4 right-4 text-4xl text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </dialog>
        </div>
    );
}