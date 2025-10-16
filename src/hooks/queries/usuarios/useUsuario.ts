import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUsuario, Usuario } from "../../../services/usuario.service";

export const usuarioQueryKey = (id: string) => ["usuario", id] as const;

export const useUsuario = (
  id: string,
  options?: UseQueryOptions<Usuario, Error>
) =>
  useQuery<Usuario, Error>({
    queryKey: usuarioQueryKey(id),
    queryFn: () => getUsuario(id),
    enabled: !!id,
    ...options,
  });
