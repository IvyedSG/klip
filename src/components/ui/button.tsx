import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'bg-panel text-white hover:bg-neutral-800',
    outline: 'border border-border text-text-primary hover:bg-neutral-900',
    ghost: 'text-text-secondary hover:text-white hover:bg-neutral-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[13px]',
    md: 'px-6 py-2.5 text-[13px]',
    lg: 'px-8 py-3.5 text-[13px]',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
