export interface Role {
  id: number;
  user_id: number;
  tipo: "chofer" | "pasajero";
  activo: boolean;
  creado_en: string;
}
