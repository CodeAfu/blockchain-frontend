"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/utils/shadcn-utils";
import { MarketplaceCard } from "./marketplace-card";
import { getAllMediaByCursorWithUrl } from "@/actions/db-actions";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MediaNFTWithTempUrl } from "@/types/media";

const fetchData = async (
  searchParams: URLSearchParams,
  cursorId?: string
): Promise<{ media: MediaNFTWithTempUrl[]; hasMore: boolean }> => {
  const filters = {
    mediaType: searchParams.get("mediaType") ?? undefined,
    sortPrice: searchParams.get("sortPrice") ?? undefined,
    sortDate: searchParams.get("sortDate") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const media = await getAllMediaByCursorWithUrl({
    limit: 4,
    cursorId,
    ...filters,
  });
  return media;
};

export default function MarketplaceGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const searchParams = useSearchParams();
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);

  const {
    data = { media: [], hasMore: false },
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["fetch-marketplace-media-cursor", searchParams.toString(), cursorId],
    queryFn: () => fetchData(searchParams, cursorId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Reset Pagination when searchParams change
  useEffect(() => {
    setCursorId(undefined);
  }, [searchParams]);

  return (
    <section
      className={cn(
        "relative max-w-7xl mx-auto w-full z-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 rounded-md shadow-md bg-white/5 backdrop-blur-md",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -z-10 bg-[url('/assets/bg/diagonal-lines.svg')] bg-repeat bg-[length:5px_5px] opacity-10" />

      {isLoading ? (
        <div className="col-span-full text-center text-muted-foreground">Loading media...</div>
      ) : isError ? (
        <div className="col-span-full text-center text-destructive">
          Failed to load media. Please try again later.
        </div>
      ) : data.media.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No media found matching your filters.
        </div>
      ) : (
        <>
          {data.media.map((item, i) => (
            <MarketplaceCard key={item.id || i} nft={item} imageUrl={item.tempAccessUri} />
          ))}

          {isPending &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="w-full h-[300px] bg-muted animate-pulse rounded-md"
              />
            ))}
        </>
      )}
    </section>
  );
}
