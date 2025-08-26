import { useState, useRef, useEffect } from "react";
import { useRoles } from "../../hooks/useRoles";
import RoleSelector from "../../components/Profile/RoleSelector.jsx";

import DriverSection from '../../components/HomeSections/DriverSection.jsx';
import PassengerSection from '../../components/HomeSections/PassengerSection.jsx';
import TripSection from '../../components/HomeSections/TripSection.jsx';

import imgChofer1 from '../../assets/imgChofer1.png';
import imgChofer2 from '../../assets/imgChofer2.jpg';
import imgChofer3 from '../../assets/imgChofer3.png';

import imgVehiculo1 from '../../assets/imgVehiculo1.jpg';
import imgVehiculo2 from '../../assets/imgVehiculo2.jpeg';
import imgVehiculo3 from '../../assets/imgVehiculo3.jpg';

import imgPasajero1 from '../../assets/imgPasajero1.jpg';
import imgPasajero2 from '../../assets/imgPasajero2.jpg';
import imgPasajero3 from '../../assets/imgPasajero3.png';


const Profile = () => {

    const BACKEND_URL = "http://localhost:1234"; 

    const { roles, loading, setRoles, fetchRoles } = useRoles();

    const choferImg = [imgChofer1, imgChofer2, imgChofer3];
    const vehiculoImg = [imgVehiculo1, imgVehiculo2, imgVehiculo3];
    const pasajeroImg = [imgPasajero1, imgPasajero2, imgPasajero3];

    const [user, setUser] = useState(null);

    const [editRoleModal,  setEditRoleModal] = useState(false);
    const [formRole, setFormRole] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/me`, {
            method: "GET",
            credentials: "include",
            });

            if (!res.ok) throw new Error("Error al obtener usuario logeado");
            const data = await res.json();
            setUser(data);
        } catch (err) {
            console.error(err.message);
        }
        };

        fetchUser();
    }, []);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const rolActual = roles.length > 0 ? roles.map(r => capitalize(r.tipo)).join(" y ") : "Ninguno";

    if (loading) return <p>Cargando roles...</p>;
    
    const handleDeleteRole = async (tipo) => {
        if (!window.confirm("¿Seguro que quieres eliminar este rol?")) return;

        try {
            const res = await fetch(`${BACKEND_URL}/roles/${tipo}`, {
            method: "DELETE",
            credentials: "include"
            });

            if (!res.ok) throw new Error("Error eliminando rol");

            await fetchRoles();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditRole = (rol) => {
        
        const rolInicial = {
            ...rol,
            direccion: rol.direccion || "",
            barrio: rol.barrio || "",
            img_chofer: rol.img_chofer || "",
            marca: rol.marca || "",
            modelo: rol.modelo || "",
            color: rol.color || "",
            matricula: rol.matricula || "",
            plazas: rol.plazas || "",
            img_vehiculo: rol.img_vehiculo || "",

            nacionalidad: rol.nacionalidad || "",
            img_pasajero: rol.img_pasajero || "",
        };

        setFormRole(rolInicial);
        setEditRoleModal(true);
        modalRef.current?.showModal();
    };

    const cerrarRoleModal = () => {
        modalRef.current?.close();
        setEditRoleModal(false);
        setFormRole(null);
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch(`${BACKEND_URL}/roles/${formRole.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formRole),
            credentials: "include",
            });

            if (!res.ok) throw new Error("Error editando rol");

            await fetchRoles();

            modalRef.current?.close();
            setEditRoleModal(false);
            setFormRole(null);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <section className="section-container">
            <h2 className="section-h2 sm:mb-0">Perfil</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center m-5 gap-10 bg-white p-5 rounded-3xl shadow-lg">
                <div>
                    <div className="flex justify-center items-center">
                        <img src="https://cdn-icons-png.flaticon.com/512/5580/5580993.png" alt="" className="w-100 h-100 object-cover rounded-full" />
                    </div>
                    <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold">{user ? (user.nombre || user.username) : "Cargando..."}</h2>
                    <h3 className="text-3xl sm:text-5xl lg:text-6xl mt-5 text-gray-500">Rol actual: {rolActual}</h3>
                    <h4 className="text-2xl sm:text-4xl lg:text-5xl mt-2 text-yellow-500">Calificación: Próximamente...</h4>

                    {/* Lista de roles con botón eliminar */}
                    <div className="mt-6">
                        <h3 className="text-2xl font-bold mb-3">Tus Roles</h3>
                        {roles.map((rol) => (
                        <div
                            key={rol.tipo}
                            className="flex items-center justify-between border p-3 rounded mb-2"
                        >
                            <span className="text-lg">{rol.tipo}</span>
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

                    <RoleSelector roles={roles} setRoles={setRoles} fetchRoles={fetchRoles}/>

                    <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                        {editRoleModal && formRole && (
                            <>
                                <div className="flex flex-col justify-center items-center gap-5 mt-5">
                                <h2 className="text-blue-950 text-5xl font-semibold mt-10 sm:ml-5">
                                    Editar Rol: {formRole.tipo}
                                </h2>
                                <form onSubmit={handleUpdateRole}>
                                    <div className="mt-5 flex flex-col gap-2">
                                    {formRole.tipo === "chofer" && (
                                        <>
                                            <div className="flex flex-col mt-3">
                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 mt-2.5 italic font-semibold mb-3 text-4xl">Datos Personales</h4>
                                                <label placeholder="advertencia" className="text-left min-[450px]:ml-20 mt-2.5 mb-2 sm:mr-20 text-red-600"><span>* Nota: Si dejas algún campo vacio, este sobreescribirá al campo anterior dejándolo en blanco. *</span></label>
                                                <input type="text" name="direccion" placeholder="Dirección" value={formRole.direccion} onChange={(e) => setFormRole({ ...formRole, direccion: e.target.value })} className="form-input mt-2" />
                                                <input type="text" name="barrio" placeholder="Barrio" value={formRole.barrio} onChange={(e) => setFormRole({ ...formRole, barrio: e.target.value })} className="form-input mt-2" />

                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Chofer</h4>
                                                <div className="flex min-[450px]:ml-20 gap-3 mb-2">
                                                    {choferImg.map((url, i) => (
                                                    <img key={i} src={url} alt={`Chofer ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${formRole.img_chofer === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setFormRole({...formRole, img_chofer: url})} />
                                                    ))}
                                                </div>
                                                <input type="text" name="img_chofer" placeholder="URL Imagen Chofer" value={formRole.img_chofer} onChange={(e) => setFormRole({ ...formRole, img_chofer: e.target.value })} className="form-input mt-2" />

                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Datos del Vehículo</h4>
                                                <input type="text" name="marca" placeholder="Marca" value={formRole.marca} onChange={(e) => setFormRole({ ...formRole, marca: e.target.value })} className="form-input mt-2" />
                                                <input type="text" name="modelo" placeholder="Modelo" value={formRole.modelo} onChange={(e) => setFormRole({ ...formRole, modelo: e.target.value })} className="form-input mt-2" />
                                                <input type="text" name="color" placeholder="Color" value={formRole.color} onChange={(e) => setFormRole({ ...formRole, color: e.target.value })} className="form-input mt-2" />
                                                <input type="text" name="matricula" placeholder="Matrícula" value={formRole.matricula} onChange={(e) => setFormRole({ ...formRole, matricula: e.target.value })} className="form-input mt-2" />
                                                <input type="number" name="plazas" placeholder="Plazas" value={formRole.plazas}  onChange={(e) => setFormRole({ ...formRole, plazas: e.target.value })} className="form-input mt-2" />

                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Vehículo</h4>
                                                <div className="flex min-[450px]:ml-20 gap-3 mb-2">
                                                    {vehiculoImg.map((url, i) => (
                                                    <img key={i} src={url} alt={`Vehículo ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${formRole.img_vehiculo === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setFormRole({...formRole, img_vehiculo: url})} />
                                                    ))}
                                                </div>
                                                <input type="text" name="img_vehiculo" placeholder="URL Imagen Vehículo" value={formRole.img_vehiculo} onChange={(e) => setFormRole({ ...formRole, img_vehiculo: e.target.value })} className="form-input mt-2" />
                                            </div>
                                        </>
                                    )}

                                    {formRole.tipo === "pasajero" && (
                                        <>
                                            <div className="flex flex-col mt-3">

                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 mt-2.5 italic font-semibold mb-3 text-4xl">Datos Personales</h4>
                                                <label placeholder="advertencia" className="text-left min-[450px]:ml-20 mt-2.5 sm:mr-20 text-red-600"><span>* Nota: Si dejas algún campo vacio, este sobreescribirá al campo anterior dejándolo en blanco. *</span></label>
                                                <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={formRole.nacionalidad || ""} onChange={(e) => setFormRole({ ...formRole, nacionalidad: e.target.value })} className="form-input mt-2" />
                                                <input type="text" name="barrio" placeholder="Barrio" value={formRole.barrio || ""} onChange={(e) => setFormRole({ ...formRole, barrio: e.target.value })} className="form-input mt-2" />

                                                <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Pasajero</h4>
                                                <div className="flex min-[450px]:ml-20 gap-3 mb-2">
                                                {pasajeroImg.map((url, i) => (
                                                    <img key={i} src={url} alt={`Pasajero ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${formRole.img_pasajero === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setFormRole({ ...formRole, img_pasajero: url })} />
                                                ))}
                                                </div>
                                                <input type="text" name="img_pasajero" placeholder="URL Pasajero Externa"  value={formRole.img_pasajero || ""} onChange={(e) => setFormRole({ ...formRole, img_pasajero: e.target.value })} className="form-input mt-2 mb-5" />
                                            </div>
                                        </>           
                                    )}
                                    </div>

                                    <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-10">
                                        <button type="submit" className="bg-blue-950 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md" >
                                            Guardar
                                        </button>
                                        <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={cerrarRoleModal} >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                                </div>
                            </>
                        )}
                        <button onClick={cerrarRoleModal} className="absolute top-4 right-4 text-6xl text-gray-400 hover:text-gray-600 active:text-primary cursor-pointer">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </dialog>

                </div>
            </div>
        </section>
    )
}

export default Profile;