"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/shadcn-ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getMediaItemWithUrl } from "@/actions/db-actions";
import LoadingSpinner from "@/components/loading-spinner";
import ActivityLogsCard from "./transfers-card";
import MediaSidebar from "./media-sidebar";
import MainContentCard from "./main-content";

interface MediaSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  mediaId: string;
}

export default function MediaSection({ mediaId }: MediaSectionProps) {
  const {
    data = null,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get-nft", mediaId],
    queryFn: () => getMediaItemWithUrl(mediaId),
    enabled: !!mediaId,
  });

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
        <Alert variant="destructive">
          <AlertDescription>No media found with id: {mediaId}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Error: {error?.message || "Failed to load media"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const media = data;
  const accessLogs = data.accessLogs || [];
  const transfers = data.transfers || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MainContentCard media={media} />
          <ActivityLogsCard accessLogs={accessLogs} transfers={transfers} />
        </div>
        <div className="space-y-6">
          <MediaSidebar media={media} />
        </div>
      </div>
    </div>
  );
}
