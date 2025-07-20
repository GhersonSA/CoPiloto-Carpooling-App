export const guestRoutes = [
    {
        id: 1,
        origen: "Las Fuentes",
        destino: "Plaza",
        dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        horaSalida: "13:00",
        horaLlegada: "13:30",
        horaRegreso: "22:00",
        horaLlegadaRegreso: "22:30",
        choferId: 1,
        pasajeros: [1, 2]
    },
    {
        id: 2,
        origen: "Delicias",
        destino: "Malpica",
        dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        horaSalida: "05:00",
        horaLlegada: "05:30",
        horaRegreso: "14:00",
        horaLlegadaRegreso: "14:30",
        choferId: 2,
        pasajeros: [3, 4]
    },
    {
        id: 3,
        origen: "San José",
        destino: "Centro",
        dias: ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        horaSalida: "21:00",
        horaLlegada: "21:30",
        horaRegreso: "06:00",
        horaLlegadaRegreso: "06:30",
        choferId: 3,
        pasajeros: [5, 6, 7]
    }
];

export const adminRoutes = [];

export const userRoutes = [];