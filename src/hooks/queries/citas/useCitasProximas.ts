import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CitasList, listarProximasCitas } from "../../../services/citas.service";

export const citasProximasQueryKey = (dias = 7, limit = 200) => [
  "citas",
  "proximas",
  dias,
  limit,
] as const;
type Key = ReturnType<typeof citasProximasQueryKey>;

type Options = Omit<UseQueryOptions<CitasList, Error, CitasList, Key>, "queryKey" | "queryFn">;

export const useCitasProximas = (dias = 7, limit = 200, options?: Options) =>
  useQuery<CitasList, Error, CitasList, Key>({
    queryKey: citasProximasQueryKey(dias, limit),
    queryFn: () => listarProximasCitas(dias, limit),
    ...options,
  });

