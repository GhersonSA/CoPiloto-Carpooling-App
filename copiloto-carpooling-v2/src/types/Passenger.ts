import { Route } from './Route';

export interface Passenger {
    id: number;
    nombre?: string;
    username?: string;
    img_pasajero?: string;
    nacionalidad?: string;
    barrio?: string;
    trabajo?: string;
}

export interface PassengerCardProps extends Passenger {
  rutas?: Route[];
  onClick?: () => void;
}