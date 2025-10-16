import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../lib/queryClient";
import {
  updateUsuario,
  UpdateUsuarioPayload,
} from "../../../services/usuario.service";
import { USUARIOS_QUERY_KEY } from "./useUsuarios";

interface UpdateUsuarioArgs {
  id: string;
  payload: UpdateUsuarioPayload;
}

interface UpdateUsuarioResponse {
  mensaje: string;
}

export const useUpdateUsuario = (
  options?: UseMutationOptions<UpdateUsuarioResponse, Error, UpdateUsuarioArgs>
) =>
  useMutation<UpdateUsuarioResponse, Error, UpdateUsuarioArgs>({
    mutationFn: updateUsuario,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context);
    },
  });
