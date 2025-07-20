import { useRoleData } from "../../hooks/useRoleData";

const Dashboard = () => {

    const { passengers, payments, ratings } = useRoleData();

    /* TOTAL INGRESOS */
    const idDelChoferActual = 1; {/* Hasta crear el login luego user.id */}
    const totalIngresos = payments
        .filter((pago) => pago.choferId === idDelChoferActual)
        .flatMap((pago) => pago.pagos)
        .filter((p) => p.estado === "Completado")
        .reduce((acc, curr) => acc + curr.pago, 0);

    /* TOTAL PASAJEROS */
    const totalPasajeros = passengers.length;

    /* CALIFICACIONES */
    const calificacionChofer = ratings
        .filter((r) => r.paraUsuarioId === idDelChoferActual && r.tipo === "chofer");
    
    const sumaCalificaciones = calificacionChofer.reduce((total, r) => total + r.calificacion, 0);

    const totalCalificaciones = calificacionChofer.length > 0 ? (sumaCalificaciones / calificacionChofer.length).toFixed(1) : 0;

    /* COMENTARIOS */
    const ultimosComentarios = [...ratings]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);

    /* PASAJEROS ACTIVOS */
    const pasajerosActivos = passengers.filter(p => p.activo);

    /* TOP PASAJEROS */
    const pagosDelChofer = payments.filter(pago => pago.choferId === idDelChoferActual);

    const pagosPorPasajero = {};

    pagosDelChofer.forEach(({ pasajeroId, pagos }) => {
    pagos.forEach(({ pago, estado }) => {
        if (estado === "Completado") {
        if (!pagosPorPasajero[pasajeroId]) {
            pagosPorPasajero[pasajeroId] = 0;
        }
        pagosPorPasajero[pasajeroId] += pago;
        }
    });
    });

    const topPagos = Object.entries(pagosPorPasajero)
    .map(([pasajeroId, total]) => ({
        pasajeroId: Number(pasajeroId),
        total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

    const topPasajeros = topPagos.map(({ pasajeroId, total }) => {
    const pasajero = passengers.find(p => p.id === pasajeroId);
    return {
        img: pasajero?.img,
        nombre: pasajero?.nombre || "Desconocido",
        total,
    };
    });

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
                    <span></span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 m-5">
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Estadísticas</h3>
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Comentarios</h3>
                    {ultimosComentarios.map(c => (
                        <div key={c.id} className="flex items-center text-black font-semibold mt-4 sm:ml-4">
                            <p className="text-2xl sm:text-3xl italic">"{c.comentario}"</p>
                        </div>
                    ))}
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Pasajeros activos</h3>
                    <ul>
                        {pasajerosActivos.map((p) => (
                            <div key={p.id} className="bot-cards-map">
                                <img src={p.img} alt={p.nombre} className="cards-img" />
                                <p className="cards-name">&nbsp;{p.nombre} -</p>
                                <p className="cards-p">&nbsp;{p.direccion}</p> 
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
                            <img src={p.img} alt={p.nombre} className="cards-img" />
                            <p className="cards-name">&nbsp;{p.nombre} -</p>
                            <p className="cards-p">&nbsp;{p.direccion}</p>
                        </div>    
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Dashboard;