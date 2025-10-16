import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  PacienteDetalle,
  obtenerPacienteDetalle,
} from "../../services/paciente.service";

export const pacienteQueryKey = (id: string) => ["paciente", id] as const;

export const usePaciente = (
  id: string,
  options?: UseQueryOptions<PacienteDetalle, Error>
) =>
  useQuery<PacienteDetalle, Error>({
    queryKey: pacienteQueryKey(id),
    queryFn: () => obtenerPacienteDetalle(id),
    enabled: !!id,
    ...options,
  });