"use client";
import { useSearchParams, useRouter } from "next/navigation";

export function useFilterParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mediaType = searchParams.get("mediaType") ?? "all";
  const sort = searchParams.get("sort") ?? "recent";
  const search = searchParams.get("q") ?? "";

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    router.push(`?${newParams.toString()}`);
  };

  return {
    filters: { mediaType, sort, search },
    updateParam,
  };
}
