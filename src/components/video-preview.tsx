import { useRef, useState } from "react";

interface VideoPreviewProps {
  src: string;
  className?: string;
}

export default function VideoPreview({ src, className }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [canReplay, setCanReplay] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video || (!canReplay && previewEnded)) return;

    const duration = video.duration;
    const previewStart = duration * 0.3;
    const previewEnd = previewStart + 10;

    video.currentTime = previewStart;
    video.play();
    setPreviewEnded(false);
    setCanReplay(false);

    const stopPreview = () => {
      if (video.currentTime >= previewEnd) {
        video.pause();
        video.removeEventListener("timeupdate", stopPreview);
        setPreviewEnded(true);
        setCanReplay(true);
      }
    };

    video.addEventListener("timeupdate", stopPreview);
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;

    setCanReplay(true);
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        controls
        onPlay={handlePlay}
        onPause={handlePause}
        className="w-full h-full object-cover"
        controlsList="nodownload noplaybackrate"
      />
      {canReplay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <button onClick={handlePlay} className="bg-secondary/80 text-black px-4 py-2 rounded">
            Replay Preview
          </button>
        </div>
      )}
      <style jsx>{`
        video::-webkit-media-controls-timeline,
        video::-webkit-media-controls-time-remaining-display,
        video::-webkit-media-controls-current-time-display,
        video::-webkit-media-controls-seek-back-button,
        video::-webkit-media-controls-seek-forward-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
