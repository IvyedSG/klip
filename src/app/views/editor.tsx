import React from 'react';
import { Button } from '../../components/ui/button';
import { VideoPlayer } from '../../components/editor/video-player';
import { TaggingControls } from '../../components/editor/tag-controls';
import { Sidebar } from '../../components/editor/sidebar';
import { Timeline } from '../../components/editor/timeline';
import { useVideoEditor } from '../../hooks/use-video-editor';
import { VideoProvider } from '../../context/video-context';
import { OnboardingTour } from '../../components/ui/onboarding-tour';

interface EditorViewProps {
  videoFile: File;
  onBack: () => void;
}

const EditorContent: React.FC<EditorViewProps> = ({ videoFile, onBack }) => {
  const [videoUrl] = React.useState(() => URL.createObjectURL(videoFile));
  const { 
    videoRef,
    seekToPreviousBoundary, 
    seekToNextBoundary, 
    togglePlay 
  } = useVideoEditor();
  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        seekToPreviousBoundary();
      } else if (e.key === 'ArrowRight') {
        seekToNextBoundary();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seekToPreviousBoundary, seekToNextBoundary, togglePlay]);

  return (
    <div id="editor-root" className="h-screen overflow-hidden bg-[#050505] text-text-primary flex flex-col px-12 lg:px-20 xl:px-32">
      <OnboardingTour />
      <header className="h-16 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-[13px] font-black tracking-tight flex items-center gap-2">
              {videoFile.name}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
        </div>
      </header>

      <main className="flex-1 flex flex-col pb-12 gap-6 min-h-0">
        <div className="flex-[2] flex gap-4 min-h-0">
            <div className="flex-[3] flex flex-col gap-4 min-h-0">
                <div className="flex-1 bg-black rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative group">
                    <VideoPlayer videoUrl={videoUrl} ref={videoRef} />
                </div>

                <div className="shrink-0 bg-white/[0.03] border border-white/5 rounded-3xl shadow-lg h-24 overflow-visible">
                    <TaggingControls />
                </div>
            </div>

            <div className="flex-[1] bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
                <Sidebar />
            </div>
        </div>

        <div className="shrink-0 flex flex-col bg-white/[0.03] border-y border-white/5 min-h-[160px]">
            <div className="flex-1 relative flex flex-col min-h-0">
                <Timeline />
            </div>
        </div>
      </main>
    </div>
  );
};

export const EditorView: React.FC<EditorViewProps> = (props) => (
  <VideoProvider>
    <EditorContent {...props} />
  </VideoProvider>
);
