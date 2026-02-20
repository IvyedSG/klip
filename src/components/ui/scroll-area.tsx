import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  className = '', 
  orientation = 'vertical' 
}) => {
  const scrollClasses = {
    vertical: 'overflow-y-auto overflow-x-hidden h-full',
    horizontal: 'overflow-x-auto overflow-y-hidden w-full',
    both: 'overflow-auto h-full w-full'
  };

  return (
    <div className={`custom-scrollbar ${scrollClasses[orientation]} ${className}`}>
      {children}
    </div>
  );
};
