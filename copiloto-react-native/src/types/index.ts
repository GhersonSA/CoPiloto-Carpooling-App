// ── User ──
export interface User {
  id: number;
  nombre: string;
  username: string;
  email: string;
  provider?: string;
  role?: string;
}

// ── Roles ──
export type RolTipo = 'chofer' | 'pasajero';

export interface Role {
  id: number;
  user_id: number;
  tipo: RolTipo;
  activo: boolean;
  creado_en?: string;
}

// ── Driver ──
export interface DriverProfile {
  id: number;
  role_id?: number;
  direccion?: string;
  barrio?: string;
  telefono?: string;
  img_chofer?: string;
}

export interface Driver {
  id: number;
  nombre?: string;
  username?: string;
  direccion?: string;
  barrio?: string;
  img_chofer?: string;
  telefono?: string;
  vehiculo?: Vehicle;
  routes?: { origen: string; destino: string }[];
}

// ── Vehicle ──
export interface Vehicle {
  id: number;
  driver_profile_id?: number;
  marca: string;
  modelo: string;
  color: string;
  matricula: string;
  plazas: number;
  img_vehiculo?: string;
}

// ── Passenger ──
export interface PassengerProfile {
  id: number;
  role_id?: number;
  nacionalidad?: string;
  barrio?: string;
  telefono?: string;
  img_pasajero?: string;
}

export interface Passenger {
  id: number;
  nombre?: string;
  username?: string;
  img_pasajero?: string;
  nacionalidad?: string;
  barrio?: string;
  telefono?: string;
}

// ── Route ──
export interface Route {
  id: number;
  chofer_id: number;
  origen: string;
  destino: string;
  dias?: string;
  hora_salida?: string;
  hora_llegada?: string;
  hora_regreso?: string;
  hora_llegada_regreso?: string;
  chofer_nombre?: string;
  img_chofer?: string;
  paradas?: Parada[];
}

export interface Parada {
  pasajero_id?: string | number;
  direccion: string;
}

// ── Route Passengers ──
export interface RoutePassenger {
  id: number;
  pasajero_id: number;
  origen?: string;
  destino?: string;
  dias?: string;
  hora_salida?: string;
  hora_llegada?: string;
  hora_regreso?: string;
  hora_llegada_regreso?: string;
}

// ── Payment ──
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

// ── Rating ──
export interface Rating {
  id: number;
  evaluador_id: number;
  evaluado_id: number;
  puntuacion: number;
  comentario?: string;
  fecha: string;
}

// ── Navigation ──
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  RouteDetails: { routeId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Passengers: undefined;
  Payments: undefined;
  Profile: undefined;
  Routes: undefined;
};