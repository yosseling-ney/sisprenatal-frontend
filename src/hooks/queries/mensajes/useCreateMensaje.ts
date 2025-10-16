import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { crearMensaje, CrearMensajePayload, CrearMensajeResult } from "../../../services/mensajes.service";
import { queryClient } from "../../../lib/queryClient";
import { mensajesQueryKey } from "./useMensajes";

export const useCreateMensaje = (
  paramsForInvalidate?: {
    paciente_id?: string;
    tipo_identificacion?: import("../../../services/paciente.service").TipoIdentificacion;
    numero_identificacion?: string;
    codigo_expediente?: string;
    nombre?: string;
    apellido?: string;
    q?: string;
    page?: number;
    per_page?: number;
  },
  options?: UseMutationOptions<CrearMensajeResult, Error, CrearMensajePayload>
) =>
  useMutation<CrearMensajeResult, Error, CrearMensajePayload>({
    mutationFn: crearMensaje,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidar clave específica (si aplica) y el grupo general
      if (paramsForInvalidate) {
        void queryClient.invalidateQueries({ queryKey: mensajesQueryKey(paramsForInvalidate) });
      }
      void queryClient.invalidateQueries({ queryKey: ["mensajes"] });
      options?.onSuccess?.(data, variables, onMutateResult, context as any);
    },
    ...options,
  });
