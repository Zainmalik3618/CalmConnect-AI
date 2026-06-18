import React from 'react';
import { MoonIcon, SunIcon, LogoIcon } from './Icons';
import type { Theme } from '../hooks/useTheme';

interface PublicHeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  currentPage?: 'home' | 'about' | 'contact';
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ theme, toggleTheme, currentPage = 'home' }) => {
  const linkClass = (page: PublicHeaderProps['currentPage']) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      currentPage === page
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
        : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
    }`;

  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-white/60 bg-white/55 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/55">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <LogoIcon className="h-9 w-9" />
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">CalmConnect AI</p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Clinical support, connected care</p>
          </div>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Public navigation" className="flex items-center gap-1">
            <a href="/about" className={linkClass('about')}>About</a>
            <a href="/contact" className={linkClass('contact')}>Contact Us</a>
          </nav>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-blue-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
