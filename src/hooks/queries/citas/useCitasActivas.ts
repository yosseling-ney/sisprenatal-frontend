import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CitasList, listarCitasActivas } from "../../../services/citas.service";

export const citasActivasQueryKey = (desde?: string, hasta?: string, limit = 200) => [
  "citas",
  "activas",
  desde || null,
  hasta || null,
  limit,
] as const;
type Key = ReturnType<typeof citasActivasQueryKey>;

type Options = Omit<UseQueryOptions<CitasList, Error, CitasList, Key>, "queryKey" | "queryFn">;

export const useCitasActivas = (desde?: string, hasta?: string, limit = 200, options?: Options) =>
  useQuery<CitasList, Error, CitasList, Key>({
    queryKey: citasActivasQueryKey(desde, hasta, limit),
    queryFn: () => listarCitasActivas(desde, hasta, limit),
    enabled: !!desde && !!hasta,
    ...options,
  });

