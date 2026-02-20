export type SegmentType = 'competency' | 'trash';

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  type: SegmentType;
  color: string;
}

export interface EditorMetrics {
  total: number;
  trash: number;
  useful: number;
}

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}

export interface VideoEditorContextType {
  videoRef: React.RefObject<VideoPlayerHandle | null>;
  segments: Segment[];
  currentTime: number;
  duration: number;
  virtualTime: number; 
  virtualDuration: number;
  virtualSegments: Segment[];
  isPlaying: boolean;
  skipTrash: boolean;
  metrics: EditorMetrics;
  competencies: Record<string, string>;
  
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  addSegment: (segment: Omit<Segment, 'id'>) => void;
  removeSegment: (id: string) => void;
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  seekToPreviousBoundary: () => void;
  seekToNextBoundary: () => void;
  formatTime: (seconds: number) => string;
  addCompetency: (name: string) => void;
}
