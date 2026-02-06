export interface Payment {
  id: number;
  pasajero_id: number;
  chofer_id: number;
  ruta_id: number;
  fecha: string;
  pago: number;
  estado: "pendiente" | "completado";
}
