import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getGoogleStatus, GoogleStatus } from "../../../services/google.service";

export const googleStatusQueryKey = ["integrations", "google", "status"] as const;
type Key = typeof googleStatusQueryKey;

type Options = Omit<UseQueryOptions<GoogleStatus, Error, GoogleStatus, Key>, "queryKey" | "queryFn">;

export const useGoogleStatus = (options?: Options) =>
  useQuery<GoogleStatus, Error, GoogleStatus, Key>({
    queryKey: googleStatusQueryKey,
    queryFn: getGoogleStatus,
    staleTime: 1000 * 30,
    ...options,
  });

