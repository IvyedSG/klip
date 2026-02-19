import React, { useState, useRef, useEffect, useMemo } from 'react';

interface ComboboxOption {
  value: string;
  label: string;
  color?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onCreate?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  onCreate,
  className = '',
  placeholder = 'Buscar o crear...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = useMemo(() => {
    return options.filter(o => 
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => setSearch(''), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      const existing = options.find(o => o.label.toLowerCase() === search.toLowerCase());
      if (existing) {
        onChange(existing.value);
      } else if (onCreate) {
        onCreate(search.trim());
        onChange(search.trim());
      }
      setIsOpen(false);
      setSearch('');
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        className={`w-full h-12 bg-white/5 border rounded-xl px-4 flex items-center justify-between gap-3 transition-all ${isOpen ? 'border-accent/50 bg-white/10 ring-4 ring-accent/10' : 'border-white/10 hover:bg-white/10'} outline-none`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {selectedOption?.color && (
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: selectedOption.color }} 
            />
          )}
          <span className="truncate text-[13px] font-bold text-white">
            {selectedOption ? selectedOption.label : 'Seleccionar...'}
          </span>
        </div>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : 'text-text-secondary/50'}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-4 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Search Input In Dropdown */}
          <div className="p-2 border-b border-white/5 bg-white/5">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full h-9 bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 text-[13px] font-bold text-white outline-none focus:border-accent/50 placeholder:text-white/20"
              />
              <svg 
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
          </div>

          <div className="p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-[13px] font-bold transition-all hover:bg-white/5 ${value === option.value ? 'bg-accent/10 text-accent' : 'text-text-secondary/80 hover:text-white'}`}
                >
                  {option.color && (
                    <div 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: option.color }} 
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="ml-auto">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
                search.trim() !== '' && (
                    <button
                        onClick={() => {
                            if (onCreate) onCreate(search.trim());
                            onChange(search.trim());
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl flex flex-col items-start gap-1 transition-all hover:bg-accent/10 group text-left"
                    >
                        <span className="text-[13px] text-text-secondary/60 uppercase font-black tracking-widest">Crear nueva</span>
                        <span className="text-[13px] font-bold text-accent group-hover:text-white truncate w-full">"{search}"</span>
                    </button>
                )
            )}
            
            {filteredOptions.length === 0 && search.trim() === '' && (
                <div className="p-4 text-center">
                    <p className="text-[13px] text-white/20 font-black uppercase tracking-widest">Nada encontrado</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
