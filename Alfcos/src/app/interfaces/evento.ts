export interface Evento {
    id_evento: number;
    nombre: string;
    descripcion: string;
    fecha_ini: Date;
    fecha_fin: Date;
    num_grupos: number;
    precio: number;
    tipo: string;
    tipo_id: string;
    plazasLibres: number;
}
