export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: "origen" | "destino";
  user: {
    nombre?: string;
    username?: string;
    img: string;
    calificacion?: number;
    telefono?: string;
  };
  details: any;
  userType: "chofer" | "pasajero";
  stopLabel?: string;
  stopSequence?: number;
}

export interface InteractiveMapProps {
  drivers: any[];
  passengers: any[];
  routes: any[];
  routePassengers: any[];
  onOpenModal: (type: string, data: any) => void;
}
