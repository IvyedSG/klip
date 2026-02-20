import { useMemo, useState, type MouseEvent } from 'react';
import { useVideoEditor } from '../../hooks/use-video-editor';
import { ScrollArea } from '../ui/scroll-area';
import type { Segment } from '../../types/editor';

export const Timeline = () => {
  const {
    duration,
    currentTime,
    virtualDuration,
    virtualTime,
    virtualSegments,
    seekTo,
    removeSegment,
    skipTrash
  } = useVideoEditor();

  const [hoverX, setHoverX] = useState<number | null>(null);
  
  const displayDuration = skipTrash ? virtualDuration : duration;
  const displayTime = skipTrash ? virtualTime : currentTime;

  const pixelsPerSecond = useMemo(() => {
    if (displayDuration < 60) return 40; 
    if (displayDuration < 300) return 20; 
    return 12; 
  }, [displayDuration]);

  const timelineWidthPx = displayDuration * pixelsPerSecond;
  const progress = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    seekTo(percentage * displayDuration);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  const { competencyTracks } = useMemo(() => {
    const comps = [...virtualSegments].sort((a, b) => a.start - b.start);
    
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
      competencyTracks: tracks 
    };
  }, [virtualSegments]);

  const ROW_HEIGHT = 42;

  const renderSegment = (segment: Segment, rowOffset: number) => {
    if (displayDuration === 0) return null;
    const left = (segment.start / displayDuration) * 100;
    const width = Math.max(0.2, ((segment.end - segment.start) / displayDuration) * 100);
    const isActive = displayTime >= segment.start && displayTime <= segment.end;
    
    return (
      <div
        key={segment.id}
        className={`absolute h-8 rounded-lg border transition-all cursor-pointer flex items-center px-3 overflow-hidden group/segment z-30 ${isActive ? 'ring-2 ring-white/50' : ''}`}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${rowOffset + (ROW_HEIGHT - 32) / 2}px`,
          backgroundColor: isActive ? `${segment.color}cc` : `${segment.color}99`, 
          borderColor: isActive ? 'white' : `${segment.color}aa`,
          backdropFilter: 'blur(8px)',
          color: 'white',
          minWidth: '24px',
          boxShadow: isActive ? `0 0 20px ${segment.color}66` : `0 4px 15px ${segment.color}22`,
          opacity: isActive ? 1 : 0.8
        }}
        onClick={(e) => {
          e.stopPropagation();
          seekTo(segment.start);
        }}
        title={`${segment.label}: ${segment.start.toFixed(1)}s - ${segment.end.toFixed(1)}s`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/segment:opacity-100 transition-opacity" />
        <span className={`text-[13px] font-bold uppercase truncate tracking-widest relative z-10 whitespace-nowrap ${isActive ? 'text-white' : 'text-white/90'}`}>
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
    if (displayDuration === 0) return null;
    const markers = [];
    
    let interval = 1;
    if (displayDuration > 600) interval = 30;     
    else if (displayDuration > 300) interval = 15; 
    else if (displayDuration > 60) interval = 5;   
    
    for (let i = 0; i <= displayDuration; i += interval) {
      markers.push(
        <div 
          key={i} 
          className="absolute h-full border-l border-white/10 text-[11px] font-black text-white/40 pl-1.5 pt-1.5 flex items-start"
          style={{ left: `${(i / displayDuration) * 100}%` }}
        >
          {Math.floor(i / 60)}:{(i % 60).toString().padStart(2, '0')}
        </div>
      );
    }
    return markers;
  }, [displayDuration]);


  return (
    <div id="tour-timeline" className="relative flex flex-col select-none bg-[#020202] h-full border-t border-white/5 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
      <ScrollArea orientation="both" className="flex-1">
        <div 
          className="relative min-h-full"
          style={{ width: `${Math.max(100, timelineWidthPx)}px`, height: `${Math.max(160, competencyTracks.length * ROW_HEIGHT + 32)}px` }}
        >
          <div className="h-8 border-b border-white/10 relative bg-white/[0.03] sticky top-0 z-[60] backdrop-blur-md">
            {timeMarkers}
          </div>

          <div 
            className="relative cursor-crosshair min-h-full"
            style={{ width: '100%' }}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.max(3, competencyTracks.length) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border-b border-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'}`}
                  style={{ height: `${ROW_HEIGHT}px` }}
                />
              ))}
            </div>

            {hoverX !== null && (
                <div 
                    className="absolute top-0 bottom-0 w-[1px] bg-white/20 z-[45] pointer-events-none"
                    style={{ left: `${hoverX}%` }}
                >
                    <div className="absolute top-[8px] -left-[4.5px] w-2.5 h-2.5 bg-white/40 rounded-full" />
                    <div className="absolute inset-y-0 left-0 w-[1px] bg-white/10" />
                </div>
            )}

            <div className="relative z-30 pt-0">
              {competencyTracks.map((track, trackIndex) => 
                track.map(s => renderSegment(s, trackIndex * ROW_HEIGHT))
              )}
            </div>

            <div 
                className="absolute top-0 bottom-0 w-[1px] bg-white/80 z-50 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                style={{ left: `${progress}%` }}
            >
                <div className="absolute top-[8px] -left-[4.5px] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-[51]" />
                <div className="h-full w-full bg-white" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
