import http from "../lib/http";

// Algunos endpoints de backend responden como arreglo crudo y otros envuelven en
// { ok, data, error } e incluso paginan en { items, ... }.
// Estas utilidades permiten consumir ambos formatos sin romper la UI.
type ApiEnvelope<T> = { ok: boolean; data: T; error?: string | null };
const unwrapData = <T>(input: any): T => {
  if (input && typeof input === "object" && "ok" in input && "data" in input) {
    // Respuesta tipo { ok, data }
    const payload: any = (input as ApiEnvelope<any>).data;
    // Si el payload viene paginado
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload.items)) return payload.items as T;
      if (Array.isArray(payload.usuarios)) return payload.usuarios as T;
    }
    return payload as T;
  }
  // Arreglo crudo
  if (Array.isArray(input)) return input as T;
  return input as T;
};

export interface Usuario {
  _id: string; // UI expects _id
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  username: string;
  rol: string;
}

// Backend may return either `id` or `_id`.
type UsuarioApi = {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  username: string;
  rol: string;
};

const normalizeUsuario = (doc: UsuarioApi): Usuario => ({
  _id: (doc.id || doc._id || "") as string,
  nombre: doc.nombre,
  apellido: doc.apellido,
  correo: doc.correo,
  telefono: doc.telefono,
  username: doc.username,
  rol: doc.rol,
});

export interface CreateUsuarioPayload {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  username: string;
  password: string;
  rol: string;
}

export interface UpdateUsuarioPayload {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  username?: string;
  password?: string;
  rol?: string;
}

const USUARIOS_ROUTE = "/usuarios";

export const listUsuarios = async () => {
  const { data } = await http.get(USUARIOS_ROUTE);
  const payload = unwrapData<UsuarioApi[] | UsuarioApi>(data);
  if (Array.isArray(payload)) return payload.map(normalizeUsuario);
  // If a single object is returned
  return payload ? [normalizeUsuario(payload as UsuarioApi)] : [];
};

export const getUsuario = async (id: string) => {
  const { data } = await http.get(`${USUARIOS_ROUTE}/${id}`);
  const payload = unwrapData<UsuarioApi>(data);
  return normalizeUsuario(payload);
};

export const createUsuario = async (payload: CreateUsuarioPayload) => {
  const { data } = await http.post<{ mensaje: string; id: string }>(USUARIOS_ROUTE, payload);
  return data;
};

export const updateUsuario = async ({ id, payload }: { id: string; payload: UpdateUsuarioPayload }) => {
  // Partial update via PATCH. Only send modified fields from caller.
  const { data } = await http.patch<{ mensaje: string }>(`${USUARIOS_ROUTE}/${id}`, payload);
  return data;
};

export const deleteUsuario = async (id: string) => {
  const { data } = await http.delete<{ mensaje: string }>(`${USUARIOS_ROUTE}/${id}`);
  return data;
};
