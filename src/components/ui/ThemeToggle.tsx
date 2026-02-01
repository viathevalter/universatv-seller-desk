
import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../../lib/theme-provider';
import { Button } from './LayoutComponents';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-9 h-9 px-0 rounded-full bg-surfaceHighlight border border-border"
        title="Alterar Tema"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-surface border border-border ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => { setTheme("light"); setIsOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-surfaceHighlight transition-colors ${theme === 'light' ? 'text-primary' : 'text-textMain'}`}
              role="menuitem"
            >
              <Sun size={16} />
              Claro
            </button>
            <button
              onClick={() => { setTheme("dark"); setIsOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-surfaceHighlight transition-colors ${theme === 'dark' ? 'text-primary' : 'text-textMain'}`}
              role="menuitem"
            >
              <Moon size={16} />
              Escuro
            </button>
            <button
              onClick={() => { setTheme("system"); setIsOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-surfaceHighlight transition-colors ${theme === 'system' ? 'text-primary' : 'text-textMain'}`}
              role="menuitem"
            >
              <Laptop size={16} />
              Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
