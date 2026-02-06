'use client';

import { useMemo } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { getProxiedImageUrl } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";

// Tipo para pasajeros
interface Passenger {
    id: number;
    nombre: string;
    nacionalidad?: string;
    barrio?: string;
    img?: string;
}

export default function Dashboard() {
    const { user, loading: userLoading } = useAuth();
    const passengers = useFetchData('passengers') as Passenger[];
    const payments = useFetchData('payments');
    const ratings = useFetchData('ratings');

    const idDelChoferActual = user?.id || 1;

    // Total ingresos
    const totalIngresos = payments
        .filter((pago: { estado?: string }) => pago.estado?.toLowerCase() === "completado")
        .reduce((acc: number, curr: { pago?: number }) => acc + Number(curr.pago || 0), 0);

    // Total sin pagar
    const totalSinPagar = payments
        .filter((pago: { estado?: string }) => pago.estado?.toLowerCase() === "pendiente")
        .reduce((acc: number, curr: { pago?: number }) => acc + Number(curr.pago || 0), 0);

    // Total pasajeros
    const totalPasajeros = passengers.length;

    // Calificaciones
    const calificacionChofer = ratings
        .filter((r: { paraUsuarioId?: number; tipo?: string }) => r.paraUsuarioId === idDelChoferActual && r.tipo === "chofer");
    const sumaCalificaciones = calificacionChofer.reduce((total: number, r: { calificacion: number }) => total + r.calificacion, 0);
    const totalCalificaciones = calificacionChofer.length > 0 ? (sumaCalificaciones / calificacionChofer.length).toFixed(1) : 0;

    // Pasajeros activos - tomar los 3 primeros
    const pasajerosAleatorios = useMemo(() => {
        return passengers.slice(0, 3);
    }, [passengers]);

    // Top pasajeros (por pagos completados, o los primeros si no hay pagos)
    const topPasajeros = useMemo(() => {
        const pagosPorPasajero: Record<number, number> = {};
        payments.forEach((p: { estado?: string; pasajero_id?: number; pago?: number }) => {
            if (p.estado?.toLowerCase() === "completado") {
                const pid = Number(p.pasajero_id);
                if (!pid) return;
                pagosPorPasajero[pid] = (pagosPorPasajero[pid] || 0) + Number(p.pago || 0);
            }
        });
        
        const topConPagos = Object.entries(pagosPorPasajero)
            .map(([pasajeroId, total]) => ({ pasajeroId: Number(pasajeroId), total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3)
            .map(({ pasajeroId, total }) => {
                const pasajero = passengers.find(p => Number(p.id) === pasajeroId);
                return {
                    nombre: pasajero?.nombre || "Desconocido",
                    img: pasajero?.img || "/assets/imgPasajero1.jpg",
                    total,
                };
            });
        
        // Si no hay pagos, mostrar los primeros pasajeros con total 0
        if (topConPagos.length === 0 && passengers.length > 0) {
            return passengers.slice(0, 3).map(p => ({
                nombre: p.nombre || "Sin nombre",
                img: p.img || "/assets/imgPasajero1.jpg",
                total: 0,
            }));
        }
        
        return topConPagos;
    }, [payments, passengers]);

    // Últimos pasajeros
    const ultimosPasajeros = [...passengers]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);

    if (userLoading) {
        return (
            <section className="section-container">
                <p className="m-5 text-lg font-semibold">Cargando dashboard...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="section-container">
                <p className="m-5 text-lg font-semibold">Por favor inicia sesión para ver el dashboard</p>
            </section>
        );
    }

    return (
        <section className="section-container">
            <h2 className="section-h2">Dashboard</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 place-items-center gap-5 m-5">
                <div className="top-cards-container">
                    <span className="top-cards-span"><i className="fa-solid fa-dollar-sign"></i> Total Ingresos</span>
                    <strong className="top-cards-strong">{totalIngresos}€</strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span"><i className="fa-solid fa-users"></i> Total Pasajeros</span>
                    <strong className="top-cards-strong">{totalPasajeros}</strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span"><i className="fa-solid fa-ranking-star"></i> Calificación</span>
                    <strong className="top-cards-strong">{totalCalificaciones} <i className="fa-solid fa-star"></i></strong>
                </div>
                <div className="top-cards-container">
                    <span className="top-cards-span"><i className="fa-solid fa-money-bill-transfer"></i> Total Sin Pagar</span>
                    <strong className="top-cards-strong">{totalSinPagar}€</strong>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 m-5">
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Estadísticas</h3>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src="https://mexico.unir.net/wp-content/uploads/sites/6/2022/05/grafico-diagramas.jpg" 
                        alt="estadísticas"
                        className="object-cover w-full h-48" 
                    />
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Comentarios</h3>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src="https://img.freepik.com/vector-premium/concepto-calificacion-estrellas-resenas-clientes-gente-deja-comentarios-comentarios-estilo-moderno-dibujos-animados-planos_501813-117.jpg" 
                        alt="ratings" 
                        className="object-cover w-full h-48" 
                    />
                </div>
                <div className="mid-cards-container">
                    <h3 className="cards-h3">Pasajeros activos</h3>
                    <ul>
                        {pasajerosAleatorios.map((p) => (
                            <div key={p.id} className="bot-cards-map">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={getProxiedImageUrl(p.img) || "/assets/imgPasajero1.jpg"} 
                                    alt={p.nombre} 
                                    className="cards-img w-[60px] h-[60px] object-cover rounded-full" 
                                />
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={getProxiedImageUrl(img) || "/assets/imgPasajero1.jpg"} 
                                alt={nombre} 
                                className="cards-img w-[60px] h-[60px] object-cover rounded-full" 
                            />
                            <p className="cards-name">&nbsp;{nombre} -</p>
                            <p className="cards-p">&nbsp;{total}€</p>
                        </div>
                    ))}
                </div>
                <div className="bot-cards-container">
                    <h3 className="cards-h3">Últimos pasajeros</h3>
                    {ultimosPasajeros.map((p) => (
                        <div key={p.id} className="bot-cards-map">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={getProxiedImageUrl(p.img) || "/assets/imgPasajero1.jpg"} 
                                alt={p.nombre} 
                                className="cards-img w-[60px] h-[60px] object-cover rounded-full" 
                            />
                            <p className="cards-name">&nbsp;{p.nombre} -</p>
                            <p className="cards-p">&nbsp;{p.barrio || "Sin dirección"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}