import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import type { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
  isCollapsed: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme, isCollapsed }) => {
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
  return (
    <button
      onClick={toggleTheme}
      title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
      className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-out text-left text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-0.5 ${isCollapsed ? 'justify-center' : ''} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
      aria-label={label}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      <span className={`ml-3 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
