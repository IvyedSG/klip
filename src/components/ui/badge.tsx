import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  dot = false
}) => {
  const variants = {
    primary: 'bg-accent text-white shadow-lg shadow-accent/20 border-transparent',
    secondary: 'bg-panel border-border text-text-primary hover:bg-neutral-800',
    outline: 'border-border text-text-secondary hover:text-text-primary hover:border-text-secondary',
    glass: 'bg-accent/10 border-accent/20 text-accent backdrop-blur-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[13px] font-bold uppercase tracking-[0.2em] ${variants[variant]} ${className}`}>
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
      )}
      {children}
    </div>
  );
};
