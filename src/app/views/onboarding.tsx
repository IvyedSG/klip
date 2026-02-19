import React from 'react';
import { VideoDropzone } from '../../components/ui/video-dropzone';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface OnboardingViewProps {
  videoFile: File | null;
  onVideoSelect: (file: File) => void;
  onResetVideo: () => void;
  onStartAnalysis: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  videoFile,
  onVideoSelect,
  onResetVideo,
  onStartAnalysis,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background selection:bg-accent/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-12 text-center">
        <header className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge>
            ANÁLISIS DE ENTREVISTA
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
            KLIP
          </h1>
          
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Una herramienta diseñada para etiquetar momentos clave, segmentar entrevistas y organizar tus grabaciones de forma eficiente.
          </p>
        </header>

        <section className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000 fill-mode-both">
          {!videoFile ? (
            <VideoDropzone onVideoSelect={onVideoSelect} />
          ) : (
            <Card variant="glass" className="w-full max-w-2xl p-8 rounded-3xl flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{videoFile.name}</h3>
                <p className="text-sm text-text-secondary">Video cargado • {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost"
                  onClick={onResetVideo} 
                >
                  Cambiar Video
                </Button>
                <Button 
                  className="shadow-lg shadow-accent/20"
                  onClick={onStartAnalysis}
                >
                  Abrir Editor
                </Button>
              </div>
            </Card>
          )}
        </section>

        <footer className="w-full pt-12 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-8 text-left opacity-0 animate-in fade-in delay-700 duration-1000 fill-mode-both">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">01. Etiquetado Manual</h4>
            <p className="text-sm text-text-secondary leading-snug">Identifica momentos precisos y márcalos en la línea de tiempo con un clic.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">02. Segmentación</h4>
            <p className="text-sm text-text-secondary leading-snug">Clasifica las partes del video por competencias o categorías personalizadas.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">03. Organización</h4>
            <p className="text-sm text-text-secondary leading-snug">Filtra el contenido irrelevante y mantén solo lo que aporta valor a tu análisis.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};
