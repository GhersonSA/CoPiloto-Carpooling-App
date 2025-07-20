import {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogin, isAuthenticated } from '../../utils/auth';

import logo from '../../assets/CoPiloto-logo-1.png'
import city from '../../assets/city-2.jpg';
import gLogo from '../../assets/g-black.png';

const LoginHero = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const navigate = useNavigate();
    const dialogRef = useRef(null);


    const openModal = () => dialogRef.current?.showModal();
    const closeModal = () => dialogRef.current?.close();

    useEffect(() => {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const adminExists = users.some(user => user.username === "admin");

        if (!adminExists) {
            users.push({username: "admin", password: "admin123", role: "user"});
            localStorage.setItem("users", JSON.stringify(users));
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/home");
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (!username || !password) {
            alert("Por favor, completa los campos.");
            return;
        }

        if (isRegisterMode) {
            const exists = users.find(u => u.username === username);
            if (exists) { return alert("El usuario ya existe."); }

            users.push({ username, password, role: "admin" });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Usuario registrado con exito.");
            setIsRegisterMode(false);

            closeModal();
            navigate("/home");
            return;
        }

        const found = users.find(u => u.username === username && u.password === password);
        if (!found) return alert("Credenciales incorrectas.");

        if (username === "admin" && password === "admin123") {
            handleLogin("admin", "admin");
            closeModal();
            navigate("/home");
        } else {
            handleLogin(found.role, found.username);
        }

        closeModal();
        navigate("/home");

    };

    const handleGuest = () => {
        handleLogin("guest", "Modo Invitado");
        closeModal();
        navigate("/home");
    }

    return (
        <section className="h-screen overflow-hidden flex flex-col">
            <header className="flex items-center justify-between h-20 px-6 bg-white shadow-md md:px-8">
                <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between px-6 md:px-8">
                    <a href="https://ghersonsa.com/" target="_blank" arial-label="GhersonSA" className="text-2xl font-bold">
                        <img src={gLogo} alt="GhersonSA logo" className="inline-block w-14 h-14 transition hover:rotate-[-10deg] duration-300 ease cursor-pointer" />
                    </a>
                    <div className="flex gap-8 md:gap-10 items-center">
                        <button onClick={openModal}  className="hidden md:flex text-gray-500 hover:text-gray-800 hover:underline cursor-pointer text-xl">
                            Iniciar Sesion
                        </button>
                        <a href="https://www.linkedin.com/in/gherson-sa/" target="_blank" aria-label="LinkedIn" className="social-button">
                            <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                        <a href="https://github.com/GhersonSA" target="_blank" aria-label="GitHub" className="social-button">
                            <i className="fa-brands fa-github"></i>
                        </a>
                    </div>
                </div>
            </header>
            <section className="flex-1 relative flex flex-col items-center justify-center text-center px-4">
                <div className="absolute inset-0">
                    <img src={city} alt="" className="w-full h-full object-cover opacity-30 pointer-events-none" />
                </div>

                <div className="z-10 max-w-screen-2xl">
                    <img src={logo} alt="" className="pointer-events-none"/>
                    <p className="text-3xl sm:text-6xl text-blue-950 italic mb-6 mt-6 font-semibold font-secondary">
                        Tu compañero de ruta
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-10">
                        <button onClick={openModal} className="bg-white text-gray-800 w-md px-10 py-4 rounded-2xl shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-300 border border-gray-400 text-2xl font-semibold cursor-pointer">
                            Empezar
                        </button>
                        <button onClick={handleGuest} className="bg-blue-950 text-white w-md px-10 py-4 rounded-2xl shadow-md hover:bg-blue-600 transition duration-300 text-2xl italic cursor-pointer">
                            Modo Invitado
                        </button>
                    </div>
                </div>

                <dialog ref={dialogRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 lg:h-3/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center w-full h-full">
                        <h2 className="text-primary text-6xl font-bold mb-2">{isRegisterMode ? "Registrarse" : "Iniciar Sesión"}</h2>
                        <p className="text-xl italic">{isRegisterMode ? "Crea una cuenta nueva" : "Encuentra tu recorrido ideal con CoPiloto"}</p>

                        <label placeholder="Ingresa tu nombre" className="text-left min-[450px]:ml-20 mt-2.5"><span>Nombre</span><span className="text-red-600">*</span></label>
                        <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" required />

                        <label placeholder="Ingresa tu contraseña" className="text-left min-[450px]:ml-20 mt-2.5"><span>Contraseña</span><span className="text-red-600">*</span></label>
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />

                        <button type="submit" className="bg-primary text-white py-2 rounded hover:bg-blue-600 text-xl h-13 min-[450px]:mx-20 mt-5 cursor-pointer">
                            {isRegisterMode ? "Registrarse" : "Iniciar sesión"}
                        </button>

                        <button type="button" onClick={handleGuest} className="bg-gray-300 text-black py-2 rounded hover:bg-gray-400 text-xl h-13 min-[450px]:mx-20 cursor-pointer">
                            Entrar como invitado
                        </button>

                        <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} className=" text-blue-600 py-2 rounded hover:underline text-xl h-13 min-[450px]:mx-20 mt-4 cursor-pointer">
                            {isRegisterMode ? "¿Ya tienes cuenta? Iniciar sesión" : "¿No tienes cuenta? Registrarse"}
                        </button>

                        <button type="button" onClick={closeModal} className="text-xl text-gray-500 hover:text-gray-800 underline cursor-pointer">
                            Cancelar
                        </button>

                        <button onClick={closeModal} className="absolute top-4 right-4 text-6xl text-gray-400 hover:text-gray-600 active:text-primary cursor-pointer">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </form>
                </dialog>
            </section>
            <footer className="h-10 text-center text-md flex items-center justify-center text-gray-600 shadow-inherit bg-white">
                © CoPiloto by GhersonSA. Todos los derechos reservados.
            </footer>            
        </section>
    )
}

export default LoginHero;