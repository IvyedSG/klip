import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export type SegmentType = 'competency' | 'trash';

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  type: SegmentType;
  color: string;
}

export const DEFAULT_COMPETENCY_COLORS: Record<string, string> = {
  'Liderazgo': '#38bdf8',
  'Comunicación': '#a855f7', 
  'Trabajo en Equipo': '#4ade80',
  'Pensamiento Crítico': '#f97316',
  'Adaptabilidad': '#f472b6',
  'Relleno': '#64748b',
};

export const useVideoAnalysis = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customCompetencies, setCustomCompetencies] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [skipTrash, setSkipTrash] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const addSegment = useCallback((segmentData: Omit<Segment, 'id'>) => {
    const newSegment: Segment = {
      ...segmentData,
      id: crypto.randomUUID(),
    };

    setSegments(prev => {
      let nextSegments: (Segment | Segment[])[] = [...prev];

      if (newSegment.type === 'trash') {
        nextSegments = nextSegments.map(s => {
          if (Array.isArray(s)) return s;
          
          if (s.start >= newSegment.start && s.end <= newSegment.end) return [];
          
          if (s.start < newSegment.start && s.end > newSegment.end) {
            if (s.type === 'trash') return s; 
            return [
              { ...s, id: crypto.randomUUID(), end: newSegment.start },
              { ...s, id: crypto.randomUUID(), start: newSegment.end }
            ];
          }

          if (s.end > newSegment.start && s.end <= newSegment.end) {
            return { ...s, end: newSegment.start };
          }

          if (s.start >= newSegment.start && s.start < newSegment.end) {
            return { ...s, start: newSegment.end };
          }

          return s;
        });
      } else {
        nextSegments = nextSegments.map(s => {
          if (Array.isArray(s)) return s;
          if (s.type !== 'trash') return s;

          if (s.start >= newSegment.start && s.end <= newSegment.end) return [];

          if (s.start < newSegment.start && s.end > newSegment.end) {
            return [
              { ...s, id: crypto.randomUUID(), end: newSegment.start },
              { ...s, id: crypto.randomUUID(), start: newSegment.end }
            ];
          }

          if (s.end > newSegment.start && s.end <= newSegment.end) {
            return { ...s, end: newSegment.start };
          }

          if (s.start >= newSegment.start && s.start < newSegment.end) {
            return { ...s, start: newSegment.end };
          }

          return s;
        });
      }

      const flatSegments = nextSegments.flat().filter((s): s is Segment => !!s);
      
      const trash = flatSegments.filter(s => s.type === 'trash').sort((a, b) => a.start - b.start);
      const competencies = flatSegments.filter(s => s.type === 'competency');
      
      const mergedTrash: Segment[] = [];
      const tempNewTrash = newSegment.type === 'trash' ? newSegment : null;
      
      const allTrashCandidates = tempNewTrash ? [...trash, tempNewTrash] : trash;
      allTrashCandidates.sort((a, b) => a.start - b.start);

      if (allTrashCandidates.length > 0) {
        let current = { ...allTrashCandidates[0] };
        for (let i = 1; i < allTrashCandidates.length; i++) {
          if (allTrashCandidates[i].start <= current.end) {
            current.end = Math.max(current.end, allTrashCandidates[i].end);
          } else {
            mergedTrash.push(current);
            current = { ...allTrashCandidates[i] };
          }
        }
        mergedTrash.push(current);
      }

      const finalSegments = [
        ...competencies,
        ...(newSegment.type === 'competency' ? [newSegment] : []),
        ...mergedTrash
      ];

      return finalSegments.sort((a, b) => a.start - b.start);
    });
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  useEffect(() => {
    if (!skipTrash || !isPlaying) return;

    const trashSegments = segments.filter(s => s.type === 'trash');
    const currentTrash = trashSegments.find(s => currentTime >= s.start && currentTime < s.end);

    if (currentTrash && videoRef.current) {
      console.log('Smart Skip: Jumping over relleno segment', currentTrash.label);
      videoRef.current.currentTime = currentTrash.end;
    }
  }, [currentTime, segments, skipTrash, isPlaying]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const getBoundaries = useCallback(() => {
    const boundaries = new Set<number>([0, duration]);
    segments
      .filter(s => s.type !== 'trash')
      .forEach(s => {
        boundaries.add(s.start);
        boundaries.add(s.end);
      });
    return Array.from(boundaries).sort((a, b) => a - b);
  }, [segments, duration]);

  const seekToPreviousBoundary = useCallback(() => {
    const boundaries = getBoundaries();
    const prev = boundaries.reverse().find(b => b < currentTime - 0.15);
    if (prev !== undefined) seekTo(prev);
    else seekTo(0);
  }, [currentTime, getBoundaries, seekTo]);

  const seekToNextBoundary = useCallback(() => {
    const boundaries = getBoundaries();
    const next = boundaries.find(b => b > currentTime + 0.15);
    if (next !== undefined) seekTo(next);
    else seekTo(duration);
  }, [currentTime, duration, getBoundaries, seekTo]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateMetrics = useCallback(() => {
    const trashTime = segments
      .filter(s => s.type === 'trash')
      .reduce((acc, s) => acc + (s.end - s.start), 0);
    
    return {
      total: duration,
      trash: trashTime,
      useful: Math.max(0, duration - trashTime),
    };
  }, [segments, duration]);

  const allCompetencies = useMemo(() => ({ 
    ...DEFAULT_COMPETENCY_COLORS, 
    ...customCompetencies 
  }), [customCompetencies]);

  const addCompetency = useCallback((name: string) => {
    if (!allCompetencies[name]) {
      const colors = ['#38bdf8', '#a855f7', '#4ade80', '#f97316', '#f472b6', '#fbbf24', '#22d3ee', '#ef4444'];
      const finalColor = colors[Math.floor(Math.random() * colors.length)];
      setCustomCompetencies(prev => ({ ...prev, [name]: finalColor }));
    }
  }, [allCompetencies]);

  return {
    videoRef,
    segments,
    currentTime,
    duration,
    isPlaying,
    skipTrash,
    setSkipTrash,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    addSegment,
    removeSegment,
    updateSegment,
    togglePlay,
    seekTo,
    seekToPreviousBoundary,
    seekToNextBoundary,
    formatTime,
    metrics: calculateMetrics(),
    competencies: allCompetencies,
    addCompetency,
  };
};
