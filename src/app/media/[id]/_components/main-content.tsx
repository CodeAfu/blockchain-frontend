"use client";
import { Card, CardContent, CardFooter } from "@/components/shadcn-ui/card";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Download, Pause, Play } from "lucide-react";
import { MediaNFTWithTempUrl } from "@/types/media";
import { FileType } from "@prisma/client";
import { formatFileSize } from "@/utils/file-utils";

interface MainContentCardProps {
  media: MediaNFTWithTempUrl & { fileExtension: string };
}

export default function MainContentCard({ media }: MainContentCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDownload = async () => {
    if (!media.tempAccessUri) return;

    try {
      const response = await fetch(media.tempAccessUri);
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

  const getMediaSource = () => {
    return media.tempAccessUri;
  };

  // const togglePlayPause = () => {
  //   const mediaElement = media?.fileType === FileType.VIDEO ? videoRef.current : audioRef.current;
  //   if (!mediaElement) return;

  //   if (isPlaying) {
  //     mediaElement.pause();
  //   } else {
  //     mediaElement.play();
  //   }
  //   setIsPlaying(!isPlaying);
  // };

  return (
    <Card>
      <CardContent className="p-0">
        {media.fileType === FileType.IMAGE && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={media.tempAccessUri}
              alt={media.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
          </div>
        )}

        {media.fileType === FileType.VIDEO && (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black rounded-t-lg"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={getMediaSource()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {media.fileType === FileType.AUDIO && (
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
                <source src={getMediaSource()} type="audio/mpeg" />
                <source src={getMediaSource()} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{media.fileType}</Badge>
          {media.fileSize && <Badge variant="outline">{formatFileSize(media.fileSize)}</Badge>}
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
