import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../lib/queryClient";
import {
  createUsuario,
  CreateUsuarioPayload,
} from "../../../services/usuario.service";
import { USUARIOS_QUERY_KEY } from "./useUsuarios";

interface CreateUsuarioResponse {
  mensaje: string;
  id: string;
}

export const useCreateUsuario = (
  options?: UseMutationOptions<CreateUsuarioResponse, Error, CreateUsuarioPayload>
) =>
  useMutation<CreateUsuarioResponse, Error, CreateUsuarioPayload>({
    mutationFn: createUsuario,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context);
    },
  });
