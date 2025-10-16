import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { actualizarMensaje, ActualizarMensajePayload } from "../../../services/mensajes.service";
import type { MensajesList } from "../../../services/mensajes.service";
import { queryClient } from "../../../lib/queryClient";

type UpdateArgs = { id: string; data: ActualizarMensajePayload };

export const useUpdateMensaje = (
  invalidateKey?: unknown[],
  options?: UseMutationOptions<{ updated: number }, Error, UpdateArgs>
) =>
  useMutation<{ updated: number }, Error, UpdateArgs>({
    mutationFn: ({ id, data }) => actualizarMensaje(id, data),
    // Optimistic update: actualizar el item en la lista cacheada
    onMutate: async (variables) => {
      if (!invalidateKey || !invalidateKey.length) return undefined as unknown as { previous?: MensajesList };
      await queryClient.cancelQueries({ queryKey: invalidateKey });
      const previous = queryClient.getQueryData<MensajesList>(invalidateKey);
      if (previous) {
        const updatedItems = (previous.items ?? []).map((it: any) =>
          it.id === variables.id
            ? {
                ...it,
                ...(variables.data.title !== undefined ? { title: variables.data.title } : {}),
                ...(variables.data.description !== undefined ? { description: variables.data.description } : {}),
                ...(variables.data.type !== undefined ? { type: variables.data.type } : {}),
                ...(variables.data.scheduled_at !== undefined ? { scheduled_at: variables.data.scheduled_at } : {}),
                ...(variables.data.read !== undefined ? { read: variables.data.read } : {}),
              }
            : it
        );
        queryClient.setQueryData<MensajesList>(invalidateKey, { ...previous, items: updatedItems });
      }
      return { previous } as { previous?: MensajesList };
    },
    onError: (error, variables, context) => {
      if (invalidateKey && context && (context as any).previous) {
        queryClient.setQueryData(invalidateKey, (context as any).previous);
      }
      options?.onError?.(error, variables, context as any);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      options?.onSuccess?.(data, variables, onMutateResult, context as any);
    },
    onSettled: (data, error, variables, context) => {
      if (invalidateKey && invalidateKey.length) {
        void queryClient.invalidateQueries({ queryKey: invalidateKey });
      }
      void queryClient.invalidateQueries({ queryKey: ["mensajes"] });
      options?.onSettled?.(data, error, variables, context as any);
    },
    ...options,
  });
