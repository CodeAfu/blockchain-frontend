import { useRef, useState } from "react";

interface AudioPreviewProps {
  src: string;
  className?: string;
}

export default function AudioPreview({ src, className }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [canReplay, setCanReplay] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || (!canReplay && previewEnded)) return;

    const duration = audio.duration;
    const previewStart = duration * 0.3;
    const previewEnd = previewStart + 10;

    audio.currentTime = previewStart;
    audio.play();
    setPreviewEnded(false);
    setCanReplay(false);

    const stopPreview = () => {
      if (audio.currentTime >= previewEnd) {
        audio.pause();
        audio.removeEventListener("timeupdate", stopPreview);
        setPreviewEnded(true);
        setCanReplay(true);
      }
    };

    audio.addEventListener("timeupdate", stopPreview);
  };

  const handlePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCanReplay(true);
  };

  return (
    <div className={`relative ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        controls
        onPlay={handlePlay}
        onPause={handlePause}
        className="w-full"
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
        audio::-webkit-media-controls-timeline,
        audio::-webkit-media-controls-time-remaining-display,
        audio::-webkit-media-controls-current-time-display,
        audio::-webkit-media-controls-seek-back-button,
        audio::-webkit-media-controls-seek-forward-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
