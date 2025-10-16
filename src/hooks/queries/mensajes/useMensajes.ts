import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { listarMensajes, ListarMensajesParams, MensajesList } from "../../../services/mensajes.service";

export const mensajesQueryKey = (params: ListarMensajesParams = {}) => [
  "mensajes",
  params.paciente_id ?? null,
  params.tipo_identificacion ?? null,
  params.numero_identificacion ?? null,
  params.codigo_expediente ?? null,
  params.nombre ?? null,
  params.apellido ?? null,
  params.q ?? null,
  params.page ?? 1,
  params.per_page ?? 20,
] as const;

type MensajesQueryKey = ReturnType<typeof mensajesQueryKey>;

type MensajesQueryOptions = Omit<
  UseQueryOptions<MensajesList, Error, MensajesList, MensajesQueryKey>,
  "queryKey" | "queryFn"
>;

export const useMensajes = (params: ListarMensajesParams, options?: MensajesQueryOptions) =>
  useQuery<MensajesList, Error, MensajesList, MensajesQueryKey>({
    queryKey: mensajesQueryKey(params),
    queryFn: () => listarMensajes(params),
    ...options,
  });
