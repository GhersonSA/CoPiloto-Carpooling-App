export type RolTipo = 'chofer' | 'pasajero';

export interface Role {
  id: number;
  tipo: RolTipo;
}

export interface Vehiculo {
  id?: number;
  marca?: string;
  modelo?: string;
  color?: string;
  matricula?: string;
  plazas?: number;
  img_vehiculo?: string;
}

export interface PerfilChofer {
  id: number;
  direccion?: string;
  barrio?: string;
  telefono?: string;
  img_chofer?: string;
}

export interface PerfilPasajero {
  id: number;
  nacionalidad?: string;
  barrio?: string;
  telefono?: string;
  img_pasajero?: string;
}

export interface RutaBase {
  id?: number;
  origen?: string;
  destino?: string;
  dias?: string;
  hora_salida?: string;
  hora_llegada?: string;
  hora_regreso?: string;
  hora_llegada_regreso?: string;
}

export interface RutaChofer extends RutaBase {
  chofer_id?: number;
  paradas?: Parada[];
}

export interface RutaPasajero extends RutaBase {
  pasajero_id?: number;
}

export interface Parada {
  pasajero_id?: string | number;
  direccion: string;
}