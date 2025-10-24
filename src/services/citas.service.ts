import http from "../lib/http";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error: string | null;
}

export interface CitaApi {
  _id: string;
  paciente_id?: string | null;
  created_by?: string | null;
  title?: string | null;
  description?: string | null;
  provider?: string | null;
  location?: string | null;
  status: "scheduled" | "completed" | "cancelled";
  start_at: string;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CitaItem {
  id: string;
  paciente_id?: string | null;
  created_by?: string | null;
  title?: string | null;
  description?: string | null;
  provider?: string | null;
  location?: string | null;
  status: "scheduled" | "completed" | "cancelled";
  start_at: string;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CitasList {
  items: CitaItem[];
  total: number;
}

const ROUTE = `citas`;

const normalize = (doc: CitaApi): CitaItem => ({
  id: doc._id,
  paciente_id: doc.paciente_id ?? null,
  created_by: doc.created_by ?? null,
  title: doc.title ?? null,
  description: doc.description ?? null,
  provider: doc.provider ?? null,
  location: doc.location ?? null,
  status: doc.status,
  start_at: doc.start_at,
  end_at: doc.end_at ?? null,
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.ok) {
    throw new Error(response.error ?? "Error desconocido");
  }
  return response.data;
};

export const listarCitasHoy = async (limit = 100): Promise<CitasList> => {
  try {
    const { data } = await http.get<ApiResponse<{ items: CitaApi[]; total: number }>>(
      `${ROUTE}/hoy`,
      { params: { limit } }
    );
    const payload = handleResponse(data);
    return { items: (payload.items ?? []).map(normalize), total: payload.total ?? 0 };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo obtener las citas de hoy";
    throw new Error(msg);
  }
};

export const listarProximasCitas = async (dias = 7, limit = 200): Promise<CitasList> => {
  try {
    const { data } = await http.get<ApiResponse<{ items: CitaApi[]; total: number }>>(
      `${ROUTE}/proximas`,
      { params: { dias, limit } }
    );
    const payload = handleResponse(data);
    return { items: (payload.items ?? []).map(normalize), total: payload.total ?? 0 };
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo obtener las prximas citas";
    throw new Error(msg);
  }
};

export interface CrearCitaPayload {
  paciente_id: string;
  start_at: string; // ISO8601
  end_at?: string | null; // ISO8601
  title?: string | null;
  description?: string | null;
  provider?: string | null;
  location?: string | null;
  attendees?: Array<{ email: string; displayName?: string }>;
  reminders?: Record<string, unknown>;
}

export const crearCita = async (payload: CrearCitaPayload) => {
  try {
    const { data } = await http.post<ApiResponse<{ id: string }>>(`${ROUTE}/`, payload);
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo crear la cita";
    throw new Error(msg);
  }
};

export interface ActualizarCitaPayload {
  title?: string | null;
  description?: string | null;
  provider?: string | null;
  location?: string | null;
  status?: "scheduled" | "completed" | "cancelled";
  start_at?: string; // ISO8601
  end_at?: string | null; // ISO8601
  attendees?: Array<{ email: string; displayName?: string }> | null;
  reminders?: Record<string, unknown> | null;
}

export const actualizarCita = async (cita_id: string, payload: ActualizarCitaPayload) => {
  try {
    const { data } = await http.patch<ApiResponse<{ updated: number }>>(`${ROUTE}/${cita_id}`, payload);
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo actualizar la cita";
    throw new Error(msg);
  }
};

export const eliminarCita = async (cita_id: string, hard = false) => {
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: number }>>(`${ROUTE}/${cita_id}`, {
      params: hard ? { hard: 1 } : undefined,
    });
    return handleResponse(data);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || "No se pudo eliminar la cita";
    throw new Error(msg);
  }
};

