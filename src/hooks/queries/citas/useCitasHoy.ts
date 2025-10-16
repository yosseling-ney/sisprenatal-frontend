import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CitasList, listarCitasHoy } from "../../../services/citas.service";

export const citasHoyQueryKey = (limit = 100) => ["citas", "hoy", limit] as const;
type Key = ReturnType<typeof citasHoyQueryKey>;

type Options = Omit<UseQueryOptions<CitasList, Error, CitasList, Key>, "queryKey" | "queryFn">;

export const useCitasHoy = (limit = 100, options?: Options) =>
  useQuery<CitasList, Error, CitasList, Key>({
    queryKey: citasHoyQueryKey(limit),
    queryFn: () => listarCitasHoy(limit),
    ...options,
  });

