"use client";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/utils/shadcn-utils";
import { MarketplaceCard } from "./marketplace-card";
import { getAllMediaByCursorWithUrl } from "@/actions/db-actions";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MediaNFTWithTempUrl } from "@/types/media";
import { devLog } from "@/utils/logging";
import { fileTypeToMediaTypeMapper } from "@/utils/media-utils";
import LoadingSpinner from "@/components/loading-spinner";
import { useMarketplaceContext } from "@/contexts/marketplace-context";

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

  devLog("Filters:", filters);
  devLog("Page Param:", pageParam);

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
  const { address } = useMarketplaceContext();
  const searchParams = useSearchParams();

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

  // Intersection observer hook for infinite scroll
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: false,
  });

  // Trigger fetch when the sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      devLog("Loading more items...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section
      className={cn(
        "max-w-7xl mx-auto w-full z-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 rounded-md shadow-md bg-white/5 backdrop-blur-md",
        className
      )}
      {...props}
    >
      {/* <div className="absolute inset-0 -z-10 bg-[url('/assets/bg/diagonal-lines.svg')] bg-repeat bg-[length:5px_5px] opacity-10" /> */}

      {isLoading ? (
        <div className="col-span-full text-center text-muted-foreground">
          <LoadingSpinner size={35} />
        </div>
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
          {allMedia.map((item, i) => (
            <div key={item.id || i}>
              <MarketplaceCard
                address={address || null}
                nft={item}
                url={item.tempAccessUri}
                mediaType={fileTypeToMediaTypeMapper(item.fileType)}
                className="h-full"
              />
            </div>
          ))}

          {/* Sentinel element for infinite scroll */}
          {hasNextPage && (
            <div ref={inViewRef} className="col-span-full flex items-center justify-center">
              {/* {isFetchingNextPage && <div className="text-muted-foreground">Loading more...</div>} */}
            </div>
          )}

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
