import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('meridian-theme') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;

    // Smooth transition — no blink, just gentle color crossfade
    root.style.setProperty(
      'transition',
      'background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, fill 0.4s ease, stroke 0.4s ease'
    );

    // Apply theme
    root.dataset.theme = theme;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    localStorage.setItem('meridian-theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme(current => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// This shared hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}