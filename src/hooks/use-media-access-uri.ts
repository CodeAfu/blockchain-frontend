"use client";
import { getAccessLinkByCid } from "@/actions/nft-actions";
import {
  FETCH_MEDIA_ACCESS_URI_CACHE_TIME_MS,
  FETCH_MEDIA_ACCESS_URI_STALE_TIME_MS,
} from "@/lib/consts";
import { useQuery } from "@tanstack/react-query";

export function useMediaAccessUri(hashedCid: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["access-link", hashedCid],
    queryFn: () => getAccessLinkByCid(hashedCid),
    enabled: !!hashedCid,
    staleTime: FETCH_MEDIA_ACCESS_URI_STALE_TIME_MS,
    gcTime: FETCH_MEDIA_ACCESS_URI_CACHE_TIME_MS,
  });

  return {
    tempAccessUri: data,
    isFetchingUri: isLoading,
    isErrorFetchingUri: isError,
    uriFetchError: error,
  };
}
