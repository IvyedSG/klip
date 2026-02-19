import { createContext, useContext } from 'react';
import type { VideoEditorContextType } from '../types/editor';

export const VideoEditorContext = createContext<VideoEditorContextType | undefined>(undefined);

export const useVideoEditor = () => {
  const context = useContext(VideoEditorContext);
  if (context === undefined) {
    throw new Error('useVideoEditor debe estar dentro de VideoProvider');
  }
  return context;
};
