import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { queryClient } from "../../../lib/queryClient";
import {
  updateUsuario,
  UpdateUsuarioPayload,
} from "../../../services/usuario.service";
import { USUARIOS_QUERY_KEY } from "./useUsuarios";
import type { Usuario } from "../../../services/usuario.service";

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
    // Wrap the mutation to send only changed, non-empty fields
    mutationFn: async ({ id, payload }) => {
      const current = queryClient.getQueryData<Usuario[] | undefined>(USUARIOS_QUERY_KEY) ?? [];
      const existing = current.find((u) => u._id === id);

      const cleaned: UpdateUsuarioPayload = {};
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (existing && (existing as any)[key] === value) return;
        (cleaned as any)[key] = value;
      });

      return updateUsuario({ id, payload: cleaned });
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context);
    },
  });
