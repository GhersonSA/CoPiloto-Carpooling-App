export interface User {
  id: number;
  nombre: string;
  email: string;
  image?: string;
  password?: string;
  createdAt?: string;
}

export interface Role {
  id: number;
  tipo: 'chofer' | 'pasajero' | 'admin';
  activo: boolean;
  user_id: number;
}

export interface Driver {
  id: number;
  user_id: number;
  nombre: string;
  img_chofer?: string;
  direccion?: string;
  barrio?: string;
  telefono?: string;
  email?: string;
}

export interface DriverProfile {
  id: number;
  user_id: number;
  nombre: string;
  img_chofer?: string;
  direccion?: string;
  barrio?: string;
  telefono?: string;
  vehiculo?: Vehicle;
}

export interface Passenger {
  id: number;
  user_id?: number;
  nombre: string;
  img?: string;
  img_pasajero?: string;
  barrio?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface PassengerProfile {
  id: number;
  user_id: number;
  nombre: string;
  img_pasajero?: string;
  barrio?: string;
  telefono?: string;
}

export interface Vehicle {
  id: number;
  driver_id?: number;
  marca: string;
  modelo: string;
  color: string;
  matricula: string;
  plazas: number;
  img_vehiculo?: string;
}

export interface Route {
  id: number;
  chofer_id: number;
  origen: string;
  destino: string;
  hora_salida: string;
  hora_llegada: string;
  dias: string;
  plazas_disponibles: number;
  precio?: number;
  img_chofer?: string;
  chofer_nombre?: string;
  origen_lat?: number;
  origen_lng?: number;
  destino_lat?: number;
  destino_lng?: number;
}

export interface RoutePassenger {
  id: number;
  route_id: number;
  passenger_id: number;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
}

export interface Payment {
  id: number;
  pasajero_id: number;
  chofer_id: number;
  ruta_id?: number;
  monto: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  fecha: string;
  metodo_pago?: string;
}

export interface Rating {
  id: number;
  evaluador_id: number;
  evaluado_id: number;
  puntuacion: number;
  comentario?: string;
  fecha: string;
}

export interface Trip {
  id: number;
  ruta_id: number;
  fecha: string;
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  pasajeros?: Passenger[];
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  RouteDetails: { routeId: number };
  PassengerDetails: { passengerId: number };
  EditProfile: undefined;
  CreateRoute: undefined;
  CreatePassenger: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Passengers: undefined;
  Payments: undefined;
  Profile: undefined;
};