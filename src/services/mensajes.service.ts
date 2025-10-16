import http from "../lib/http";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error: string | null;
}

export type MensajeTipo = "message" | "reminder";

export interface MensajeItemApi {
  _id: string;
  paciente_id: string;
  created_by?: string | null;
  title?: string | null;
  description: string;
  type: MensajeTipo;
  read: boolean;
  created_at: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  time?: string; // agregado por el backend en GET
}

export interface MensajeItem {
  id: string;
  paciente_id: string;
  created_by?: string | null;
  title?: string | null;
  description: string;
  type: MensajeTipo;
  read: boolean;
  created_at: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  time?: string;
}

export interface MensajesList {
  items: MensajeItem[];
  page: number;
  per_page: number;
  total: number;
}

// Base URL se configura con VITE_API_BASE_URL (en dev: "/api").
// Aquí solo definimos el path relativo del recurso.
const ROUTE = "/mensajes";

const normalize = (doc: MensajeItemApi): MensajeItem => ({
  id: doc._id,
  paciente_id: doc.paciente_id,
  created_by: doc.created_by ?? null,
  title: doc.title ?? null,
  description: doc.description,
  type: doc.type,
  read: doc.read,
  created_at: doc.created_at,
  scheduled_at: doc.scheduled_at ?? null,
  sent_at: doc.sent_at ?? null,
  time: doc.time,
});

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.ok) {
    throw new Error(response.error ?? "Error desconocido");
  }
  return response.data;
};

export interface ListarMensajesParams {
  paciente_id?: string;
  // Hints alternativos para resolver paciente sin ID
  tipo_identificacion?: import("./paciente.service").TipoIdentificacion;
  numero_identificacion?: string;
  codigo_expediente?: string;
  nombre?: string;
  apellido?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const listarMensajes = async (params: ListarMensajesParams = {}) => {
  try {
    const { data } = await http.get<ApiResponse<MensajesList & { items: MensajeItemApi[] }>>(
      `${ROUTE}/`,
      { params }
    );
    const payload = handleResponse(data);
    return {
      ...payload,
      items: (payload.items ?? []).map(normalize),
    } as MensajesList;
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo obtener los mensajes";
    throw new Error(msg);
  }
};

export interface CrearMensajePayload {
  paciente_id?: string;
  // Hints alternativos aceptados por el backend
  tipo_identificacion?: import("./paciente.service").TipoIdentificacion;
  numero_identificacion?: string;
  codigo_expediente?: string;
  nombre?: string;
  apellido?: string;
  q?: string;
  description: string;
  title?: string | null;
  type?: MensajeTipo;
  scheduled_at?: string | null; // ISO8601
}

export interface CrearMensajeResult {
  id: string;
}

export const crearMensaje = async (payload: CrearMensajePayload) => {
  try {
    const { data } = await http.post<ApiResponse<CrearMensajeResult>>(`${ROUTE}/`, payload);
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo crear el mensaje";
    throw new Error(msg);
  }
};

export const marcarMensajeLeido = async (mensaje_id: string) => {
  try {
    const { data } = await http.patch<ApiResponse<{ updated: number }>>(`${ROUTE}/${mensaje_id}/read`);
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo marcar como leído";
    throw new Error(msg);
  }
};

export interface ActualizarMensajePayload {
  title?: string | null;
  description?: string | null;
  type?: MensajeTipo;
  scheduled_at?: string | null; // ISO8601
  read?: boolean;
}

export const actualizarMensaje = async (mensaje_id: string, payload: ActualizarMensajePayload) => {
  try {
    const { data } = await http.patch<ApiResponse<{ updated: number }>>(`${ROUTE}/${mensaje_id}`, payload);
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo actualizar el mensaje";
    throw new Error(msg);
  }
};

export const eliminarMensaje = async (mensaje_id: string, hard = false) => {
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: number }>>(`${ROUTE}/${mensaje_id}`, {
      params: hard ? { hard: 1 } : undefined,
    });
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo eliminar el mensaje";
    throw new Error(msg);
  }
};
