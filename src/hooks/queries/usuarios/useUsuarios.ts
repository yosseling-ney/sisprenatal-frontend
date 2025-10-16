import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { listUsuarios, Usuario } from "../../../services/usuario.service";

export const USUARIOS_QUERY_KEY = ["usuarios"] as const;

export const useUsuarios = (
  options?: UseQueryOptions<Usuario[], Error>
) =>
  useQuery<Usuario[], Error>({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: () => listUsuarios(),
    ...options,
  });
