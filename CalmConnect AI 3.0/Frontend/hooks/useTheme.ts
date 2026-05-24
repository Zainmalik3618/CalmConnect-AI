import useLocalStorage from './useLocalStorage';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark';

function useTheme(): [Theme, () => void, boolean] {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme, isLoading] = useLocalStorage<Theme>('theme', prefersDark ? 'dark' : 'light');

  useEffect(() => {
    if (!isLoading) {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, isLoading]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme, isLoading];
}

export default useTheme;