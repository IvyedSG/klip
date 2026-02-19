import { useState } from 'react';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';
import { useVideoEditor } from '../../hooks/use-video-editor';
import type { SegmentType } from '../../types/editor';

export const TaggingControls = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    setIsPlaying,
    seekToPreviousBoundary,
    seekToNextBoundary,
    addSegment,
    formatTime,
    competencies,
    addCompetency,
  } = useVideoEditor();

  const [selectedCompetency, setSelectedCompetency] = useState('Comunicación');
  const [newType, setNewType] = useState<SegmentType>('competency');
  const [startTime, setStartTime] = useState<number | null>(null);
  const newLabel = newType === 'trash' ? 'Relleno' : selectedCompetency;

  const handleToggleTagging = () => {
    if (startTime === null) {
      setStartTime(currentTime);
    } else {
      const end = currentTime;
      const start = Math.min(startTime, end);
      const actualEnd = Math.max(startTime, end);
      
      if (actualEnd - start > 0.5) {
        addSegment({
          label: newType === 'trash' ? 'Relleno' : newLabel,
          start,
          end: actualEnd,
          type: newType,
          color: newType === 'trash' ? (competencies['Relleno'] || '#64748b') : (competencies[newLabel] || '#6366f1'),
        });
      }
      setStartTime(null);
    }
  };

  const formatTimePrecision = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const comboboxOptions = Object.keys(competencies)
    .filter(k => k !== 'Relleno')
    .map(k => ({
      value: k,
      label: k,
      color: competencies[k]
    }));

  return (
    <div id="tour-tagging-controls" className="h-full flex items-center justify-between px-8 gap-10">
      <div className="flex-1 flex items-center justify-start gap-8 min-w-[200px]">
        <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/5 shrink-0">
          <button 
            onClick={() => setNewType('competency')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-black transition-all ${newType === 'competency' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary/50 hover:text-white'}`}
          >
            COMPETENCIA
          </button>
          <button 
            onClick={() => setNewType('trash')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-black transition-all ${newType === 'trash' ? 'bg-waste text-white shadow-lg shadow-waste/20' : 'text-text-secondary/50 hover:text-white'}`}
          >
            RELLENO
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <span className="text-[13px] font-black text-white tracking-tighter w-24 text-right">
            {formatTimePrecision(currentTime)}
        </span>

        <div className="flex items-center gap-4 bg-black/60 p-1.5 rounded-2xl border border-white/5">
            <button 
            onClick={seekToPreviousBoundary}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-text-secondary hover:text-white transition-colors"
            title="Segmento anterior (←)"
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </svg>
            </button>
            <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isPlaying ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
            {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <path d="M5 3l14 9-14 9V3z" />
                </svg>
            )}
            </button>
            <button 
            onClick={seekToNextBoundary}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-text-secondary hover:text-white transition-colors"
            title="Siguiente segmento (→)"
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            </svg>
            </button>
        </div>

        <span className="text-[13px] font-black text-white/20 tracking-tighter w-24">
            {formatTimePrecision(duration)}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-end gap-6 min-w-[320px]">
        <div className="w-64">
            {newType === 'competency' && (
            <Combobox 
                value={selectedCompetency}
                onChange={setSelectedCompetency}
                onCreate={(name) => { addCompetency(name); setSelectedCompetency(name); }}
                options={comboboxOptions}
                className="w-full"
            />
            )}
        </div>

        <Button 
          variant={startTime !== null ? 'primary' : 'secondary'} 
          className={`h-12 w-[180px] gap-4 rounded-2xl transition-all group relative overflow-hidden flex-shrink-0 ${startTime !== null ? 'bg-red-600 border-none shadow-[0_0_25px_rgba(220,38,38,0.3)]' : 'bg-white/10 hover:bg-white/15 border-white/5'}`}
          onClick={handleToggleTagging}
        >
          <div className={`w-3 h-3 rounded-full z-10 ${startTime !== null ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'bg-red-500'}`} />
          <span className="font-black tracking-wider text-[13px] uppercase z-10 whitespace-nowrap">
            {startTime !== null ? `CORTAR (${formatTime(currentTime)})` : 'ETIQUETAR'}
          </span>
          {startTime !== null && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 animate-shimmer" />
          )}
        </Button>
      </div>
    </div>
  );
};
