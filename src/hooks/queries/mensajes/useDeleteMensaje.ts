import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { eliminarMensaje } from "../../../services/mensajes.service";
import type { MensajesList } from "../../../services/mensajes.service";
import { queryClient } from "../../../lib/queryClient";

type DeleteArgs = { id: string; hard?: boolean };

export const useDeleteMensaje = (
  invalidateKey?: unknown[],
  options?: UseMutationOptions<{ deleted: number }, Error, DeleteArgs>
) =>
  useMutation<{ deleted: number }, Error, DeleteArgs>({
    mutationFn: ({ id, hard }) => eliminarMensaje(id, !!hard),
    // Optimistic update: quitar el item de la lista actual
    onMutate: async (variables) => {
      if (!invalidateKey || !invalidateKey.length) return undefined as unknown as { previous?: MensajesList };
      await queryClient.cancelQueries({ queryKey: invalidateKey });
      const previous = queryClient.getQueryData<MensajesList>(invalidateKey);
      if (previous) {
        const filtered = (previous.items ?? []).filter((it: any) => it.id !== variables.id);
        queryClient.setQueryData<MensajesList>(invalidateKey, {
          ...previous,
          items: filtered,
          total: Math.max(0, (previous.total ?? filtered.length) - 1),
        });
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
