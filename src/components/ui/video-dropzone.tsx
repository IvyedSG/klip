import React, { useCallback, useState } from 'react';
import { Button } from './button';

interface VideoDropzoneProps {
  onVideoSelect: (file: File) => void;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({ onVideoSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-2xl aspect-video rounded-3xl flex flex-col items-center justify-center
        border-2 border-dashed transition-all cursor-pointer group
        ${isDragging 
          ? 'border-accent bg-accent/5' 
          : 'border-border hover:border-neutral-700 hover:bg-neutral-900/40'
        }
      `}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-6 p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-text-secondary group-hover:text-accent transition-colors"
            >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            <circle cx="9" cy="12" r="3" />
            </svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Selecciona tu video</h2>
          <p className="text-text-secondary max-w-xs mx-auto">
            Carga la grabación para comenzar a etiquetar momentos y organizar segmentos.
          </p>
        </div>

        <Button variant="secondary" className="pointer-events-none group-hover:bg-accent group-hover:text-white transition-colors">
          Seleccionar Video
        </Button>
      </div>

      <div className="absolute bottom-6 flex gap-2 text-[10px] uppercase tracking-widest text-text-secondary opacity-50 font-medium">
        <span>MP4</span>
        <span>•</span>
        <span>WebM</span>
      </div>
    </div>
  );
};
