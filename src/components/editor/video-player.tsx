import React, { useEffect } from 'react';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoUrl: string;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
  isPlaying: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  videoUrl,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  isPlaying,
}) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => onTimeUpdate(video.currentTime);
    const handleDurationChange = () => onDurationChange(video.duration);
    const handlePlay = () => onPlayPause(true);
    const handlePause = () => onPlayPause(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, onTimeUpdate, onDurationChange, onPlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(error => console.error("Error playing video:", error));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, videoRef]);

  return (
    <div className="relative group w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};
