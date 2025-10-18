import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  PacienteDetalle,
  obtenerPacienteDetalle,
} from "../../services/paciente.service";

export const pacienteQueryKey = (id: string) => ["paciente", id] as const;
type Key = ReturnType<typeof pacienteQueryKey>;

type Options = Omit<
  UseQueryOptions<PacienteDetalle, Error, PacienteDetalle, Key>,
  "queryKey" | "queryFn"
> & {
  onError?: (err?: Error) => void;
};

export const usePaciente = (
  id: string,
  options?: Options
) => {
  const { onError, ...rest } = options ?? {};

  const query = useQuery<PacienteDetalle, Error, PacienteDetalle, Key>({
    queryKey: pacienteQueryKey(id),
    queryFn: () => obtenerPacienteDetalle(id),
    enabled: !!id,
    ...rest,
  });

  useEffect(() => {
    if (query.error) {
      onError?.(query.error);
    }
  }, [query.error]);

  return query;
};
