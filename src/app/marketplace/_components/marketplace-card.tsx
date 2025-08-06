"use client";
import * as React from "react";
import { useState } from "react";
import { cn } from "@/utils/shadcn-utils";
import { MediaNFT } from "@prisma/client";
import { Button } from "@/components/shadcn-ui/button";
import MediaHoverCard from "@/components/media-hover-card";
import NextImage from "@/components/next-image";
import VideoPreview from "@/components/video-preview";
import AudioPreview from "@/components/audio-preview";
import ImagePreviewModal from "./image-preview-modal";
import PurchaseModal from "./purchase-modal";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // Add your purchase logic here
      console.log("Processing purchase for NFT:", nft.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // After successful purchase
      setShowPurchaseModal(false);
      
      toast.message("Success!", {
        description: "NFT purchased successfully",
        duration: 5000,
      });
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Error", {
        description: error as string,
        className: "border border-red-500 bg-red-50 text-red-600",
        icon: <CircleAlert className="stroke-red-500" />,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="hover:cursor-pointer" onClick={() => setShowPreviewModal(true)}>
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
            <Button
              onClick={() => setShowPurchaseModal(true)}
              size="sm"
              className="text-sm text-right font-medium mt-1"
            >
              {nft.price} ETH
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {url && (
        <ImagePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          imageUrl={url}
          title={nft.title}
          alt={nft.title}
        />
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        nft={nft}
        imageUrl={url}
        onPurchase={handlePurchase}
        isLoading={isLoading}
      />
    </>
  );
}
