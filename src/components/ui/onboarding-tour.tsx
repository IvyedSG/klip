import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'editor-root',
    title: '¡Bienvenido a Klip!',
    description: 'Optimiza el análisis de tus entrevistas laborales. Identifica competencias clave y elimina el tiempo muerto de forma eficiente.',
    position: 'center'
  },
  {
    targetId: 'tour-tagging-controls',
    title: 'Controles de Etiquetado',
    description: 'Selecciona "COMPETENCIA" o "RELLENO" según necesites. Haz clic en "ETIQUETAR" para marcar el inicio y el mismo botón cambiará a "CORTAR" para definir el segmento. Usa las flechas para navegar entre etiquetas.',
    position: 'top'
  },
  {
    targetId: 'tour-skip-trash',
    title: 'Salto Automático',
    description: 'Al activar "Saltar Relleno", el reproductor omitirá automáticamente todas las partes marcadas como relleno durante la reproducción.',
    position: 'bottom'
  },
  {
    targetId: 'tour-sidebar',
    title: 'Métricas de la Entrevista',
    description: 'Visualiza el desglose de tiempo de valor vs. relleno y gestiona todas las evidencias de competencias detectadas.',
    position: 'left'
  },
  {
    targetId: 'tour-timeline',
    title: 'Línea de Análisis',
    description: 'Navega por la conversación y ubica con precisión cada respuesta relevante del candidato.',
    position: 'top'
  }
];

export const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('klip-onboarding-seen');
  });

  useEffect(() => {
    if (!isVisible) return;

    const updateRect = () => {
      const step = steps[currentStep];
      if (step.targetId === 'editor-root') {
        setTargetRect(null);
        return;
      }
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem('klip-onboarding-seen', 'true');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('klip-onboarding-seen', 'true');
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          style={{
            maskImage: targetRect ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, black ${Math.max(targetRect.width, targetRect.height) / 2 + 40}px)` : 'none',
            WebkitMaskImage: targetRect ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, black ${Math.max(targetRect.width, targetRect.height) / 2 + 40}px)` : 'none',
          }}
          onClick={handleSkip}
        />
      </AnimatePresence>

      {targetRect && (
        <motion.div 
          layoutId="spotlight"
          className="absolute border-2 border-accent/50 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.3)] z-[101]"
          initial={false}
          animate={{
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative z-[102] w-[400px] bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl pointer-events-auto flex flex-col gap-6"
        style={targetRect ? {
          position: 'absolute',
          ...(step.position === 'top' && { bottom: `calc(100vh - ${targetRect.top - 40}px)`, left: targetRect.left + targetRect.width / 2 - 200 }),
          ...(step.position === 'bottom' && { top: targetRect.bottom + 40, left: targetRect.left + targetRect.width / 2 - 200 }),
          ...(step.position === 'left' && { right: `calc(100vw - ${targetRect.left - 40}px)`, top: targetRect.top + targetRect.height / 2 - 100 }),
          ...(step.position === 'right' && { left: targetRect.right + 40, top: targetRect.top + targetRect.height / 2 - 100 }),
        } : {}}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-accent' : 'w-2 bg-white/10'}`} 
              />
            ))}
          </div>
          <button onClick={handleSkip} className="text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            Saltar
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black tracking-tight text-white">{step.title}</h3>
          <p className="text-[14px] text-text-secondary leading-relaxed font-medium">
            {step.description}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          {currentStep > 0 && (
            <Button 
              variant="secondary" 
              className="flex-1 h-12 rounded-2xl font-black tracking-wider text-[13px] bg-white/5 hover:bg-white/10 text-white border-white/5"
              onClick={handleBack}
            >
              ATRÁS
            </Button>
          )}
          <Button 
            variant="primary" 
            className="flex-1 h-12 rounded-2xl font-black tracking-wider text-[13px] bg-accent hover:bg-accent/90"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? '¡EMPEZAR!' : 'SIGUIENTE'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
