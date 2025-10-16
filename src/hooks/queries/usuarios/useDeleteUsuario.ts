import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../lib/queryClient";
import { deleteUsuario } from "../../../services/usuario.service";
import { USUARIOS_QUERY_KEY } from "./useUsuarios";

interface DeleteUsuarioResponse {
  mensaje: string;
}

export const useDeleteUsuario = (
  options?: UseMutationOptions<DeleteUsuarioResponse, Error, string>
) =>
  useMutation<DeleteUsuarioResponse, Error, string>({
    mutationFn: deleteUsuario,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context);
    },
  });
