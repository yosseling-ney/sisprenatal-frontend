import http from "../lib/http";
import { ApiResponse } from "./paciente.service";

export interface CrearHistorialDatos {
  paciente_id: string;
  numero_gesta?: number | null;
}

export interface CrearHistorialPayload {
  datos: CrearHistorialDatos;
  identificacion?: Record<string, unknown> | null;
  antecedentes?: Record<string, unknown> | null;
  gestacion_actual?: Record<string, unknown> | null;
  parto_aborto?: Record<string, unknown> | null;
  patologias?: Record<string, unknown> | null;
  recien_nacido?: Record<string, unknown> | null;
  puerperio?: Record<string, unknown> | null;
  egreso_neonatal?: Record<string, unknown> | null;
  egreso_materno?: Record<string, unknown> | null;
  anticoncepcion?: Record<string, unknown> | null;
}

export interface CrearHistorialResult {
  historial_id: string;
  paciente_id: string;
  secciones_creadas: Record<string, string | undefined>;
}

const HISTORIALES_ROUTE = `historiales`;

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.ok) {
    throw new Error(response.error ?? "Error desconocido");
  }

  return response.data;
};

export const crearHistorial = async (payload: CrearHistorialPayload) => {
  const { data } = await http.post<ApiResponse<CrearHistorialResult>>(
    `${HISTORIALES_ROUTE}/create`,
    payload
  );
  return handleResponse(data);
};

export interface ActualizarHistorialPayload {
  historial_id: string;
  identificacion?: Record<string, unknown> | null;
  antecedentes?: Record<string, unknown> | null;
  gestacion_actual?: Record<string, unknown> | null;
  parto_aborto?: Record<string, unknown> | null;
  patologias?: Record<string, unknown> | null;
  recien_nacido?: Record<string, unknown> | null;
  puerperio?: Record<string, unknown> | null;
  egreso_neonatal?: Record<string, unknown> | null;
  egreso_materno?: Record<string, unknown> | null;
  anticoncepcion?: Record<string, unknown> | null;
}

export const actualizarHistorial = async (payload: ActualizarHistorialPayload) => {
  const { data } = await http.post<ApiResponse<CrearHistorialResult>>(
    `${HISTORIALES_ROUTE}/update`,
    payload
  );
  return handleResponse(data);
};

export interface HistorialAgregado {
  historial?: Record<string, unknown> | null;
  identificacion?: Record<string, unknown> | null;
  antecedentes?: Record<string, unknown> | null;
  gestacion_actual?: Record<string, unknown> | null;
  parto_aborto?: Record<string, unknown> | null;
  patologias?: Record<string, unknown> | null;
  recien_nacido?: Record<string, unknown> | null;
  puerperio?: Record<string, unknown> | null;
  egreso_neonatal?: Record<string, unknown> | null;
  egreso_materno?: Record<string, unknown> | null;
  anticoncepcion?: Record<string, unknown> | null;
}

export const obtenerHistorialPorPaciente = async (paciente_id: string) => {
  const { data } = await http.get<ApiResponse<HistorialAgregado>>(
    `${HISTORIALES_ROUTE}/por-paciente/${paciente_id}`
  );
  return handleResponse(data);
};

export const obtenerHistorialPorId = async (historial_id: string) => {
  const { data } = await http.get<ApiResponse<HistorialAgregado>>(
    `${HISTORIALES_ROUTE}/${historial_id}`
  );
  return handleResponse(data);
};
