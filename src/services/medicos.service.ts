import http from "../lib/http";

export type MedicoEstado = "activo" | "inactivo";
export type MedicoSexo = "femenino" | "masculino" | "otro" | "no_especificado";

export interface Medico {
  _id: string;
  folio?: string;
  nombre_completo: string;
  cedula: string;
  especialidad: string;
  subespecialidad?: string | null;
  sexo: MedicoSexo;
  fecha_nacimiento?: string | null; // ISO 8601
  telefono?: string | null;
  correo?: string | null;
  usuario_id?: string | null;
  estado: MedicoEstado;
  observaciones?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ListMedicosParams {
  q?: string;
  estado?: MedicoEstado;
  especialidad?: string;
  sexo?: MedicoSexo;
  page?: number;
  limit?: number;
  sort?:
    | "updated_at"
    | "-updated_at"
    | "nombre_completo"
    | "-nombre_completo"
    | "fecha_nacimiento"
    | "-fecha_nacimiento"
    | "folio"
    | "-folio";
}

export interface ListMedicosResponse {
  data: Medico[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export const ESPECIALIDADES_VALIDAS = [
  "Ginecología y Obstetricia",
  "Medicina Materno-Fetal",
  "Medicina Interna",
  "Endocrinología",
  "Cardiología",
  "Hematología",
  "Neonatología",
  "Anestesiología y Reanimación",
  "Psicología Perinatal",
  "Nutrición Materna y Perinatal",
] as const;

const MEDICOS_ROUTE = `medicos`;

export const listMedicos = async (params: ListMedicosParams) => {
  const { data } = await http.get<ListMedicosResponse>(`${MEDICOS_ROUTE}/`, { params });
  return data;
};

export interface CreateMedicoPayload {
  folio?: string; // opcional; si no se envía, backend genera
  nombre_completo: string;
  cedula: string;
  especialidad: string;
  subespecialidad?: string | null;
  sexo: MedicoSexo;
  fecha_nacimiento?: string | null; // ISO 8601
  telefono?: string | null;
  correo?: string | null;
  usuario_id?: string | null;
  estado?: MedicoEstado; // default activo
  observaciones?: string | null;
}

export const createMedico = async (payload: CreateMedicoPayload) => {
  const { data } = await http.post<{ message: string; data: Medico }>(`${MEDICOS_ROUTE}/`, payload);
  return data;
};

export interface UpdateMedicoPayload {
  folio?: string;
  nombre_completo?: string;
  cedula?: string;
  especialidad?: string;
  subespecialidad?: string | null;
  sexo?: MedicoSexo;
  fecha_nacimiento?: string | null;
  telefono?: string | null;
  correo?: string | null;
  usuario_id?: string | null;
  estado?: MedicoEstado;
  observaciones?: string | null;
}

export const updateMedico = async (id: string, payload: UpdateMedicoPayload) => {
  const { data } = await http.patch<{ message: string; data: Medico }>(`${MEDICOS_ROUTE}/${id}`, payload);
  return data;
};

export const deleteMedico = async (id: string) => {
  const { data } = await http.delete<{ message: string; data: Medico }>(`${MEDICOS_ROUTE}/${id}`);
  return data;
};
