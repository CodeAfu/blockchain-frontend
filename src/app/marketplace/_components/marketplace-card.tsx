import * as React from "react";
import Image from "next/image";
import { cn } from "@/utils/shadcn-utils";
import { MediaNFT } from "@prisma/client";
import MediaHoverCard from "../../../components/media-hover-card";

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
  const aspectRatio =
    mediaType === "image"
      ? "aspect-[4/5]"
      : mediaType === "video"
        ? "aspect-video"
        : "aspect-[1/1]";

  return (
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
          <Image
            src={url}
            alt={nft.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}

        {mediaType === "video" && url && (
          <video src={url} controls className="w-full h-full object-cover" />
        )}

        {mediaType === "audio" && url && (
          <div className="flex items-center justify-center w-full h-full p-4 bg-black/50 text-sm">
            <audio controls src={url} className="w-full" />
          </div>
        )}

        {!url && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No media
          </div>
        )}
      </div>

      <div>
        {/* Descriptions */}
        <div>
          <MediaHoverCard media={nft} />
          <p className="text-xs text-muted-foreground mt-1 truncate">{nft.ownerAddress}</p>
        </div>

        {/* Buy */}
        <div>
          <p className="text-sm text-right font-medium mt-1">{nft.price} ETH</p>
        </div>
      </div>
    </div>
  );
}
