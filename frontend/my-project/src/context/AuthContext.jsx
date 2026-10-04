import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('crm_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem('crm_user', JSON.stringify(user));
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    signOut: () => {
      sessionStorage.removeItem('crm_token');
      sessionStorage.removeItem('crm_user');
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This context hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// This utility is intentionally shared from the auth context module.
// eslint-disable-next-line react-refresh/only-export-components
export function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}