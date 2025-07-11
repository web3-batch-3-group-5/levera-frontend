'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/shared/Button';
import { Moon, Sun, Computer } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className='relative' ref={menuRef}>
      <Button variant='ghost' size='icon' onClick={toggleMenu} aria-label='Toggle theme' className='h-9 w-9 rounded-md'>
        {theme === 'dark' ? (
          <Moon className='h-[1.2rem] w-[1.2rem]' />
        ) : theme === 'light' ? (
          <Sun className='h-[1.2rem] w-[1.2rem]' />
        ) : (
          <Computer className='h-[1.2rem] w-[1.2rem]' />
        )}
      </Button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-36 bg-card rounded-md shadow-lg overflow-hidden z-50 border'>
          <div className='py-1' role='menu' aria-orientation='vertical'>
            <button
              className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent ${theme === 'light' ? 'bg-muted/60' : ''}`}
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              role='menuitem'
            >
              <Sun className='mr-2 h-4 w-4' />
              Light
            </button>
            <button
              className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent ${theme === 'dark' ? 'bg-muted/60' : ''}`}
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              role='menuitem'
            >
              <Moon className='mr-2 h-4 w-4' />
              Dark
            </button>
            <button
              className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent ${theme === 'system' ? 'bg-muted/60' : ''}`}
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              role='menuitem'
            >
              <Computer className='mr-2 h-4 w-4' />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
