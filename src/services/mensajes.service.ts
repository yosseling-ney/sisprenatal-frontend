import http from "../lib/http";
import { buscarPacientePorIdentificacion } from "./paciente.service";

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
const ROUTE = `mensajes`;

const isEmpty = (v: any) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const isValidObjectId = (v: any) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);
const clean = <T extends Record<string, any>>(obj: T): T => {
  const out: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (isEmpty(v)) return;
    if (k === "paciente_id" && !isValidObjectId(v)) return; // evita 422 por ObjectId inválido
    out[k] = v;
  });
  return out as T;
};

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
    const q = clean(params);
    // Backend solo acepta filtro por paciente_id. Resolver previamente si vienen hints.
    const hasPid = !!q.paciente_id && isValidObjectId(String(q.paciente_id));
    const hasIdentHints = !!q.tipo_identificacion && !!q.numero_identificacion;

    if (!hasPid) {
      // Si no hay paciente_id válido, pero hay hints, resolver paciente primero.
      if (hasIdentHints) {
        try {
          const paciente = await buscarPacientePorIdentificacion(
            q.tipo_identificacion as any,
            String(q.numero_identificacion)
          );
          const pid = (paciente as any)?.id || (paciente as any)?._id;
          if (pid && isValidObjectId(String(pid))) {
            q.paciente_id = String(pid);
          } else {
            return { items: [], page: Number(q.page) || 1, per_page: Number(q.per_page) || 20, total: 0 } as MensajesList;
          }
        } catch {
          return { items: [], page: Number(q.page) || 1, per_page: Number(q.per_page) || 20, total: 0 } as MensajesList;
        }
      } else {
        // Sin paciente_id ni hints → no consultamos para evitar 422.
        return { items: [], page: Number(q.page) || 1, per_page: Number(q.per_page) || 20, total: 0 } as MensajesList;
      }
    }

    // Solo enviar los parámetros que el backend acepta
    const finalParams = {
      paciente_id: q.paciente_id,
      page: q.page,
      per_page: q.per_page,
    } as Record<string, any>;

    const { data } = await http.get<ApiResponse<MensajesList & { items: MensajeItemApi[] }>>(
      `${ROUTE}/`,
      { params: finalParams }
    );
    const payload = handleResponse(data);
    return { ...payload, items: (payload.items ?? []).map(normalize) } as MensajesList;
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
    const body = clean(payload);
    const { data } = await http.post<ApiResponse<CrearMensajeResult>>(`${ROUTE}/`, body);
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
