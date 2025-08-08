"use client";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { SkeletonCard } from "./skeleton-card";
import { getAllMedia } from "@/actions/db-actions";
import { FileType, MediaNFT } from "@prisma/client";
import PreviewImage from "./preview-image";
import MediaHoverCard from "./media-hover-card";
import { useMediaAccessUri } from "@/hooks/use-media-access-uri";
import LoadingSpinner from "@/components/loading-spinner";

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

const fetchMediaData = async (limit: number): Promise<MediaNFT[]> => {
  const queryResult = await getAllMedia(limit);
  return queryResult;
};

// Individual media item component that fetches its own URI
function MediaPreviewItem({ nft }: { nft: MediaNFT }) {
  const { tempAccessUri, isFetchingUri, isErrorFetchingUri } = useMediaAccessUri(nft.cid);

  const renderMedia = useCallback(() => {
    if (isFetchingUri) {
      return (
        <div className="w-full h-48 rounded flex items-center justify-center bg-muted">
          <LoadingSpinner size={20} />
        </div>
      );
    }

    if (isErrorFetchingUri || !tempAccessUri) {
      return (
        <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">Failed to load media</span>
        </div>
      );
    }

    switch (nft.fileType) {
      case FileType.IMAGE:
        return (
          <div className="w-full h-48 rounded">
            <PreviewImage className="object-cover" src={tempAccessUri} alt={nft.title} />
          </div>
        );
      case FileType.VIDEO:
        return <LazyVideo src={tempAccessUri} className="w-full h-48 rounded" />;
      case FileType.AUDIO:
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded">
            🎵
            <LazyAudio src={tempAccessUri} className="mt-2" />
          </div>
        );
      default:
        return (
          <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">Media not available</span>
          </div>
        );
    }
  }, [nft.fileType, nft.title, tempAccessUri, isFetchingUri, isErrorFetchingUri]);

  return (
    <div className="shrink-0 w-full max-w-xs h-80 flex flex-col bg-white/10 backdrop-blur rounded-xl shadow hover:shadow-lg transition-shadow relative hover:z-50">
      <div className="shrink-0 relative w-full aspect-video bg-muted">{renderMedia()}</div>
      <div className="flex flex-col p-4">
        <div>
          <MediaHoverCard media={nft} />
        </div>
        <div>
          <p className="text-xs text-gray-400 truncate" title={nft.creatorAddress}>
            {nft.creatorAddress}
          </p>
          {nft.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{nft.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
  });

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
      ) : nfts.length === 0 ? (
        <div className="flex justify-center items-center w-full min-h-[300px]">
          <div className="text-center">
            <p className="text-gray-400">No featured media available at the moment</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 py-8 justify-items-center">
            {nfts.map(nft => (
              <MediaPreviewItem key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
