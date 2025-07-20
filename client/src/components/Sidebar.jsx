import { useState } from "react";
import { NavLink } from "react-router";
import { useLogout } from "../hooks/useLogout";
import logo from "../assets/CoPiloto-logo-6.png";

const Sidebar = () => {
  const [showModal, setShowModal] = useState(false);

  const logout = useLogout();

  return (
      <aside className="hidden h-full bg-blue-950 z-20 lg:flex lg:flex-col lg:items-center space-y-6 text-xl w-md">
        <header className="shadow-md h-20 w-full flex items-center justify-center">
          <a href="">
            <img src={logo} alt="" className="w-80 py-2"/>
          </a>
        </header>

        <nav className="flex flex-col justify-between h-full w-full text-white">
          <ul className="mt-4">
            <NavLink to="/home">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-house px-4"></i>
                  <span>Inicio</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/dashboard">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-chart-line px-4"></i>
                  <span>Dashboard</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/passenger">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-users px-4"></i>
                  <span>Pasajeros</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/travel">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-road px-4"></i>
                  <span>Viajes</span>
                </li>
              )}
            </NavLink>

            <NavLink to="/payments">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-money-check px-4"></i>
                  <span>Pagos</span>
                </li>
              )}
            </NavLink>
            
            <NavLink to="/stars">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-medal px-4"></i>
                  <span>Calificaciones</span>
                </li>
              )}
            </NavLink>

           <NavLink to="/profile">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-regular fa-circle-user px-4"></i>
                  <span>Tú perfil</span>
                </li>
              )}
            </NavLink>
          </ul>

          <ul className="mb-4">
            <NavLink to="/settings">
              {({ isActive }) => (
                <li className={`aside-botton ${isActive ? "bg-white text-blue-950" : "text-white hover:bg-blue-950"}`}>
                  <i className="fa-solid fa-gear px-4"></i>
                  <span>Ajustes</span>
                </li>
              )}
            </NavLink>
            <li className="aside-botton" onClick={() => setShowModal(true)}>
                <i className="fa-solid fa-right-from-bracket px-4"></i>
                <span>Cerrar Sesión</span>
            </li>

            {showModal && (
              <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg text-center space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">¿Cerrar sesión?</h2>
                  <p className="text-gray-600">¿Estás seguro de que deseas cerrar sesión?</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        logout();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Sí, cerrar
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ul>
        </nav>
      </aside>
  )
}


export default Sidebar;