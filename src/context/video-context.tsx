import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { VideoPlayerHandle, Segment } from '../types/editor';
import { DEFAULT_COMPETENCY_COLORS } from '../constants/competencias-default';
import { VideoEditorContext } from '../hooks/use-video-editor';

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);

const clip = (s: Segment, start: number, end: number): Segment[] => [
  { ...s, id: generateId(), end: Math.min(s.end, start) },
  { ...s, id: generateId(), start: Math.max(s.start, end) }
].filter(x => x.end - x.start > 0.05);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customCompetencies, setCustomCompetencies] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [skipTrash, setSkipTrash] = useState(true);
  const videoRef = useRef<VideoPlayerHandle | null>(null);

  const addSegment = useCallback((data: Omit<Segment, 'id'>) => {
    const next = { ...data, id: generateId() };
    setSegments(prev => {
      const cut = prev.flatMap(s => (s.type === next.type || s.end <= next.start || s.start >= next.end) ? [s] : clip(s, next.start, next.end));
      if (next.type !== 'trash') return [...cut, next].sort((a, b) => a.start - b.start);
      
      const trash = [...cut.filter(s => s.type === 'trash'), next].sort((a, b) => a.start - b.start);
      const merged = trash.reduce((acc: Segment[], s) => {
        const last = acc[acc.length - 1];
        if (last && s.start <= last.end) last.end = Math.max(last.end, s.end);
        else acc.push({ ...s });
        return acc;
      }, []);
      return [...cut.filter(s => s.type !== 'trash'), ...merged].sort((a, b) => a.start - b.start);
    });
  }, []);

  const removeSegment = useCallback((id: string) => setSegments(p => p.filter(s => s.id !== id)), []);
  const updateSegment = useCallback((id: string, up: Partial<Segment>) => setSegments(p => p.map(s => s.id === id ? { ...s, ...up } : s)), []);
  const seekTo = useCallback((t: number) => { if (videoRef.current) { videoRef.current.seek(t); setCurrentTime(t); } }, []);
  const togglePlay = useCallback(() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play(), [isPlaying]);

  useEffect(() => {
    if (!skipTrash || !isPlaying) return;
    const currentTrash = segments.find(s => s.type === 'trash' && currentTime >= s.start && currentTime < s.end);
    if (currentTrash && videoRef.current) {
      videoRef.current.seek(currentTrash.end);
      setTimeout(() => setCurrentTime(currentTrash.end), 0);
    }
  }, [currentTime, segments, skipTrash, isPlaying]);

  const getBoundaries = useCallback(() => 
    Array.from(new Set([0, duration, ...segments.filter(s => s.type !== 'trash').flatMap(s => [s.start, s.end])])).sort((a, b) => a - b)
  , [segments, duration]);

  const seekBoundary = useCallback((dir: number) => {
    const b = getBoundaries();
    const target = dir < 0 ? b.reverse().find(v => v < currentTime - 0.15) : b.find(v => v > currentTime + 0.15);
    seekTo(target ?? (dir < 0 ? 0 : duration));
  }, [currentTime, duration, getBoundaries, seekTo]);

  const metrics = useMemo(() => {
    const trash = segments.filter(s => s.type === 'trash').reduce((a, s) => a + (s.end - s.start), 0);
    return { total: duration, trash, useful: Math.max(0, duration - trash) };
  }, [segments, duration]);

  const competencies = useMemo(() => ({ ...DEFAULT_COMPETENCY_COLORS, ...customCompetencies }), [customCompetencies]);

  const addCompetency = useCallback((name: string) => {
    if (!competencies[name]) {
      const colors = ['#38bdf8', '#a855f7', '#4ade80', '#f97316', '#f472b6', '#fbbf24', '#22d3ee', '#ef4444'];
      setCustomCompetencies(p => ({ ...p, [name]: colors[Math.floor(Math.random() * colors.length)] }));
    }
  }, [competencies]);

  const value = useMemo(() => ({
    videoRef, segments, currentTime, duration, isPlaying, skipTrash, metrics, competencies,
    setSkipTrash, setCurrentTime, setDuration, setIsPlaying, addSegment, removeSegment, updateSegment,
    togglePlay, seekTo, formatTime: (s: number) => {
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return `${Math.floor(s / 3600) > 0 ? Math.floor(s / 3600) + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    },
    seekToPreviousBoundary: () => seekBoundary(-1),
    seekToNextBoundary: () => seekBoundary(1),
    addCompetency,
  }), [videoRef, segments, currentTime, duration, isPlaying, skipTrash, metrics, competencies, addSegment, removeSegment, updateSegment, togglePlay, seekTo, seekBoundary, addCompetency]);

  return <VideoEditorContext.Provider value={value}>{children}</VideoEditorContext.Provider>;
};

