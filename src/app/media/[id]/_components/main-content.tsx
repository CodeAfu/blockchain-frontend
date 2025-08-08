"use client";
import { Card, CardContent, CardFooter } from "@/components/shadcn-ui/card";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Download, Pause, Play } from "lucide-react";
import { FileType, MediaNFT } from "@prisma/client";
import { formatFileSize } from "@/utils/file-utils";
import { useMediaAccessUri } from "@/hooks/use-media-access-uri";
import LoadingSpinner from "@/components/loading-spinner";
import { NFTMetadata } from "@/types/media";

interface MainContentCardProps {
  media: MediaNFT & { 
    fileExtension: string;
    metadata?: NFTMetadata;
  };
  isLoadingMetadata?: boolean;
}

export default function MainContentCard({ 
  media, 
  isLoadingMetadata = false 
}: MainContentCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { tempAccessUri, isFetchingUri, isErrorFetchingUri, uriFetchError } = useMediaAccessUri(
    media.cid
  );

  const handleDownload = async () => {
    if (!tempAccessUri) return;
    
    try {
      const response = await fetch(tempAccessUri);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${media.title}.${media.fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderMediaContent = () => {
    // Show loading state for URI
    if (isFetchingUri) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      );
    }

    // Show error state for URI
    if (isErrorFetchingUri || !tempAccessUri) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load media</p>
            <p className="text-sm text-muted-foreground">
              {uriFetchError?.message || "Unable to fetch media URL"}
            </p>
          </div>
        </div>
      );
    }

    // Render actual media based on type
    switch (media.fileType) {
      case FileType.IMAGE:
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={tempAccessUri}
              alt={media.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
          </div>
        );

      case FileType.VIDEO:
        return (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black rounded-t-lg"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={tempAccessUri} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case FileType.AUDIO:
        return (
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 aspect-video rounded-t-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white" />
                )}
              </div>
              <audio
                ref={audioRef}
                controls
                className="w-full max-w-md"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={tempAccessUri} type="audio/mpeg" />
                <source src={tempAccessUri} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Unsupported media type</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {renderMediaContent()}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{media.fileType}</Badge>
          {media.fileSize && <Badge variant="outline">{formatFileSize(media.fileSize)}</Badge>}
          {isLoadingMetadata && (
            <Badge variant="outline" className="animate-pulse">
              Loading metadata...
            </Badge>
          )}
        </div>
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm"
          disabled={isFetchingUri || isErrorFetchingUri || !tempAccessUri}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}