"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getMyMedia } from "@/actions/db-actions";
import { FileType } from "@prisma/client";
import NextImage from "@/components/next-image";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import Container from "@/components/container";
import { MediaNFTWithTempUrl } from "@/types/media";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useIsMounted } from "@/hooks/use-is-mounted";
import LoadingSpinner from "@/components/loading-spinner";

export default function MyMediaPage() {
  const mounted = useIsMounted();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  const addressSearchParam = searchParams.get("address");

  useEffect(() => {
    if (addressSearchParam) {
      setWalletAddress(addressSearchParam);
    } else if (address) {
      setWalletAddress(address);
    }
  }, [address, addressSearchParam]);

  const {
    data: mediaList = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myMedia", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return await getMyMedia(walletAddress);
    },
    enabled: !!walletAddress,
  });

  const images = mediaList.filter(m => m.fileType === FileType.IMAGE);
  const videos = mediaList.filter(m => m.fileType === FileType.VIDEO);
  const audios = mediaList.filter(m => m.fileType === FileType.AUDIO);

  const renderMedia = (media: MediaNFTWithTempUrl[], type: string) =>
    media.length > 0 ? (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {media.map(item => (
          <div
            key={item.id}
            className="border relative rounded bg-white shadow p-2 aspect-square flex items-center justify-center"
          >
            {type === "image" ? (
              <NextImage
                src={item.tempAccessUri}
                alt={item.id}
                className="object-contain rounded p-4"
              />
            ) : type === "video" ? (
              <video src={item.tempAccessUri} controls className="w-full rounded" />
            ) : (
              <audio src={item.tempAccessUri} controls className="w-full" />
            )}
          </div>
        ))}
      </div>
    ) : (
      <Card>
        <CardContent className="p-4 text-gray-500">No {type}s found.</CardContent>
      </Card>
    );

  if (isError) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <p className="text-red-500 font-semibold">Failed to load media. Please try again later.</p>
      </div>
    );
  }

  if (mounted && !walletAddress) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <p className="text-center font-semibold text-red-500">Error: No wallet parameter found</p>
      </div>
    );
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-[90vh]">
      <Container>
        <main className="flex flex-col flex-1 px-4 sm:px-12 py-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Images</h3>
            {renderMedia(images, "image")}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Videos</h3>
            {renderMedia(videos, "video")}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Audios</h3>
            {renderMedia(audios, "audio")}
          </div>
        </main>
      </Container>
    </div>
  );
}
