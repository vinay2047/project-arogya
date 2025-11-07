'use client';

import clsx from 'clsx';
import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {},
});

export default function AnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('analyzer-theme');
    if (stored === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('analyzer-theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div
        className={clsx(
          'min-h-screen transition-colors duration-300',
          isDark
            ? 'dark bg-slate-900 text-slate-200'
            : 'bg-slate-50 text-slate-900'
        )}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
