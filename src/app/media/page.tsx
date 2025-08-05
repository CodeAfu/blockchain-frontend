"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getMyMedia } from "@/actions/db-actions";
import { FileType } from "@prisma/client";
import NextImage from "@/components/next-image";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import Container from "@/components/container";
import { devLog } from "@/utils/logging";
import { MediaNFTWithTempUrl } from "@/types/media";

export default function MyMediaPage() {
  const { address } = useAccount();
  const [images, setImages] = useState<MediaNFTWithTempUrl[]>([]);
  const [videos, setVideos] = useState<MediaNFTWithTempUrl[]>([]);
  const [audios, setAudios] = useState<MediaNFTWithTempUrl[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!address) return;
      const mediaList = await getMyMedia(address);

      setImages(mediaList.filter(m => m.fileType === FileType.IMAGE));
      setVideos(mediaList.filter(m => m.fileType === FileType.VIDEO));
      setAudios(mediaList.filter(m => m.fileType === FileType.AUDIO));
      devLog("Triggered");
    }

    fetchData();
  }, [address]);

  const renderMedia = (media: MediaNFTWithTempUrl[], type: string) =>
    media.length > 0 ? (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative">
        {media.map((item, index) => (
          <div
            key={index}
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

  if (!address) {
    return <div>Please connect to a wallet</div>;
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
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
