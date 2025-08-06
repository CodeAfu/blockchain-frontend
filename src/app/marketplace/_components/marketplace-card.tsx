"use client";

import * as React from "react";
import { cn } from "@/utils/shadcn-utils";
import { MediaNFT } from "@prisma/client";
import { Button } from "@/components/shadcn-ui/button";
import MediaHoverCard from "@/components/media-hover-card";
import NextImage from "@/components/next-image";
import VideoPreview from "@/components/video-preview";
import AudioPreview from "@/components/audio-preview";
import Modal from "@/components/modal"; // adjust the path if needed
import { useModal } from "@/hooks/use-modal";

interface MarketplaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  nft: MediaNFT;
  url?: string;
  mediaType?: "image" | "audio" | "video";
}

export function MarketplaceCard({
  nft,
  url,
  mediaType = "image",
  className,
  ...props
}: MarketplaceCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const aspectRatio =
    mediaType === "image"
      ? "aspect-[4/5]"
      : mediaType === "video"
        ? "aspect-video"
        : "aspect-[1/1]";

  return (
    <>
      <div
        className={cn(
          "relative group rounded-xl bg-white/10 backdrop-blur p-3 shadow transition hover:scale-[1.02] flex flex-col justify-between hover:z-20",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative flex flex-1 items-center justify-center w-full rounded-md overflow-hidden mb-3 bg-muted",
            aspectRatio
          )}
        >
          {mediaType === "image" && url && (
            <div
              className="hover:cursor-pointer"
              onClick={mediaType === "image" ? openModal : undefined}
            >
              <NextImage
                src={url}
                alt={nft.title}
                draggable={false}
                className="object-cover transition-transform group-hover:scale-105 hover:cursor-pointer"
                onContextMenu={e => e.preventDefault()}
              />
            </div>
          )}

          {mediaType === "video" && url && <VideoPreview src={url} className="w-full h-full" />}

          {mediaType === "audio" && url && (
            <div className="flex items-center justify-center w-full h-full p-4 bg-black/50 text-sm">
              <AudioPreview src={url} className="w-full h-full" />
            </div>
          )}

          {!url && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No media
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* Descriptions */}
          <div>
            <MediaHoverCard media={nft} />
            <p className="text-xs text-muted-foreground mt-1 truncate">{nft.ownerAddress}</p>
          </div>

          {/* Buy */}
          <div className="flex justify-end">
            <Button onClick={() => {}} size="sm" className="text-sm text-right font-medium mt-1">
              {nft.price} ETH
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {url && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          size="full"
          title={nft.title}
          closeOnOverlayClick
        >
          <div className="relative w-full min-h-[80vh]">
            <NextImage src={url} alt={nft.title} className="object-contain p-4" sizes="100vw" />
          </div>
        </Modal>
      )}
    </>
  );
}
