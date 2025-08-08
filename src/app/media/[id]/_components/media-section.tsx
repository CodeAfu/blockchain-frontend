"use client";
import React from "react";
import { Alert, AlertDescription } from "@/components/shadcn-ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getMediaItem } from "@/actions/db-actions";
import LoadingSpinner from "@/components/loading-spinner";
import ActivityLogsCard from "./activity-logs-card";
import MediaSidebar from "./media-sidebar";
import MainContentCard from "./main-content";
import { useAccount } from "wagmi";
import NotAllowedFilter from "./not-allowed-filter";
import { checkAccessPermission } from "@/actions/market-actions";
import { useMetadata } from "@/hooks/use-metadata";

interface MediaSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  mediaId: string;
}

export default function MediaSection({ mediaId }: MediaSectionProps) {
  const { address } = useAccount();

  const {
    data = null,
    isLoading: isLoadingMedia,
    isError: isErrorMedia,
    error: mediaError,
  } = useQuery({
    queryKey: ["get-nft", mediaId],
    queryFn: () => getMediaItem(mediaId),
    enabled: !!mediaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { metadata, fileExtension, isLoadingMetadata, isErrorLoadingMetadata, metadataError } =
    useMetadata(data?.metadataCid || "");

  // Check access permission
  const {
    data: hasAccess = false,
    isLoading: isAccessLoading,
    isError: isAccessError,
  } = useQuery({
    queryKey: ["media-access-permission", data?.tokenId, address],
    queryFn: () => checkAccessPermission(data!.tokenId, address),
    enabled: !!data?.tokenId && !isLoadingMedia && !isErrorMedia,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  const isLoading = isLoadingMedia || isAccessLoading || (data && isLoadingMetadata);

  if (isErrorMedia) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Alert className="w-fit" variant="destructive">
          <AlertDescription>
            Error: {mediaError?.message || "Failed to load media"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Alert className="w-fit" variant="destructive">
          <AlertDescription>No media found with id: {mediaId}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Alert className="w-fit" variant="destructive">
          <AlertDescription>Please Connect to an Ethereum wallet</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Create enhanced media object with metadata
  const enhancedMedia = {
    ...data,
    fileExtension,
    metadata, // Optional
  };

  const accessLogs = data.accessLogs || [];
  const transfers = data.transfers || [];
  const isOwner = address === data.ownerAddress;

  // Show metadata loading error as warning (non-blocking)
  const showMetadataWarning = isErrorLoadingMetadata && !isLoadingMetadata;

  return (
    <React.Fragment>
      {((!hasAccess && !isOwner) || isAccessError) && <NotAllowedFilter />}

      {/* Metadata loading warning */}
      {showMetadataWarning && (
        <div className="container mx-auto px-4 pt-4 max-w-6xl">
          <Alert variant="default" className="mb-4">
            <AlertDescription>
              Warning: Failed to load metadata. Some features may be limited.
              {metadataError?.message && ` (${metadataError.message})`}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <MainContentCard media={enhancedMedia} isLoadingMetadata={isLoadingMetadata} />
            <ActivityLogsCard accessLogs={accessLogs} transfers={transfers} />
          </div>
          <div className="space-y-6">
            <MediaSidebar media={enhancedMedia} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
