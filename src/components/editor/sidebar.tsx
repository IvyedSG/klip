import { Badge } from '../ui/badge';
import { useVideoEditor } from '../../hooks/use-video-editor';
import { ScrollArea } from '../ui/scroll-area';

export const Sidebar = () => {
  const {
    segments,
    removeSegment,
    seekTo,
    formatTime,
    metrics,
  } = useVideoEditor();

  return (
    <aside id="tour-sidebar" className="w-full h-full flex flex-col overflow-hidden shrink-0">
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 p-6 flex flex-col gap-3">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-text-secondary/60 mb-3">Evidencias de Competencias</h3>
          
          {segments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M7 7h10M7 12h10M7 17h10" />
                  </svg>
                  <p className="text-[13px] mt-4 font-medium tracking-wide">No hay etiquetas aún.<br/>Usa los controles de abajo.</p>
              </div>
          ) : (
              segments.map((s) => (
                  <div 
                      key={s.id}
                      className="group relative bg-neutral-900/20 hover:bg-neutral-800/40 border border-border/10 rounded-2xl p-4 transition-all cursor-pointer"
                      onClick={() => seekTo(s.start)}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: s.color, color: s.color }} />
                              <span className="text-[13px] font-bold tracking-tight text-text-primary">{s.label}</span>
                          </div>
                          <button 
                              onClick={(e) => { e.stopPropagation(); removeSegment(s.id); }}
                              className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                          </button>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[13px] text-text-secondary">
                              {formatTime(s.start)} — {formatTime(s.end)}
                          </span>
                          <Badge variant="outline" className="text-[13px] py-0.5 px-1.5 opacity-80 border-border/50">
                              {formatTime(s.end - s.start)}
                          </Badge>
                      </div>
                  </div>
              ))
          )}
        </ScrollArea>
      </div>
      <div className="px-6 h-24 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-4 shrink-0">
        <div className="flex items-center gap-8">
            <div className="flex flex-col">
                <span className="text-[13px] uppercase tracking-widest text-text-secondary/50 font-black leading-none mb-1">TOTAL</span>
                <span className="text-[13px] font-black text-white leading-none">{formatTime(metrics.total)}</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col">
                <span className="text-[13px] uppercase tracking-widest text-text-secondary/50 font-black leading-none mb-1">Relleno</span>
                <span className="text-[13px] font-black text-waste leading-none">{formatTime(metrics.trash)}</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex flex-col">
                <span className="text-[13px] uppercase tracking-widest text-text-secondary/50 font-black leading-none mb-1">ÚTIL</span>
                <span className="text-[13px] font-black text-accent leading-none">{formatTime(metrics.useful)}</span>
            </div>
        </div>
      </div>
    </aside>
  );
};