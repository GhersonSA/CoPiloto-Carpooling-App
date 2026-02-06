export interface Trip {
    id: number;
    origen: string;
    destino: string;
    img?: string;
    hora_salida: string;
    hora_regreso: string;
}

export interface TripCardProps {
    img?: string;
    nombre: string;
    onClick?: () => void;
}