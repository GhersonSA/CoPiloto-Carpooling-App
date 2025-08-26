import { useState, useEffect } from "react";
import { useFetchData } from "../../hooks/useFetchData";

const Dashboard = () => {

    const BACKEND_URL = "http://localhost:1234"; 

    const passengers = useFetchData("passengers");
    const payments = useFetchData("payments");
    const ratings = useFetchData("ratings");

    const [user, setUser] = useState(null);

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

    if (!user) {
        return <p className="m-5 text-lg font-semibold">Cargando dashboard...</p>;
    }

    const idDelChoferActual = user.id || 1; {/* Hasta crear el login luego user.id */}
    /* TOTAL INGRESOS */
    const totalIngresos = payments?.length > 0
    ? payments
        .filter(pago => pago.estado?.toLowerCase() === "completado")
        .reduce((acc, curr) => acc + Number(curr.pago || 0), 0)
    : 0;

    /* TOTAL SIN PAGAR */
    const totalSinPagar = payments?.length > 0
    ? payments
        .filter(pago => pago.estado?.toLowerCase() === "pendiente")
        .reduce((acc, curr) => acc + Number(curr.pago || 0), 0)
    : 0;

    /* TOTAL PASAJEROS */
    const totalPasajeros = passengers.length;

    /* CALIFICACIONES */
    const calificacionChofer = ratings
        .filter((r) => r.paraUsuarioId === idDelChoferActual && r.tipo === "chofer");
    
    const sumaCalificaciones = calificacionChofer.reduce((total, r) => total + r.calificacion, 0);

    const totalCalificaciones = calificacionChofer.length > 0 ? (sumaCalificaciones / calificacionChofer.length).toFixed(1) : 0;

    /* COMENTARIOS */
    /* const ultimosComentarios = [...ratings]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3); */

    /* PASAJEROS ACTIVOS */
    // const pasajerosActivos = passengers.filter(p => p.activo);
    
    // Seleccionar 3 pasajeros activos aleatorios
    const pasajerosAleatorios = passengers.length > 0
        ? [...passengers]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
        : [];

    /* TOP PASAJEROS */
    const topPasajeros = (payments.length && passengers.length)
    ? (() => {
        // Sumar pagos por pasajero
        const pagosPorPasajero = {};
        payments.forEach(p => {
            if (p.estado?.toLowerCase() === "completado") {
            const pid = Number(p.pasajero_id);
            if (!pid) return; // Ignorar pagos sin pasajero_id
            pagosPorPasajero[pid] = (pagosPorPasajero[pid] || 0) + Number(p.pago || 0);
            }
        });

        // Convertir a array y ordenar
        return Object.entries(pagosPorPasajero)
            .map(([pasajeroId, total]) => ({ pasajeroId: Number(pasajeroId), total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3)
            .map(({ pasajeroId, total }) => {
            const pasajero = passengers.find(p => Number(p.id) === pasajeroId);
            return {
                nombre: pasajero?.nombre || "Desconocido",
                img: pasajero?.img || "https://cdn-icons-png.flaticon.com/512/5580/5580993.png",
                total,
            };
            });
        })()
    : [];
    /* ÚLTIMOS PASAJEROS */
    const ultimosPasajeros = [...passengers]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);


    return (
        <section className="section-container">
            <h2 className="section-h2">Dashboard</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 place-items-center gap-5 m-5">
                <div className="top-cards-container">
                    <span className="top-cards-span">Total Ingresos</span>
                    <strong className="top-cards-strong">{totalIngresos}€</strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span">Total Pasajeros</span>
                    <strong className="top-cards-strong">{totalPasajeros}</strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span">Calificación</span>
                    <strong className="top-cards-strong">{totalCalificaciones} ⭐</strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span">Total Sin Pagar</span>
                    <strong className="top-cards-strong">{totalSinPagar}€</strong>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 m-5">
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Estadísticas</h3>
                    <img src="https://mexico.unir.net/wp-content/uploads/sites/6/2022/05/grafico-diagramas.jpg" alt="estadísticas" className="object-cover"/>
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Comentarios</h3>
                    {/*{ultimosComentarios.map(c => (
                        <div key={c.id} className="flex items-center text-black font-semibold mt-4 sm:ml-4">
                            <p className="text-2xl sm:text-3xl italic">"{c.comentario}"</p>
                        </div>
                    ))}*/}
                    <img src="https://img.freepik.com/vector-premium/concepto-calificacion-estrellas-resenas-clientes-gente-deja-comentarios-comentarios-estilo-moderno-dibujos-animados-planos_501813-117.jpg" alt="ratings" className="object-cover"/>
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Pasajeros activos</h3>
                    <ul>
                        {pasajerosAleatorios.map((p) => (
                            <div key={p.id} className="bot-cards-map">
                                <img src={p.img || "https://cdn-icons-png.flaticon.com/512/5580/5580993.png"} alt={p.nombre} className="cards-img" />
                                <p className="cards-name">&nbsp;{p.nombre} -</p>
                                <p className="cards-p">&nbsp;{p.barrio || "Sin dirección"}</p> 
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 m-5">
                <div className="bot-cards-container">
                    <h3 className="cards-h3">Top Pasajeros</h3>
                    {topPasajeros.map(({ nombre, img, total }) => (
                        <div key={nombre} className="bot-cards-map">
                            <img src={img} alt={nombre} className="cards-img" />
                            <p className="cards-name">&nbsp;{nombre} -</p>
                            <p className="cards-p">&nbsp;{total}€</p>
                        </div>
                    ))}
                </div>
                <div className="bot-cards-container">
                    <h3 className="cards-h3">Últimos pasajeros</h3>
                    {ultimosPasajeros.map((p) => (
                        <div key={p.id} className="bot-cards-map">
                            <img src={p.img || "https://cdn-icons-png.flaticon.com/512/5580/5580993.png"} alt={p.nombre} className="cards-img" />
                            <p className="cards-name">&nbsp;{p.nombre} -</p>
                            <p className="cards-p">&nbsp;{p.barrio || "Sin dirección"}</p>
                        </div>    
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Dashboard;