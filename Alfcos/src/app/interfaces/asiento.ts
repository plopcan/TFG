export interface Asiento {
  nombre: string;
  n_asiento: number;
  fecha: string; // ISO string for the date
  n_grupo: number;
  n_socio?: number | null; // Optional, ID of the Socio
  id_evento?: number | null; // Optional, ID of the Evento
}
