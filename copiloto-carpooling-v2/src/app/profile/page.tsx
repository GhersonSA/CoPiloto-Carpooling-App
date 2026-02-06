'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/components/Toast";
import type { Role, PerfilChofer, PerfilPasajero, Vehiculo, RutaChofer, RutaPasajero, Parada } from "@/types/profile";
import RoleSelector from "@/components/Profile/RoleSelector";
import DriverProfile from "@/components/Profile/DriverProfile";
import PassengerProfile from "@/components/Profile/PassengerProfile";
import AddressAutocomplete from "@/components/Map/AddressAutocomplete";
import ImageUploader from "@/components/Profile/ImageUploader";
import PhoneInput from "@/components/Profile/PhoneInput";

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

// Usar proxies de Next.js para reenviar cookies/JWT
// BACKEND_URL ya no se usa; todas las llamadas pasan por `/api/*`

const Profile = () => {
    const { user, loading: userLoading } = useAuth();
    const { roles, loading: rolesLoading, fetchRoles } = useRoles(user, userLoading);
    const toast = useToast();
    const [editRoleModal, setEditRoleModal] = useState(false);
    const [showRutasChoferModal, setShowRutasChoferModal] = useState(false);
    const [showRutasPasajeroModal, setShowRutasPasajeroModal] = useState(false);
    const [formRole, setFormRole] = useState<(PerfilChofer & Vehiculo & { tipo: 'chofer' }) | (PerfilPasajero & { tipo: 'pasajero' }) | null>(null);

    const [rutaChofer, setRutaChofer] = useState<RutaChofer | null>(null);
    const [rutaChoferOriginal, setRutaChoferOriginal] = useState<RutaChofer | null>(null);
    const [rutaPasajero, setRutaPasajero] = useState<RutaPasajero | null>(null);
    const [rutaPasajeroOriginal, setRutaPasajeroOriginal] = useState<RutaPasajero | null>(null);

    const [perfilChofer, setPerfilChofer] = useState<PerfilChofer | null>(null);
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [perfilPasajero, setPerfilPasajero] = useState<PerfilPasajero | null>(null);

    const [paradasSeleccionadas, setParadasSeleccionadas] = useState<Parada[]>([]);

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    const rolActual = roles.length > 0 ? roles.map((r: Role) => capitalize(r.tipo)).join(" y ") : "Ninguno";

    const esChofer = roles.some((r: Role) => r.tipo === 'chofer');
    const esPasajero = roles.some((r: Role) => r.tipo === 'pasajero');

    // USEEFFECT UNIFICADO - Solo se ejecuta 1 vez cuando user y roles están listos
    useEffect(() => {
        const cargarTodoElPerfil = async () => {
            if (!user || roles.length === 0) {
                return;
            }

            const rolChofer = roles.find(r => r.tipo === 'chofer');
            const rolPasajero = roles.find(r => r.tipo === 'pasajero');

            try {
                // Cargar perfil de chofer + vehículo + ruta
                if (rolChofer) {
                    const [perfilRes, rutaRes] = await Promise.all([
                        fetch(`/api/driver-profiles/${rolChofer.id}`, { credentials: 'include' }),
                        fetch(`/api/routes?chofer_id=${user.id}`, { credentials: 'include' })
                    ]);

                    if (perfilRes.ok) {
                        const perfil = await perfilRes.json();
                        setPerfilChofer(perfil);

                        const vehiculoRes = await fetch(`/api/vehicles/by-profile/${perfil.id}`, { credentials: 'include' });
                        if (vehiculoRes.ok) {
                            setVehiculo(await vehiculoRes.json());
                        }
                    }

                    if (rutaRes.ok) {
                        const data = await rutaRes.json();
                        const rutaEncontrada = data.find((r: any) => r.chofer_id === user.id) || null;
                        setRutaChoferOriginal(rutaEncontrada);
                    }
                } else {
                    setPerfilChofer(null);
                    setVehiculo(null);
                    setRutaChoferOriginal(null);
                }

                // Cargar perfil de pasajero + ruta
                if (rolPasajero) {
                    const [perfilRes, rutaRes] = await Promise.all([
                        fetch(`/api/passenger-profiles/${rolPasajero.id}`, { credentials: 'include' }),
                        fetch(`/api/route-passengers/mis-rutas`, { credentials: 'include' })
                    ]);

                    if (perfilRes.ok) {
                        const perfilPas = await perfilRes.json();
                        setPerfilPasajero(perfilPas);
                    }

                    if (rutaRes.ok) {
                        const data = await rutaRes.json();
                        setRutaPasajeroOriginal(data[0] || null);
                    }
                } else {
                    setPerfilPasajero(null);
                    setRutaPasajeroOriginal(null);
                }
            } catch (error) {
                console.error("Error cargando datos del perfil:", error);
            }
        };

        cargarTodoElPerfil();
    }, [user, roles]);

    const cargarRutas = async () => {
        if (!user) return;
        try {
            if (esChofer) {
                const res = await fetch(`/api/routes?chofer_id=${user.id}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const rutaEncontrada = data.find((r: any) => r.chofer_id === user.id) || null;
                    setRutaChoferOriginal(rutaEncontrada);
                }
            }

            if (esPasajero) {
                const res = await fetch(`/api/route-passengers/mis-rutas`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setRutaPasajeroOriginal(data[0] || null);
                }
            }
        } catch (error) {
            console.error("Error cargando rutas:", error);
        }
    };

    const handleDeleteRole = async (tipo: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este rol?")) return;

        try {
            const res = await fetch(`/api/roles/${tipo}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error eliminando rol");

            await fetchRoles();
            toast.success(`Rol ${tipo} eliminado exitosamente`);
        } catch (err) {
            console.error(err);
            toast.error("Error al eliminar");
        }
    };

    const handleEditRole = async (rol: any) => {
        let rolInicial = { ...rol };

        if (rol.tipo === 'chofer') {
            const perfilRes = await fetch(`/api/driver-profiles/${rol.id}`, { credentials: 'include' });
            if (perfilRes.ok) {
                const perfil = await perfilRes.json();
                rolInicial = { ...rolInicial, ...perfil };

                const vehiculoRes = await fetch(`/api/vehicles/by-profile/${perfil.id}`, { credentials: 'include' });
                if (vehiculoRes.ok) {
                    const vehiculo = await vehiculoRes.json();
                    rolInicial = { ...rolInicial, ...vehiculo };
                }
            }
        }

        if (rol.tipo === 'pasajero') {
            const perfilRes = await fetch(`/api/passenger-profiles/${rol.id}`, { credentials: 'include' });
            if (perfilRes.ok) {
                const perfil = await perfilRes.json();
                rolInicial = { ...rolInicial, ...perfil };
            }
        }

        setFormRole(rolInicial);
        setEditRoleModal(true);
    };

    const cerrarRoleModal = () => {
        setEditRoleModal(false);
        setFormRole(null);
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formRole) {
            toast.error("No hay datos del rol para actualizar");
            return;
        }

        try {
            // Extraer tipo y preparar datos sin la propiedad tipo duplicada
            const { tipo, ...data } = formRole;

            console.log("Enviando actualización de rol:", { tipo, data });

            const res = await fetch(`/api/roles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ tipo, data }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Error del servidor:", errorData);
                throw new Error(errorData.message || "Error actualizando rol");
            }

            await fetchRoles();
            cerrarRoleModal();
            toast.success("Rol actualizado exitosamente");
        } catch (err) {
            console.error(err);
            toast.error("Error al actualizar");
        }
    };

    const abrirModalRutasChofer = () => {
        if (rutaChoferOriginal) {
            setRutaChofer({ ...rutaChoferOriginal });
            if (rutaChoferOriginal.paradas && Array.isArray(rutaChoferOriginal.paradas)) {
                setParadasSeleccionadas(rutaChoferOriginal.paradas);
            } else {
                setParadasSeleccionadas([]);
            }
        } else {
            setRutaChofer(null);
            setParadasSeleccionadas([]);
        }
        setShowRutasChoferModal(true);
    };

    const cerrarModalRutasChofer = () => {
        setShowRutasChoferModal(false);
        setRutaChofer(null);
        setParadasSeleccionadas([]);
    };

    const guardarRutaChofer = async () => {
        try {
            const rutaConParadas = {
                ...rutaChofer,
                paradas: paradasSeleccionadas.filter(p => p.direccion),
                chofer_id: user?.id
            };

            let response;
            if (rutaChofer?.id) {
                response = await fetch(`/api/routes/${rutaChofer.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(rutaConParadas),
                });
            } else {
                response = await fetch(`/api/routes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(rutaConParadas),
                });
            }

            if (!response.ok) throw new Error("Error guardando ruta de chofer");

            await cargarRutas();
            setParadasSeleccionadas([]);
            cerrarModalRutasChofer();
            toast.success("Ruta de chofer guardada exitosamente");
        } catch (err) {
            console.error("Error guardando ruta de chofer:", err);
            toast.error("Error al guardar ruta de chofer");
        }
    };

    const abrirModalRutasPasajero = () => {
        if (rutaPasajeroOriginal) {
            setRutaPasajero({ ...rutaPasajeroOriginal });
        } else {
            // Inicializar con valores vacíos para crear nueva ruta
            setRutaPasajero({
                id: 0,
                origen: "",
                destino: "",
                dias: "",
                hora_salida: "",
                hora_llegada: "",
                hora_regreso: "",
                hora_llegada_regreso: ""
            });
        }
        setShowRutasPasajeroModal(true);
    };

    const cerrarModalRutasPasajero = () => {
        setShowRutasPasajeroModal(false);
        setRutaPasajero(null);
    };

    const eliminarRutaPasajero = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar tu ruta de pasajero?")) return;
        try {
            const response = await fetch(`/api/route-passengers`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Error eliminando ruta de pasajero");
            await cargarRutas();
            toast.success("Ruta de pasajero eliminada exitosamente");
        } catch (err) {
            console.error(err);
            toast.error("Error al eliminar ruta de pasajero");
        }
    };

    const eliminarRutaChofer = async () => {
        if (!rutaChoferOriginal?.id) return;
        if (!window.confirm("¿Seguro que quieres eliminar tu ruta de chofer?")) return;
        try {
            const response = await fetch(`/api/routes/${rutaChoferOriginal.id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Error eliminando ruta de chofer");
            await cargarRutas();
            toast.success("Ruta de chofer eliminada exitosamente");
        } catch (err) {
            console.error(err);
            toast.error("Error al eliminar ruta de chofer");
        }
    };

    const guardarRutaPasajero = async () => {
        try {
            const response = await fetch(`/api/route-passengers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...rutaPasajero }),
            });

            if (!response.ok) throw new Error("Error guardando ruta de pasajero");

            await cargarRutas();
            cerrarModalRutasPasajero();
            toast.success("Ruta de pasajero guardada exitosamente");
        } catch (err) {
            console.error("Error guardando ruta de pasajero:", err);
            toast.error("Error al guardar ruta de pasajero");
        }
    };

    // function formatHora(hora: string) {
    //     return hora ? hora.slice(0, 5) : '';
    // }

    if (userLoading || rolesLoading) return <p>Cargando...</p>;

    return (
        <section className="section-container">
            <h2 className="section-h2">Perfil</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center m-5 mb-30 gap-10 bg-white p-5 rounded-3xl shadow-lg">
                <div className="w-full">
                    <div className="flex justify-center items-center">
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/5580/5580993.png"
                            alt="Avatar"
                            width={100}
                            height={100}
                            className="object-cover rounded-full"
                        />
                    </div>
                    <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-center">
                        {user ? (user.nombre || user.username) : "Cargando..."}
                    </h2>
                    <h3 className="text-3xl sm:text-5xl lg:text-6xl mt-5 text-gray-500 text-center">
                        Rol actual: {rolActual}
                    </h3>
                    <h4 className="text-2xl sm:text-4xl lg:text-5xl mt-2 text-yellow-500 text-center">
                        Calificación: Próximamente...
                    </h4>

                    {/* Componentes modulares para mostrar perfiles */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {perfilChofer && (
                            <DriverProfile
                                perfil={perfilChofer}
                                vehiculo={vehiculo}
                                rutaOriginal={rutaChoferOriginal}
                                onGestionarRuta={abrirModalRutasChofer}
                                onEliminarRuta={eliminarRutaChofer}
                            />
                        )}
                        {perfilPasajero && (
                            <PassengerProfile
                                perfil={perfilPasajero}
                                rutaOriginal={rutaPasajeroOriginal}
                                onGestionarRuta={abrirModalRutasPasajero}
                                onEliminarRuta={eliminarRutaPasajero}
                            />
                        )}
                    </div>

                    <div className="mt-18">
                        <h3 className="text-2xl font-bold mb-3">Tus Roles</h3>
                        {roles.map((rol) => (
                            <div key={rol.tipo} className="flex items-center justify-between border p-3 rounded mb-2">
                                <span className="text-lg">{capitalize(rol.tipo)}</span>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => handleEditRole(rol)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-600">
                                        <i className="fa-solid fa-pen-to-square"></i> Editar
                                    </button>
                                    <button onClick={() => handleDeleteRole(rol.tipo)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                        <i className="fa-solid fa-trash-can"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <RoleSelector roles={roles} fetchRoles={fetchRoles} />

                    {/* Modal de edición de roles */}
                    {editRoleModal && formRole && (
                        <div className="fixed inset-0 z-9998 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/50" onClick={cerrarRoleModal} />
                            <div className="relative z-9999 bg-white rounded-lg p-6 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full mx-4">
                                <button onClick={cerrarRoleModal} className="absolute top-4 right-4 text-4xl text-gray-400 hover:text-gray-600 cursor-pointer">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>

                                <div className="flex flex-col justify-center items-center gap-5 mt-5">
                                    <div className="flex items-center gap-3">
                                        <i className={`fa-solid ${formRole.tipo === 'chofer' ? 'fa-car text-blue-950' : 'fa-user text-green-700'} text-4xl`}></i>
                                        <h2 className={`${formRole.tipo === 'chofer' ? 'text-blue-950' : 'text-green-700'} text-4xl font-bold`}>
                                            Editar Rol: {formRole.tipo === 'chofer' ? 'Chofer' : 'Pasajero'}
                                        </h2>
                                    </div>

                                    <form onSubmit={handleUpdateRole} className="w-full">
                                        {formRole.tipo === "chofer" && (
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
                                                                value={formRole.direccion || ""}
                                                                onChange={(address) => setFormRole({ ...formRole, direccion: address })}
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
                                                                name="barrio"
                                                                placeholder="Ej: Centro, Delicias, Actur..."
                                                                value={formRole.barrio || ""}
                                                                onChange={(e) => setFormRole({ ...formRole, barrio: e.target.value })}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                                <i className="fa-solid fa-phone mr-2 text-green-600"></i>
                                                                Teléfono de Contacto
                                                            </label>
                                                            <PhoneInput
                                                                value={formRole.telefono || ''}
                                                                onChange={(value) => setFormRole({ ...formRole, telefono: value })}
                                                            />
                                                        </div>

                                                        <ImageUploader
                                                            currentImage={formRole.img_chofer}
                                                            onImageSelect={(url) => setFormRole({ ...formRole, img_chofer: url })}
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
                                                                    name="marca"
                                                                    placeholder="Ej: Toyota, Ford..."
                                                                    value={formRole.marca || ""}
                                                                    onChange={(e) => setFormRole({ ...formRole, marca: e.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                                    <i className="fa-solid fa-car mr-2 text-blue-600"></i>
                                                                    Modelo
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="modelo"
                                                                    placeholder="Ej: Corolla, Focus..."
                                                                    value={formRole.modelo || ""}
                                                                    onChange={(e) => setFormRole({ ...formRole, modelo: e.target.value })}
                                                                    className="form-input"
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
                                                                    name="color"
                                                                    placeholder="Ej: Blanco, Negro, Rojo..."
                                                                    value={formRole.color || ""}
                                                                    onChange={(e) => setFormRole({ ...formRole, color: e.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-semibold text-orange-700 mb-1">
                                                                    <i className="fa-solid fa-id-card mr-2 text-indigo-600"></i>
                                                                    Matrícula
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="matricula"
                                                                    placeholder="Ej: 1234 ABC"
                                                                    value={formRole.matricula || ""}
                                                                    onChange={(e) => setFormRole({ ...formRole, matricula: e.target.value })}
                                                                    className="form-input"
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
                                                                name="plazas"
                                                                placeholder="Ej: 4"
                                                                min="1"
                                                                max="8"
                                                                value={formRole.plazas || ""}
                                                                onChange={(e) => setFormRole({ ...formRole, plazas: parseInt(e.target.value) || 0 })}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <ImageUploader
                                                            currentImage={formRole.img_vehiculo}
                                                            onImageSelect={(url) => setFormRole({ ...formRole, img_vehiculo: url })}
                                                            presetImages={vehiculoImg}
                                                            label="Imagen del Vehículo"
                                                            type="vehiculo"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {formRole.tipo === "pasajero" && (
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
                                                            name="nacionalidad"
                                                            placeholder="Ej: Española, Colombiana..."
                                                            value={formRole.nacionalidad || ""}
                                                            onChange={(e) => setFormRole({ ...formRole, nacionalidad: e.target.value })}
                                                            className="form-input"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-green-700 mb-1">
                                                            <i className="fa-solid fa-map-pin mr-2 text-purple-600"></i>
                                                            Barrio
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="barrio"
                                                            placeholder="Ej: Centro, Delicias, Actur..."
                                                            value={formRole.barrio || ""}
                                                            onChange={(e) => setFormRole({ ...formRole, barrio: e.target.value })}
                                                            className="form-input"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-green-700 mb-1">
                                                            <i className="fa-solid fa-phone mr-2 text-green-600"></i>
                                                            Teléfono de Contacto
                                                        </label>
                                                        <PhoneInput
                                                            value={formRole.telefono || ''}
                                                            onChange={(value) => setFormRole({ ...formRole, telefono: value })}
                                                        />
                                                    </div>

                                                    <ImageUploader
                                                        currentImage={formRole.img_pasajero}
                                                        onImageSelect={(url) => setFormRole({ ...formRole, img_pasajero: url })}
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
                                                className={`${formRole.tipo === 'chofer' ? 'bg-blue-950 hover:bg-blue-900' : 'bg-green-600 hover:bg-green-700'} px-8 py-3 font-bold rounded-xl text-white text-lg cursor-pointer shadow-md flex items-center gap-2`}
                                            >
                                                <i className="fa-solid fa-floppy-disk"></i>
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-gray-400 px-8 py-3 font-bold rounded-xl text-white text-lg hover:bg-gray-500 cursor-pointer shadow-md flex items-center gap-2"
                                                onClick={cerrarRoleModal}
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modales de rutas (chofer y pasajero) - se mantienen igual */}
                    {showRutasChoferModal && (
                        <div className="fixed inset-0 z-9998 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/50" onClick={cerrarModalRutasChofer} />
                            <div className="relative z-9999 bg-white rounded-lg p-6 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full mx-4">
                                <button onClick={cerrarModalRutasChofer} className="absolute top-4 right-4 text-4xl text-gray-400 hover:text-gray-600 cursor-pointer">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>

                                <div className="flex flex-col gap-5 mt-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <i className="fa-solid fa-route text-4xl text-blue-950"></i>
                                        <h2 className="text-blue-950 text-4xl font-bold">Gestionar Ruta de Chofer</h2>
                                    </div>

                                    <div className="border-2 border-blue-200 p-5 rounded-xl bg-blue-50/50">
                                        <h5 className="font-bold text-xl text-blue-950 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-map-location-dot"></i>
                                            Información de la Ruta
                                        </h5>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-location-dot mr-2 text-green-600"></i>
                                                    Punto de Origen
                                                </label>
                                                <AddressAutocomplete
                                                    value={rutaChofer?.origen || ""}
                                                    onChange={(address) => setRutaChofer({ ...rutaChofer, origen: address })}
                                                    placeholder="Ej: Calle Gran Vía 1, Zaragoza"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-flag-checkered mr-2 text-red-600"></i>
                                                    Punto de Destino
                                                </label>
                                                <AddressAutocomplete
                                                    value={rutaChofer?.destino || ""}
                                                    onChange={(address) => setRutaChofer({ ...rutaChofer, destino: address })}
                                                    placeholder="Ej: Plaza del Pilar, Zaragoza"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                    <i className="fa-solid fa-calendar-days mr-2 text-purple-600"></i>
                                                    Días de la Semana
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Lunes, Martes, Miércoles"
                                                    value={rutaChofer?.dias || ""}
                                                    onChange={(e) => setRutaChofer({ ...rutaChofer, dias: e.target.value })}
                                                    className="form-input"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                        <i className="fa-solid fa-clock mr-2 text-orange-500"></i>
                                                        Hora de Salida
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaChofer?.hora_salida || ""}
                                                        onChange={(e) => setRutaChofer({ ...rutaChofer, hora_salida: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                        <i className="fa-solid fa-clock mr-2 text-blue-500"></i>
                                                        Hora de Llegada
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaChofer?.hora_llegada || ""}
                                                        onChange={(e) => setRutaChofer({ ...rutaChofer, hora_llegada: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                        <i className="fa-solid fa-rotate-left mr-2 text-orange-500"></i>
                                                        Hora de Regreso
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaChofer?.hora_regreso || ""}
                                                        onChange={(e) => setRutaChofer({ ...rutaChofer, hora_regreso: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-blue-950 mb-1">
                                                        <i className="fa-solid fa-house mr-2 text-blue-500"></i>
                                                        Llegada del Regreso
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaChofer?.hora_llegada_regreso || ""}
                                                        onChange={(e) => setRutaChofer({ ...rutaChofer, hora_llegada_regreso: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-2 border-green-200 p-5 rounded-xl bg-green-50/50">
                                        <h5 className="font-bold text-xl text-green-700 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-map-pin"></i>
                                            Paradas de Pasajeros
                                        </h5>

                                        {paradasSeleccionadas.length === 0 ? (
                                            <p className="text-gray-500 italic text-sm mb-3">No hay paradas añadidas todavía</p>
                                        ) : (
                                            <div className="space-y-3 mb-4">
                                                {paradasSeleccionadas.map((parada, index) => (
                                                    <div key={index} className="flex gap-2 items-center">
                                                        <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <AddressAutocomplete
                                                                value={parada.direccion}
                                                                onChange={(address) => {
                                                                    const nuevasParadas = [...paradasSeleccionadas];
                                                                    nuevasParadas[index].direccion = address;
                                                                    setParadasSeleccionadas(nuevasParadas);
                                                                }}
                                                                placeholder={`Dirección de parada ${index + 1}`}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const nuevasParadas = paradasSeleccionadas.filter((_, i) => i !== index);
                                                                setParadasSeleccionadas(nuevasParadas);
                                                            }}
                                                            className="bg-red-500 text-white w-10 h-10 rounded-lg hover:bg-red-600 flex items-center justify-center shrink-0"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setParadasSeleccionadas([...paradasSeleccionadas, { pasajero_id: '', direccion: '' }])}
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm font-semibold"
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                            Agregar Parada
                                        </button>
                                    </div>

                                    <div className="flex justify-center gap-4 mt-4">
                                        <button
                                            onClick={guardarRutaChofer}
                                            className="bg-blue-950 px-8 py-3 font-bold rounded-xl text-white text-lg cursor-pointer shadow-md hover:bg-blue-900 flex items-center gap-2"
                                        >
                                            <i className="fa-solid fa-floppy-disk"></i>
                                            Guardar Ruta
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-400 px-8 py-3 font-bold rounded-xl text-white text-lg hover:bg-gray-500 cursor-pointer shadow-md flex items-center gap-2"
                                            onClick={cerrarModalRutasChofer}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Gestionar Ruta de Pasajero */}
                    {showRutasPasajeroModal && (
                        <div className="fixed inset-0 z-9998 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/50" onClick={cerrarModalRutasPasajero} />
                            <div className="relative z-9999 bg-white rounded-lg p-6 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto w-full mx-4">
                                <button onClick={cerrarModalRutasPasajero} className="absolute top-4 right-4 text-4xl text-gray-400 hover:text-gray-600 cursor-pointer">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>

                                <div className="flex flex-col gap-5 mt-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <i className="fa-solid fa-route text-4xl text-green-700"></i>
                                        <h2 className="text-green-700 text-4xl font-bold">Gestionar Ruta de Pasajero</h2>
                                    </div>

                                    <div className="border-2 border-green-200 p-5 rounded-xl bg-green-50/50">
                                        <h5 className="font-bold text-xl text-green-700 mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-map-location-dot"></i>
                                            Información de tu Ruta
                                        </h5>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-green-700 mb-1">
                                                    <i className="fa-solid fa-house mr-2 text-green-600"></i>
                                                    ¿Desde dónde sales? (Origen)
                                                </label>
                                                <AddressAutocomplete
                                                    value={rutaPasajero?.origen || ""}
                                                    onChange={(address) => setRutaPasajero({ ...rutaPasajero, origen: address })}
                                                    placeholder="Ej: Tu dirección de casa"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-green-700 mb-1">
                                                    <i className="fa-solid fa-briefcase mr-2 text-red-600"></i>
                                                    ¿A dónde vas? (Destino)
                                                </label>
                                                <AddressAutocomplete
                                                    value={rutaPasajero?.destino || ""}
                                                    onChange={(address) => setRutaPasajero({ ...rutaPasajero, destino: address })}
                                                    placeholder="Ej: Tu lugar de trabajo o estudio"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-green-700 mb-1">
                                                    <i className="fa-solid fa-calendar-days mr-2 text-purple-600"></i>
                                                    ¿Qué días necesitas transporte?
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Lunes, Martes, Miércoles, Jueves, Viernes"
                                                    value={rutaPasajero?.dias || ""}
                                                    onChange={(e) => setRutaPasajero({ ...rutaPasajero, dias: e.target.value })}
                                                    className="form-input"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-green-700 mb-1">
                                                        <i className="fa-solid fa-sun mr-2 text-orange-500"></i>
                                                        Hora de Salida (Ida)
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaPasajero?.hora_salida || ""}
                                                        onChange={(e) => setRutaPasajero({ ...rutaPasajero, hora_salida: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-green-700 mb-1">
                                                        <i className="fa-solid fa-clock mr-2 text-blue-500"></i>
                                                        Hora de Llegada (Ida)
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaPasajero?.hora_llegada || ""}
                                                        onChange={(e) => setRutaPasajero({ ...rutaPasajero, hora_llegada: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-green-700 mb-1">
                                                        <i className="fa-solid fa-moon mr-2 text-indigo-500"></i>
                                                        Hora de Regreso (Vuelta)
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaPasajero?.hora_regreso || ""}
                                                        onChange={(e) => setRutaPasajero({ ...rutaPasajero, hora_regreso: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-green-700 mb-1">
                                                        <i className="fa-solid fa-house mr-2 text-green-600"></i>
                                                        Llegada a Casa (Vuelta)
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={rutaPasajero?.hora_llegada_regreso || ""}
                                                        onChange={(e) => setRutaPasajero({ ...rutaPasajero, hora_llegada_regreso: e.target.value })}
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4 mt-4">
                                        <button
                                            onClick={guardarRutaPasajero}
                                            className="bg-green-600 px-8 py-3 font-bold rounded-xl text-white text-lg cursor-pointer shadow-md hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <i className="fa-solid fa-floppy-disk"></i>
                                            Guardar Ruta
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-400 px-8 py-3 font-bold rounded-xl text-white text-lg hover:bg-gray-500 cursor-pointer shadow-md flex items-center gap-2"
                                            onClick={cerrarModalRutasPasajero}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Profile;