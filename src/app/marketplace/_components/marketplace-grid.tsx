"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/shadcn-utils";
import { MarketplaceCard } from "./marketplace-card";
import { getAllMediaByCursorWithUrl } from "@/actions/db-actions";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MediaNFTWithTempUrl } from "@/types/media";
import { devLog } from "@/utils/logging";

const fetchData = async (
  searchParams: URLSearchParams,
  pageParam?: string
): Promise<{ media: MediaNFTWithTempUrl[]; hasMore: boolean; nextCursor?: string }> => {
  const filters = {
    mediaType: searchParams.get("mediaType")?.split(",") ?? undefined,
    sortPrice: searchParams.get("sortPrice") ?? undefined,
    sortDate: searchParams.get("sortDate") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    cursorId: pageParam,
  };

  devLog("PageParam:", pageParam);
  devLog("Filters:", filters);

  const media = await getAllMediaByCursorWithUrl({
    limit: 4,
    ...filters,
  });
  return media;
};

export default function MarketplaceGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const searchParams = useSearchParams();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["fetch-marketplace-media-cursor", searchParams.toString()],
      queryFn: ({ pageParam }) => fetchData(searchParams, pageParam),
      getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.nextCursor : undefined),
      initialPageParam: undefined as string | undefined,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
    });

  // Flatten all pages into a single array
  const allMedia = data?.pages.flatMap(page => page.media) ?? [];

  // Infinite scroll trigger ref callback
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
          Failed to load media: <span className="font-semibold">Message: {error.message}</span>
        </div>
      ) : allMedia.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground">
          No media found matching your filters.
        </div>
      ) : (
        <>
          {allMedia.map((item, i) => {
            // Attach the observer to the last item
            const isLastItem = i === allMedia.length - 1;
            return (
              <div key={item.id || i} ref={isLastItem ? lastElementRef : null}>
                <MarketplaceCard nft={item} imageUrl={item.tempAccessUri} />
              </div>
            );
          })}

          {/* Loading skeletons for next page */}
          {isFetchingNextPage &&
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
