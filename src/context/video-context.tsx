import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { VideoPlayerHandle, Segment } from '../types/editor';
import { DEFAULT_COMPETENCY_COLORS } from '../constants/competencias-default';
import { VideoEditorContext } from '../hooks/use-video-editor';

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);

interface Range { start: number; end: number; }

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customCompetencies, setCustomCompetencies] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const skipTrash = true;
  const videoRef = useRef<VideoPlayerHandle | null>(null);

  const addSegment = useCallback((data: Omit<Segment, 'id'>) => {
    const next = { ...data, id: generateId() };
    setSegments(prev => {
      return [...prev, next].sort((a, b) => a.start - b.start);
    });
  }, []);

  const removeSegment = useCallback((id: string) => setSegments(p => p.filter(s => s.id !== id)), []);
  const updateSegment = useCallback((id: string, up: Partial<Segment>) => setSegments(p => p.map(s => s.id === id ? { ...s, ...up } : s)), []);
  const togglePlay = useCallback(() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play(), [isPlaying]);

  const trashRanges = useMemo(() => {
    if (!skipTrash) return [];
    const trashSegments = segments.filter(s => s.type === 'trash').sort((a, b) => a.start - b.start);
    const merged: Range[] = [];
    
    for (const s of trashSegments) {
      if (merged.length === 0) {
        merged.push({ start: s.start, end: s.end });
      } else {
        const last = merged[merged.length - 1];
        if (s.start <= last.end) {
          last.end = Math.max(last.end, s.end);
        } else {
          merged.push({ start: s.start, end: s.end });
        }
      }
    }
    return merged;
  }, [segments, skipTrash]);

  const toVirtualTime = useCallback((realT: number) => {
    let vT = realT;
    for (const hole of trashRanges) {
      if (realT > hole.end) {
        vT -= (hole.end - hole.start);
      } else if (realT > hole.start) {
        vT -= (realT - hole.start);
      }
    }
    return Math.max(0, vT);
  }, [trashRanges]);

  const toRealTime = useCallback((virtualT: number) => {
    let rT = virtualT;
    for (const hole of trashRanges) {
      if (rT >= hole.start) {
        rT += (hole.end - hole.start);
      }
    }
    return Math.min(rT, duration);
  }, [trashRanges, duration]);

  const virtualTime = toVirtualTime(currentTime);
  const virtualDuration = toVirtualTime(duration);

  const virtualSegments = useMemo(() => {
    return segments
      .filter(s => s.type === 'competency')
      .map(s => {
        const vStart = toVirtualTime(s.start);
        const vEnd = toVirtualTime(s.end);
        return { ...s, start: vStart, end: vEnd, physicalStart: s.start, physicalEnd: s.end };
      })
      .filter(s => s.end - s.start > 0.05);
  }, [segments, toVirtualTime]);

  useEffect(() => {
    if (!skipTrash || !isPlaying || trashRanges.length === 0 || !videoRef.current) return;
    
    const currentHole = trashRanges.find(h => currentTime >= h.start && currentTime < h.end);
    if (currentHole) {
      videoRef.current.seek(currentHole.end + 0.01);
    }
  }, [currentTime, trashRanges, skipTrash, isPlaying]);

  const seekTo = useCallback((vTime: number) => { 
    if (videoRef.current) { 
      const targetPhysical = toRealTime(vTime);
      videoRef.current.seek(targetPhysical); 
      setCurrentTime(targetPhysical); 
    } 
  }, [toRealTime]);

  const virtualBoundaries = useMemo(() => {
    const points = new Set([0, virtualDuration]);
    virtualSegments.forEach(s => {
      points.add(s.start);
      points.add(s.end);
    });
    return Array.from(points).sort((a, b) => a - b);
  }, [virtualSegments, virtualDuration]);

  const seekBoundary = useCallback((dir: number) => {
    const threshold = 0.05;
    const boundaries = [...virtualBoundaries];
    
    const target = dir < 0 
      ? boundaries.reverse().find(v => v < virtualTime - threshold) 
      : boundaries.find(v => v > virtualTime + threshold);
    
    if (target !== undefined) {
      seekTo(target);
    } else {
      seekTo(dir < 0 ? 0 : virtualDuration);
    }
  }, [virtualTime, virtualDuration, virtualBoundaries, seekTo]);

  const metrics = useMemo(() => {
    const trash = trashRanges.reduce((a, hole) => a + (hole.end - hole.start), 0);
    return { total: duration, trash, useful: Math.max(0, duration - trash) };
  }, [trashRanges, duration]);

  const competencies = useMemo(() => ({ ...DEFAULT_COMPETENCY_COLORS, ...customCompetencies }), [customCompetencies]);

  const addCompetency = useCallback((name: string) => {
    if (!competencies[name]) {
      const colors = ['#38bdf8', '#a855f7', '#4ade80', '#f97316', '#f472b6', '#fbbf24', '#22d3ee', '#ef4444'];
      setCustomCompetencies(p => ({ ...p, [name]: colors[Math.floor(Math.random() * colors.length)] }));
    }
  }, [competencies]);

  const value = useMemo(() => ({
    videoRef, segments, currentTime, duration, isPlaying, skipTrash, metrics, competencies,
    virtualTime, virtualDuration, virtualSegments,
    setCurrentTime, setDuration, setIsPlaying, addSegment, removeSegment, updateSegment,
    togglePlay, seekTo, formatTime: (s: number) => {
      const m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return `${Math.floor(s / 3600) > 0 ? Math.floor(s / 3600) + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    },
    seekToPreviousBoundary: () => seekBoundary(-1),
    seekToNextBoundary: () => seekBoundary(1),
    addCompetency,
  }), [videoRef, segments, currentTime, duration, isPlaying, skipTrash, metrics, competencies,
       virtualTime, virtualDuration, virtualSegments,
       addSegment, removeSegment, updateSegment, togglePlay, seekTo, seekBoundary, addCompetency]);

  return <VideoEditorContext.Provider value={value}>{children}</VideoEditorContext.Provider>;
};

