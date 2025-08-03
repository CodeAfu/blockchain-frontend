"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { SkeletonCard } from "./skeleton-card";
import { getAllMediaWithUrl } from "@/actions/db-actions";
import { FileType } from "@prisma/client";
import NextImage from "./next-image";

const LazyVideo = dynamic(
  () =>
    Promise.resolve(({ src, className }: { src: string; className: string }) => (
      <video src={src} controls className={className} preload="metadata" />
    )),
  { ssr: false }
);

const LazyAudio = dynamic(
  () =>
    Promise.resolve(({ src, className }: { src: string; className: string }) => (
      <audio controls src={src} className={className} preload="metadata" />
    )),
  { ssr: false }
);

interface MediaItem {
  id: number;
  title: string;
  description: string;
  mediaType: FileType | null;
  mediaUrl: string;
  creator: string;
}

const fetchMediaData = async (limit: number): Promise<MediaItem[]> => {
  const queryResult = await getAllMediaWithUrl(limit);

  return queryResult
    .map(item => ({
      id: item.tokenId,
      title: item.title,
      description: item.description || "",
      mediaType: item.fileType,
      mediaUrl: item.tempAccessUri,
      creator: item.creatorAddress,
    }))
    .filter(item => item.mediaUrl);
};

export default function MarketplacePreview() {
  const {
    data: nfts = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["marketplace-preview-media", 4],
    queryFn: () => fetchMediaData(4),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    // retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const renderMedia = useCallback((nft: MediaItem) => {
    switch (nft.mediaType) {
      case FileType.IMAGE:
        return (
          <div className="relative w-full h-48 rounded overflow-hidden">
            <NextImage className="shrink-0" src={nft.mediaUrl} alt={nft.title} />
          </div>
        );
      case FileType.VIDEO:
        return <LazyVideo src={nft.mediaUrl} className="w-full h-48 rounded" />;
      case FileType.AUDIO:
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded">
            🎵
            <LazyAudio src={nft.mediaUrl} className="mt-2" />
          </div>
        );
      default:
        return (
          <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">Media not available</span>
          </div>
        );
    }
  }, []);

  // Memoize the grid items to prevent unnecessary re-renders
  const nftList = useMemo(
    () =>
      nfts.map(nft => (
        <div
          key={nft.id}
          className="shrink-0 w-full max-w-xs h-80 flex flex-col bg-white/10 backdrop-blur rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="shrink-0 relative w-full aspect-video bg-muted">{renderMedia(nft)}</div>

          <div className="flex-1 flex flex-col p-4 gap-1">
            <p className="text-base font-semibold truncate" title={nft.title}>
              {nft.title}
            </p>
            <p className="text-xs text-gray-400 truncate" title={nft.creator}>
              {nft.creator}
            </p>
            {nft.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{nft.description}</p>
            )}
          </div>
        </div>
      )),
    [nfts, renderMedia]
  );

  if (isError) {
    return (
      <section className="py-16 px-6 bg-background/10">
        <h2 className="text-3xl font-bold text-center mb-10">Featured Media</h2>
        <div className="flex justify-center items-center w-full min-h-[300px]">
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load media</p>
            <p className="text-sm text-gray-400">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-background/10">
      <h2 className="text-3xl font-bold text-center mb-10">Featured Media</h2>
      {isLoading ? (
        <div className="flex justify-center items-center w-full min-h-[300px] gap-8">
          <div className="block sm:hidden">
            <SkeletonCard />
          </div>

          <div className="hidden sm:flex gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl overflow-hidden">
          <div className="flex sm:flex-row flex-col gap-8 py-4 items-center justify-center overflow-x-auto px-2">
            {nftList}
          </div>
        </div>
      )}
    </section>
  );
}
