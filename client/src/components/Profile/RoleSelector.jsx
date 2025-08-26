import { useState, useRef, useEffect } from "react";

import imgChofer1 from '../../assets/imgChofer1.png';
import imgChofer2 from '../../assets/imgChofer2.jpg';
import imgChofer3 from '../../assets/imgChofer3.png';

import imgVehiculo1 from '../../assets/imgVehiculo1.jpg';
import imgVehiculo2 from '../../assets/imgVehiculo2.jpeg';
import imgVehiculo3 from '../../assets/imgVehiculo3.jpg';

import imgPasajero1 from '../../assets/imgPasajero1.jpg';
import imgPasajero2 from '../../assets/imgPasajero2.jpg';
import imgPasajero3 from '../../assets/imgPasajero3.png';

const RoleSelector = ({ roles = [], fetchRoles }) => {
  
  const BACKEND_URL = "http://localhost:1234";

  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [formData, setFormData] = useState({});
  const [vehiculoData, setVehiculoData] = useState({});
  const [rutaData, setRutaData] = useState({});
  const [crearRolForm, setCrearRolForm] = useState(false);

  const choferImg = [imgChofer1, imgChofer2, imgChofer3];
  const vehiculoImg = [imgVehiculo1, imgVehiculo2, imgVehiculo3];
  const pasajeroImg = [imgPasajero1, imgPasajero2, imgPasajero3];

  const modalRef = useRef(null);

  useEffect(() => {
    if (crearRolForm) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [crearRolForm]);

  const handleActivar = async () => {
    if (!rolSeleccionado) return alert("Selecciona un rol");

    try {
      const payload = { tipo: rolSeleccionado };

      if (rolSeleccionado === "chofer") {
        payload.data = {
          ...formData,
          vehiculo: vehiculoData,
          rutas: Object.values(rutaData).some(v => v) ? [rutaData] : []
        };
      } else if (rolSeleccionado === "pasajero") {
        payload.data = {
          ...formData,
          rutas: Object.values(rutaData).some(v => v) ? [rutaData] : []
        };
      }

      const res = await fetch(`${BACKEND_URL}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Error al enviar datos al backend");

      const data = await res.json();
      console.log("Datos guardados en backend:", data);

      alert(`Rol ${rolSeleccionado} activado${payload.ruta ? " y ruta creada" : ""}`);

      await fetchRoles();

      setFormData({});
      setVehiculoData({});
      setRutaData({});
      setRolSeleccionado("");

      } catch (err) {
        alert("Error al activar el rol o crear ruta");
        console.error(err);
      }
    };

  const handleChange = (e, tipo) => {
    const { name, value } = e.target;
    if (tipo === "chofer" || tipo === "pasajero") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (tipo === "vehiculo") {
      setVehiculoData(prev => ({ ...prev, [name]: value }));
    } else if (tipo === "ruta") {
      setRutaData(prev => ({ ...prev, [name]: value }));
    }
  };

  const esChoferActivo = Array.isArray(roles) && roles.some(r => r.tipo === "chofer");
  const esPasajeroActivo = Array.isArray(roles) && roles.some(r => r.tipo === "pasajero");

  return (
    <div className="mt-5">
      <h3 className="text-2xl font-bold mb-2">Crear Rol</h3>
      <span className="text-sm text-red-600 mb-4">* Sólo se puede activar un chofer y un pasajero por cuenta *<br /></span>
      <button onClick={() => setCrearRolForm(true)} className="mt-4 p-2 text-2xl bg-orange-400 text-white rounded-lg hover:bg-green-600">
        <i className="fa-solid fa-user-plus"></i> Crear Nuevo Rol
      </button>

      <dialog ref={modalRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
      
      <h2 className="text-blue-950 text-center text-5xl font-semibold mt-10 sm:ml-5 mb-3"> Crear Nuevo Rol</h2>
        <div className="flex justify-center items-center">
          <select value={rolSeleccionado} onChange={e => { setRolSeleccionado(e.target.value); setFormData({}); setVehiculoData({}); setRutaData({}); }} className="p-2 border rounded mt-5">
            <option value="" className="min-[450px]:ml-20">-- Escoger rol --</option>
            {!esChoferActivo && <option value="chofer">Chofer</option>}
            {!esPasajeroActivo && <option value="pasajero">Pasajero</option>}
          </select>
        </div>
        
        <div className="mt-5 flex flex-col gap-2">
        {rolSeleccionado === "chofer" && (
          <>
            <div className="flex flex-col mt-3">
              <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Datos Personales</h4>
              <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion || ""} onChange={(e) => handleChange(e, "chofer")} className="form-input mt-2" />
              <input type="text" name="barrio" placeholder="Barrio" value={formData.barrio || ""} onChange={(e) => handleChange(e, "chofer")} className="form-input mt-2" />

              <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Chofer</h4>
              <div className="flex min-[450px]:ml-20 gap-3 mb-2">
                {choferImg.map((url, i) => (
                  <img key={i} src={url} alt={`Chofer ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${formData.img_chofer === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setFormData({...formData, img_chofer: url})} />
                ))}
              </div>
              <input type="text" name="img_chofer" placeholder="URL Chofer Externa" value={formData.img_chofer || ""} onChange={(e) => handleChange(e, "chofer")} className="form-input mt-2" />

              <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Datos del Vehículo</h4>
              <input type="text" name="marca" placeholder="Marca" value={vehiculoData.marca || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />
              <input type="text" name="modelo" placeholder="Modelo" value={vehiculoData.modelo || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />
              <input type="text" name="color" placeholder="Color" value={vehiculoData.color || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />
              <input type="text" name="matricula" placeholder="Matrícula" value={vehiculoData.matricula || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />
              <input type="number" name="plazas" placeholder="Plazas" value={vehiculoData.plazas || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />

              <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Vehículo</h4>
              <div className="flex min-[450px]:ml-20 gap-3 mb-2">
                {vehiculoImg.map((url, i) => (
                  <img key={i} src={url} alt={`Vehículo ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${vehiculoData.img_vehiculo === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setVehiculoData({...vehiculoData, img_vehiculo: url})} />
                ))}
              </div>
              <input type="text" name="img_vehiculo" placeholder="URL Vehículo Externa" value={vehiculoData.img_vehiculo || ""} onChange={(e) => handleChange(e, "vehiculo")} className="form-input mt-2" />
            </div>
          </>
          
        )}

        {rolSeleccionado === "pasajero" && (
          <div className="flex flex-col mt-3">
            <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Datos Personales</h4>
            <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={formData.nacionalidad || ""} onChange={e => handleChange(e, "pasajero")} className="form-input mt-2" />
            <input type="text" name="barrio" placeholder="Barrio" value={formData.barrio || ""} onChange={e => handleChange(e, "pasajero")} className="form-input mt-2" />

            <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Imagen del Pasajero</h4>
            <div className="flex min-[450px]:ml-20 gap-3 mb-2">
              {pasajeroImg.map((url, i) => (
                <img key={i} src={url} alt={`Pasajero ${i+1}`} className={`w-20 h-20 object-cover rounded cursor-pointer border-4 ${formData.img_pasajero === url ? "border-blue-500" : "border-gray-300"}`} onClick={() => setFormData({ ...formData, img_pasajero: url })} />
              ))}
            </div>
            <input type="text" name="img_pasajero" placeholder="URL Pasajero Externa" value={formData.img_pasajero || ""} onChange={e => handleChange(e, "pasajero")} className="form-input mt-2" />
          </div>
        )}

        {/* Datos de la ruta */}
        <h4 className="text-left text-blue-950 min-[450px]:ml-20 italic font-semibold mt-8 mb-4 text-4xl">Datos de la Ruta</h4>
        <input type="text" name="origen" placeholder="Origen" value={rutaData.origen || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2" />
        <input type="text" name="destino" placeholder="Destino" value={rutaData.destino || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2" />
        <input type="text" name="dias" placeholder="Días (Lun, Mar...)" value={rutaData.dias || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2" />
        <input type="time" name="hora_salida" placeholder="Hora salida" value={rutaData.hora_salida || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2 block" />
        <input type="time" name="hora_llegada" placeholder="Hora llegada" value={rutaData.hora_llegada || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2 block" />
        <input type="time" name="hora_regreso" placeholder="Hora regreso" value={rutaData.hora_regreso || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2 block" />
        <input type="time" name="hora_llegada_regreso" placeholder="Hora llegada regreso" value={rutaData.hora_llegada_regreso || ""} onChange={(e) => handleChange(e, "ruta")} className="form-input mt-2 block" />

        </div>

        <div className="flex justify-between sm:justify-center sm:gap-5 items-center mt-10">
          <button onClick={handleActivar} className="bg-blue-500 h-20 w-50 font-bold rounded-xl text-white text-xl cursor-pointer shadow-md" >
              Activar
          </button>
          <button type="button" className="bg-gray-500 h-20 w-50 font-bold rounded-xl text-white text-xl hover:text-gray-800 cursor-pointer shadow-md" onClick={() => setCrearRolForm(false)} >
              Cancelar
          </button>
        </div>
      </dialog>
    </div>
  )
}

export default RoleSelector;
