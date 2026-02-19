import { useMemo, useState, type MouseEvent } from 'react';
import { useVideoEditor } from '../../hooks/use-video-editor';
import type { Segment } from '../../types/editor';

export const Timeline = () => {
  const {
    duration,
    currentTime,
    segments,
    seekTo,
    removeSegment
  } = useVideoEditor();

  const [hoverX, setHoverX] = useState<number | null>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timelineWidth = 100;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  const { trashSegments, competencyTracks } = useMemo(() => {
    const trash = segments.filter(s => s.type === 'trash');
    const comps = segments.filter(s => s.type === 'competency').sort((a, b) => a.start - b.start);
    
    const tracks: Segment[][] = [];
    comps.forEach(segment => {
      const trackIndex = tracks.findIndex(track => {
        const lastSegment = track[track.length - 1];
        return segment.start >= lastSegment.end;
      });
      
      if (trackIndex === -1) {
        tracks.push([segment]);
      } else {
        tracks[trackIndex].push(segment);
      }
    });

    return { 
      trashSegments: trash, 
      competencyTracks: tracks 
    };
  }, [segments]);

  const ROW_HEIGHT = 42;

  const renderSegment = (segment: Segment, rowOffset: number) => {
    if (duration === 0) return null;
    const left = (segment.start / duration) * 100;
    const width = Math.max(0.2, ((segment.end - segment.start) / duration) * 100); 
    
    return (
      <div
        key={segment.id}
        className="absolute h-8 rounded-lg border transition-all cursor-pointer flex items-center px-3 overflow-hidden group/segment z-30"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${rowOffset + (ROW_HEIGHT - 32) / 2}px`,
          backgroundColor: `${segment.color}99`, 
          borderColor: `${segment.color}aa`,
          backdropFilter: 'blur(8px)',
          color: 'white',
          minWidth: '24px',
          boxShadow: `0 4px 15px ${segment.color}22`
        }}
        onClick={(e) => {
          e.stopPropagation();
          seekTo(segment.start);
        }}
        title={`${segment.label}: ${segment.start.toFixed(1)}s - ${segment.end.toFixed(1)}s`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/segment:opacity-100 transition-opacity" />
        <span className="text-[13px] font-bold uppercase truncate tracking-widest relative z-10 whitespace-nowrap">
          {segment.label}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSegment(segment.id);
          }}
          className="absolute right-1.5 w-5 h-5 bg-black/40 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/segment:opacity-100 transition-all z-40"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  const timeMarkers = useMemo(() => {
    if (duration === 0) return null;
    const markers = [];
    const interval = duration > 600 ? 60 : (duration > 60 ? 10 : 5);
    
    for (let i = 0; i <= duration; i += interval) {
      markers.push(
        <div 
          key={i} 
          className="absolute h-full border-l border-white/10 text-[13px] font-black text-white/50 pl-2 pt-2 flex items-start"
          style={{ left: `${(i / duration) * 100}%` }}
        >
          {Math.floor(i / 60)}:{(i % 60).toString().padStart(2, '0')}
        </div>
      );
    }
    return markers;
  }, [duration]);

  const compTracksCount = Math.max(1, competencyTracks.length);
  const totalCompHeight = compTracksCount * ROW_HEIGHT;

  return (
    <div id="tour-timeline" className="relative flex flex-col select-none bg-black">
      <div className="h-10 border-b border-white/10 relative bg-white/5 shrink-0 overflow-hidden">
        {timeMarkers}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="relative overflow-x-auto custom-scrollbar overflow-y-hidden">
          <div 
            className="relative cursor-crosshair min-w-full"
            style={{ width: `${timelineWidth}%`, minHeight: `${42 + totalCompHeight}px` }}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {hoverX !== null && (
                <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white/20 z-[45] pointer-events-none"
                    style={{ left: `${hoverX}%` }}
                >
                    <div className="absolute top-[12px] -left-1.5 w-3 h-3 bg-white/40 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                    <div className="h-full w-full bg-white/10" />
                </div>
            )}
            <div className="absolute top-0 left-0 right-0 h-[42px] border-b border-white/5 bg-red-500/5">
              {trashSegments.map(s => renderSegment(s, 0))}
            </div>
            
            <div className="absolute top-[42px] left-0 right-0 h-full">
              {Array.from({ length: compTracksCount }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute left-0 right-0 border-b border-white/[0.03]" 
                  style={{ top: `${i * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}
                />
              ))}
              
              {competencyTracks.map((track, trackIndex) => 
                track.map(s => renderSegment(s, trackIndex * ROW_HEIGHT))
              )}
            </div>

            <div 
                className="absolute top-0 bottom-0 w-[2px] bg-white z-50 pointer-events-none"
                style={{ left: `${progress}%` }}
            >
                <div className="absolute top-[12px] -left-1.5 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                <div className="h-full w-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
