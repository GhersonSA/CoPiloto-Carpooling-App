import { Route } from './Route';

export interface Driver {
    id: number;
    nombre?: string;
    username?: string;
    direccion?: string;
    barrio?: string;
    img_chofer?: string;
    vehiculo?: {
        marca?: string;
        modelo?: string;
        color?: string;
        matricula?: string;
        plazas?: number;
        img_vehiculo?: string;
    };
    routes?: Array<{
        origen: string;
        destino: string;
    }>;
}

export interface DriverCardProps extends Driver {
    rutas?: Route[];
    onClick?: () => void;
}