"use client";
import React, { useEffect, useState } from "react";
import { getMyMedia } from "@/actions/db-actions";
import { FileType, MediaNFT } from "@prisma/client";
import PreviewImage from "@/components/preview-image";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import Container from "@/components/container";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useIsMounted } from "@/hooks/use-is-mounted";
import LoadingSpinner from "@/components/loading-spinner";
import Modal from "@/components/modal";
import { useModal } from "@/hooks/use-modal";
import { useAccount } from "wagmi";
import { useMediaAccessUri } from "@/hooks/use-media-access-uri";

// Individual media item component that fetches its own URI
function MediaItem({ 
  item, 
  type, 
  isBlurImage, 
  onImageClick 
}: { 
  item: MediaNFT; 
  type: "image" | "video" | "audio";
  isBlurImage: boolean;
  onImageClick?: (item: MediaNFT) => void;
}) {
  const { tempAccessUri, isFetchingUri, isErrorFetchingUri } = useMediaAccessUri(item.cid);

  const handleClick = () => {
    if (type === "image" && onImageClick) {
      onImageClick(item);
    }
  };

  const renderContent = () => {
    if (isFetchingUri) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      );
    }

    if (isErrorFetchingUri || !tempAccessUri) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span>Failed to load {type}</span>
        </div>
      );
    }

    switch (type) {
      case "image":
        return (
          <div
            className="hover:cursor-pointer transition-transform w-full h-full flex items-center justify-center"
            onClick={handleClick}
          >
            <PreviewImage
              src={tempAccessUri}
              alt={item.id}
              isBlur={isBlurImage}
              className="object-contain rounded p-4 hover:cursor-pointer"
            />
          </div>
        );
      case "video":
        return <video src={tempAccessUri} controls className="w-full rounded" />;
      case "audio":
        return <audio src={tempAccessUri} controls className="w-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="border relative rounded bg-white shadow p-2 aspect-square flex items-center justify-center hover:shadow-lg transition-shadow">
      {renderContent()}
    </div>
  );
}

// Enhanced modal component that handles URI fetching
function MediaModal({ 
  selectedImage, 
  isOpen, 
  onClose, 
  isBlurImage 
}: {
  selectedImage: MediaNFT | null;
  isOpen: boolean;
  onClose: () => void;
  isBlurImage: boolean;
}) {
  const { tempAccessUri, isFetchingUri, isErrorFetchingUri } = useMediaAccessUri(
    selectedImage?.cid || ""
  );

  if (!selectedImage) return null;

  const renderModalContent = () => {
    if (isFetchingUri) {
      return (
        <div className="relative w-full min-h-[80vh] flex items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      );
    }

    if (isErrorFetchingUri || !tempAccessUri) {
      return (
        <div className="relative w-full min-h-[80vh] flex items-center justify-center">
          <p className="text-red-500">Failed to load image</p>
        </div>
      );
    }

    return (
      <div className="relative w-full min-h-[80vh]">
        <PreviewImage
          src={tempAccessUri}
          alt={selectedImage.title || selectedImage.id}
          isBlur={isBlurImage}
          className="object-contain p-4"
          sizes="100vw"
        />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={selectedImage.title || selectedImage.id}
      closeOnOverlayClick
    >
      {renderModalContent()}
    </Modal>
  );
}

export default function MyMediaPage() {
  const mounted = useIsMounted();
  const { isOpen, openModal, closeModal } = useModal();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [selectedImage, setSelectedImage] = useState<MediaNFT | null>(null);
  
  const addressSearchParam = searchParams.get("address");
  const isBlurImage = !!addressSearchParam && addressSearchParam !== address;

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
    queryKey: ["my-media", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return await getMyMedia(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const images = mediaList.filter(m => m.fileType === FileType.IMAGE);
  const videos = mediaList.filter(m => m.fileType === FileType.VIDEO);
  const audios = mediaList.filter(m => m.fileType === FileType.AUDIO);

  const handleImageClick = (item: MediaNFT) => {
    setSelectedImage(item);
    openModal();
  };

  const renderMediaSection = (
    media: MediaNFT[], 
    type: "image" | "video" | "audio", 
    title: string
  ) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {media.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map(item => (
            <MediaItem
              key={item.id}
              item={item}
              type={type}
              isBlurImage={isBlurImage}
              onImageClick={type === "image" ? handleImageClick : undefined}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-gray-500">
            No {type}s found.
          </CardContent>
        </Card>
      )}
    </div>
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
    <>
      <div className="flex flex-col bg-gray-50 min-h-[90vh]">
        <Container>
          <main className="flex flex-col flex-1 px-4 sm:px-12 py-8">
            {renderMediaSection(images, "image", "Images")}
            {renderMediaSection(videos, "video", "Videos")}
            {renderMediaSection(audios, "audio", "Audios")}
          </main>
        </Container>
      </div>

      <MediaModal
        selectedImage={selectedImage}
        isOpen={isOpen}
        onClose={closeModal}
        isBlurImage={isBlurImage}
      />
    </>
  );
}