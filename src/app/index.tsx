import { useState } from 'react';
import { OnboardingView } from './views/onboarding';
import { EditorView } from './views/editor';

export const AppRouter = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [view, setView] = useState<'onboarding' | 'editor'>('onboarding');

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
  };

  const handleStartEditor = () => {
    if (videoFile) setView('editor');
  };

  const handleBack = () => {
    setView('onboarding');
  };

  const handleResetVideo = () => {
    setVideoFile(null);
  };

  if (view === 'editor' && videoFile) {
    return <EditorView videoFile={videoFile} onBack={handleBack} />;
  }

  return (
    <OnboardingView 
      videoFile={videoFile}
      onVideoSelect={handleVideoSelect}
      onResetVideo={handleResetVideo}
      onStartEditor={handleStartEditor}
    />
  );
};
