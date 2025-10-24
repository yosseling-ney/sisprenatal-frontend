import http from "../lib/http";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error: string | null;
}

export type TipoIdentificacion = "CI" | "PSP" | "NSS" | "LC";

type Maybe<T> = T | null | undefined;

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
}

export interface Paciente {
  id: string;
  historial_id: Maybe<string>;
  nombre: string;
  apellido: string;
  tipo_identificacion: TipoIdentificacion;
  numero_identificacion: string;
  codigo_expediente: string;
  fecha_nac: Maybe<string>;
  telefono: string;
  direccion: string;
  bairro: string;
  gesta_actual: number;
  contacto_emergencia: Maybe<ContactoEmergencia>;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HistorialResumen {
  id: string;
  paciente_id: string;
  numero_gesta: number;
  identificacion_id?: Maybe<string>;
  antecedentes_id?: Maybe<string>;
  gestacion_actual_id?: Maybe<string>;
  parto_aborto_id?: Maybe<string>;
  patologias_id?: Maybe<string>;
  recien_nacido_id?: Maybe<string>;
  puerperio_id?: Maybe<string>;
  egreso_neonatal_id?: Maybe<string>;
  egreso_materno_id?: Maybe<string>;
  anticoncepcion_id?: Maybe<string>;
  created_at?: string;
  updated_at?: string;
  activo?: boolean;
}

export interface PacienteDetalle {
  paciente: Paciente;
  historial: Maybe<HistorialResumen>;
}

export interface CrearPacienteDatosGenerales {
  nombre: string;
  apellido: string;
  tipo_identificacion: TipoIdentificacion;
  numero_identificacion: string;
  fecha_nac: string; // YYYY-MM-DD
  telefono: string;
  direccion: string;
  bairro: string;
  gesta_actual: number;
  municipio_codigo?: string;
  sexo?: "M" | "F";
  contacto_emergencia?: ContactoEmergencia;
}

export interface CrearPacientePayload {
  datos_generales: CrearPacienteDatosGenerales;
  historial?: Record<string, unknown> | null;
}

export interface CrearPacienteResult {
  paciente_id: string;
  historial_id: Maybe<string>;
}

const PACIENTES_ROUTE = `pacientes`;

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.ok) {
    throw new Error(response.error ?? "Error desconocido");
  }

  return response.data;
};

export const obtenerPacienteDetalle = async (pacienteId: string) => {
  const { data } = await http.get<ApiResponse<PacienteDetalle>>(
    `${PACIENTES_ROUTE}/${pacienteId}`
  );
  return handleResponse(data);
};

export const crearPaciente = async (payload: CrearPacientePayload) => {
  const { data } = await http.post<ApiResponse<CrearPacienteResult>>(
    `${PACIENTES_ROUTE}/create`,
    payload
  );
  return handleResponse(data);
};

export interface ActualizarPacientePayload {
  paciente_id: string;
  // Solo gesta_actual por ahora; extender según necesidades
  gesta_actual?: number;
  telefono?: string;
  direccion?: string;
  bairro?: string;
}

export const actualizarPaciente = async (payload: ActualizarPacientePayload) => {
  const { paciente_id, ...rest } = payload;
  try {
    // Preferir ruta moderna con ID en path
    const { data } = await http.put<ApiResponse<Paciente>>(
      `${PACIENTES_ROUTE}/${paciente_id}`,
      rest
    );
    return handleResponse(data);
  } catch (err: any) {
    const status = err?.response?.status;
    // Si no existe o método no permitido, usar ruta legacy
    if (status === 405 || status === 404) {
      const { data } = await http.put<ApiResponse<Paciente>>(
        `${PACIENTES_ROUTE}/update`,
        payload
      );
      return handleResponse(data);
    }
    throw err;
  }
};

export const buscarPacientePorIdentificacion = async (
  tipo_identificacion: TipoIdentificacion,
  numero_identificacion: string
) => {
  // Intentar primero ruta top-level '/api/identificacion' (según mapa de rutas compartido)
  // y hacer fallback a '/api/pacientes/identificacion' si no existe.
  const normalizeId = (p: any) => {
    if (!p) return p;
    if (!p.id && p._id) p.id = String(p._id);
    return p as Paciente;
  };
  try {
    const { data } = await http.get<ApiResponse<Paciente>>(
      `identificacion`,
      { params: { tipo_identificacion, numero_identificacion } }
    );
    return normalizeId(handleResponse(data));
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 405) {
      const { data } = await http.get<ApiResponse<Paciente>>(
        `${PACIENTES_ROUTE}/identificacion`,
        { params: { tipo_identificacion, numero_identificacion } }
      );
      return normalizeId(handleResponse(data));
    }
    throw err;
  }
};

export const buscarPacientePorExpediente = async (
  codigo_expediente: string
) => {
  // Normalizar como en backend: mayúsculas y eliminar separadores no alfanuméricos
  const normalizeExp = (s: string) => (s || "").toString().trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
  const codigo = normalizeExp(codigo_expediente);
  const normalizeId = (p: any) => {
    if (!p) return p;
    if (!p.id && p._id) p.id = String(p._id);
    return p as Paciente;
  };
  // Intentar primero ruta top-level '/api/expediente?codigo_expediente=...'
  try {
    const { data } = await http.get<ApiResponse<Paciente>>(
      `expediente`,
      { params: { codigo_expediente: codigo } }
    );
    return normalizeId(handleResponse(data));
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 405) {
      // Fallback 1: '/api/pacientes/expediente'
      try {
        const { data } = await http.get<ApiResponse<Paciente>>(
          `${PACIENTES_ROUTE}/expediente`,
          { params: { codigo_expediente: codigo } }
        );
        return normalizeId(handleResponse(data));
      } catch (err2: any) {
        const status2 = err2?.response?.status;
        if (status2 === 404 || status2 === 405) {
          // Fallback 2: '/api/pacientes' con query param
          const { data } = await http.get<ApiResponse<Paciente | Paciente[]>>(
            `${PACIENTES_ROUTE}`,
            { params: { codigo_expediente: codigo } }
          );
          const payload = handleResponse(data) as any;
          if (Array.isArray(payload)) {
            return normalizeId(payload[0] || null);
          }
          return normalizeId(payload);
        }
        // Tratar 422 (formato inválido) como no encontrado para evitar romper el flujo de UI
        if (status2 === 422) return null as any;
        throw err2;
      }
    }
    if (status === 422) return null as any;
    throw err;
  }
};
