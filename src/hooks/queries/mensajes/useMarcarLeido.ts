import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { marcarMensajeLeido } from "../../../services/mensajes.service";
import type { MensajesList } from "../../../services/mensajes.service";
import { queryClient } from "../../../lib/queryClient";

export const useMarcarLeido = (
  invalidateKey?: unknown[],
  options?: UseMutationOptions<{ updated: number }, Error, string>
) =>
  useMutation<{ updated: number }, Error, string>({
    mutationFn: marcarMensajeLeido,
    // Optimistic: marcar como leído en cache inmediatamente
    onMutate: async (mensajeId) => {
      if (!invalidateKey || !invalidateKey.length) return undefined as unknown as { previous?: MensajesList };
      await queryClient.cancelQueries({ queryKey: invalidateKey });
      const previous = queryClient.getQueryData<MensajesList>(invalidateKey);
      if (previous) {
        const updatedItems = (previous.items ?? []).map((it: any) =>
          it.id === mensajeId ? { ...it, read: true } : it
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
