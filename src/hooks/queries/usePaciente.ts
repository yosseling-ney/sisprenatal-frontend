import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  PacienteDetalle,
  obtenerPacienteDetalle,
} from "../../services/paciente.service";

export const pacienteQueryKey = (id: string) => ["paciente", id] as const;
type Key = ReturnType<typeof pacienteQueryKey>;

type Options = Omit<
  UseQueryOptions<PacienteDetalle, Error, PacienteDetalle, Key>,
  "queryKey" | "queryFn"
>;

export const usePaciente = (
  id: string,
  options?: Options
) =>
  useQuery<PacienteDetalle, Error, PacienteDetalle, Key>({
    queryKey: pacienteQueryKey(id),
    queryFn: () => obtenerPacienteDetalle(id),
    enabled: !!id,
    ...options,
  });
