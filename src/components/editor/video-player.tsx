import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useVideoEditor } from '../../hooks/use-video-editor';
import type { VideoPlayerHandle } from '../../types/editor';

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({ videoUrl }, ref) => {
  const videoInternalRef = useRef<HTMLVideoElement>(null);
  const { 
    setCurrentTime,
    setDuration,
    setIsPlaying,
    isPlaying
  } = useVideoEditor();

  useImperativeHandle(ref, () => ({
    play: async () => {
        if (videoInternalRef.current) {
            return videoInternalRef.current.play();
        }
    },
    pause: () => videoInternalRef.current?.pause(),
    seek: (time) => {
      if (videoInternalRef.current) {
        videoInternalRef.current.currentTime = time;
      }
    },
    getDuration: () => videoInternalRef.current?.duration || 0,
    getCurrentTime: () => videoInternalRef.current?.currentTime || 0,
  }));

  useEffect(() => {
    const video = videoInternalRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

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
  }, [setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    const video = videoInternalRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(error => console.error("Error playing video:", error));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  return (
    <div className="relative group w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
      <video
        ref={videoInternalRef}
        src={videoUrl}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
});
