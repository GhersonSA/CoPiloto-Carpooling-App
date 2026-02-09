'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useToast } from '@/components/Toast';

const LoginHero = () => {
    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openModal = () => dialogRef.current?.showModal();
    const closeModal = () => {
        dialogRef.current?.close();
        setError('');
        setNombre('');
        setUsername('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isRegisterMode) {
            // REGISTRO
            if (!nombre || !username || !email || !password) {
                setError('Por favor, completa todos los campos.');
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nombre, username, email, password }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Error al registrarse');
                }

                toast.success('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
                setIsRegisterMode(false);
                setNombre('');
                setUsername('');
                setEmail('');
                setPassword('');
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Error al registrarse';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // LOGIN
            if (!email || !password) {
                setError('Por favor, completa todos los campos.');
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Credenciales inválidas');
                }

                closeModal();
                router.push('/home');
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Credenciales inválidas';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signIn('google', { callbackUrl: '/home' });
        } catch {
            setError('Error al iniciar sesión con Google');
        }
    };

    const handleGuest = async () => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: 'guest@demo.com',
                    password: 'guest',
                    provider: 'local',
                }),
            });

            if (res.ok) {
                closeModal();
                router.push('/home');
            } else {
                toast.error('Error al entrar como invitado');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al entrar como invitado');
        }
    };

    return (
        <section className="h-dvh overflow-hidden flex flex-col">
            <header className="flex items-center justify-between h-20 px-6 bg-white shadow-md md:px-8">
                <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between px-6 md:px-8">
                    <a href="https://ghersonsa.com/" target="_blank" aria-label="GhersonSA" className="text-2xl font-bold">
                        <Image src="/assets/G-black.png" alt="GhersonSA logo" width={50} height={50} className="inline-block transition hover:rotate-[-10deg] duration-300 ease cursor-pointer" />
                    </a>
                    <div className="flex gap-8 md:gap-10 items-center">
                        <button onClick={openModal} className="hidden md:flex text-gray-500 hover:text-gray-800 hover:underline cursor-pointer text-xl">
                            Iniciar Sesión
                        </button>
                        <a 
                            href="https://expo.dev/artifacts/eas/wyvtJbgN3rnBaPAfpGJSdy.apk" 
                            download
                            className="hidden md:flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition duration-300 text-lg font-semibold"
                        >
                            <i className="fa-brands fa-android text-xl"></i>
                            Descargar App
                        </a>
                        <a href="https://www.linkedin.com/in/gherson-sa/" target="_blank" aria-label="LinkedIn" className="social-button">
                            <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                        <a href="https://github.com/GhersonSA" target="_blank" aria-label="GitHub" className="social-button">
                            <i className="fa-brands fa-github"></i>
                        </a>
                    </div>
                </div>
            </header>
            <section className="bg-white/60 flex-1 relative flex flex-col items-center justify-center text-center px-4">
                <div className="absolute inset-0">
                    <Image src="/assets/city-2.jpg" alt="City_Hero" fill className="object-cover opacity-30 pointer-events-none" />
                </div>
                <div className="z-10 max-w-screen-2xl">
                    <Image src="/assets/CoPiloto-logo-1.png" alt="CoPiloto_Hero" width={200} height={200}
                        style={{ objectFit: "cover", width: '900px', height: 'auto' }}
                        className="pointer-events-none mx-auto" />
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
                        <a 
                            href="https://expo.dev/artifacts/eas/wyvtJbgN3rnBaPAfpGJSdy.apk" 
                            download="CoPiloto-Carpooling-App.apk"
                            className="md:hidden bg-green-600 text-white w-md px-10 py-4 rounded-2xl shadow-md hover:bg-green-700 transition duration-300 text-2xl font-semibold flex items-center justify-center gap-3"
                        >
                            <i className="fa-brands fa-android text-2xl"></i>
                            Descargar App
                        </a>
                    </div>
                </div>
                <dialog ref={dialogRef} className="rounded-lg p-6 shadow-xl max-w-3xl h-4/4 w-full backdrop:bg-black/50 m-auto" closedby="any">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center w-full h-full">
                        <h2 className="text-primary text-6xl font-bold mb-2">{isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}</h2>
                        <p className="text-xl italic">{isRegisterMode ? 'Crea una cuenta nueva' : 'Encuentra tu recorrido ideal con CoPiloto'}</p>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        {isRegisterMode && (
                            <>
                                <label className="text-left md:text-2xl min-[450px] ml-20 mt-2.5"><span>Nombre</span><span className="text-red-600">*</span></label>
                                <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="form-input-login" required />
                                <label className="text-left md:text-2xl min-[450px] ml-20 mt-2.5"><span>Usuario</span><span className="text-red-600">*</span></label>
                                <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} className="form-input-login" required />
                                <label className="text-left md:text-2xl min-[450px] ml-20 mt-2.5"><span>Correo Electrónico</span><span className="text-red-600">*</span></label>
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="form-input-login" required />
                            </>
                        )}
                        {!isRegisterMode && (
                            <>
                                <label className="text-left md:text-2xl min-[450px] ml-20 mt-2.5"><span>Correo Electrónico</span><span className="text-red-600">*</span></label>
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="form-input-login" required />
                            </>
                        )}
                        <label className="text-left md:text-2xl min-[450px] ml-20 mt-2.5"><span>Contraseña</span><span className="text-red-600">*</span></label>
                        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="form-input-login" required />
                        <button type="submit" disabled={isLoading} className="bg-primary text-white py-2 rounded hover:bg-blue-600 text-xl h-13 min-[450px] mx-20 mt-5 cursor-pointer">
                            {isLoading ? 'Cargando...' : (isRegisterMode ? 'Registrarse' : 'Iniciar sesión')}
                        </button>
                        <button
                            onClick={handleGoogleSignIn}
                            className="bg-white text-gray-700 px-2 py-2 h-15 min-[450px] mx-20 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </button>
                        <button type="button" onClick={handleGuest} className="bg-gray-300 text-black py-2 rounded hover:bg-gray-400 text-xl h-13 min-[450px] mx-20 cursor-pointer">
                            Entrar como invitado
                        </button>
                        <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-blue-600 py-2 rounded hover:underline text-xl h-13 min-[450px] mx-20 mt-4 cursor-pointer">
                            {isRegisterMode ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Registrarse'}
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
    );
};

export default LoginHero;