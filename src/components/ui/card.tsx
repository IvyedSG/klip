import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'panel' | 'outline' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'panel' 
}) => {
  const variants = {
    panel: 'bg-panel border border-border shadow-xl',
    outline: 'border border-border',
    glass: 'border border-accent/20 bg-accent/5 backdrop-blur-xl',
  };

  return (
    <div className={`rounded-2xl p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
