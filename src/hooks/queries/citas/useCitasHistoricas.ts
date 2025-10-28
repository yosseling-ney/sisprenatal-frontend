import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CitasList, listarCitasHistoricas } from "../../../services/citas.service";

export const citasHistoricasQueryKey = (
  desde?: string,
  hasta?: string,
  limit = 200
) => ["citas", "historicas", desde || null, hasta || null, limit] as const;
type Key = ReturnType<typeof citasHistoricasQueryKey>;

type Options = Omit<UseQueryOptions<CitasList, Error, CitasList, Key>, "queryKey" | "queryFn">;

export const useCitasHistoricas = (desde?: string, hasta?: string, limit = 200, options?: Options) =>
  useQuery<CitasList, Error, CitasList, Key>({
    queryKey: citasHistoricasQueryKey(desde, hasta, limit),
    queryFn: () => listarCitasHistoricas(desde, hasta, limit),
    ...options,
  });

