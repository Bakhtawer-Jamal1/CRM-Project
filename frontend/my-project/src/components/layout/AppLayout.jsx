import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, getInitials } from '../../context/AuthContext';
import NotificationsPanel from '../../features/notifications/NotificationsPanel';

const groups = [
  { title: 'WORKSPACE', links: [['/dashboard', 'Overview', '◫'], ['/contacts', 'Contacts', '◉'], ['/companies', 'Companies', '▦'], ['/deals', 'Deals', '◇'], ['/tasks', 'Tasks', '✓']] },
  { title: 'MANAGE', links: [['/profile', 'Profile', '☺'], ['/settings', 'Settings', '⚙']] },
];
const pageNames = Object.fromEntries(groups.flatMap(group => group.links.map(([path, name]) => [path, name])));

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut: clearAuth } = useAuth();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user?.name || 'User';
  const userRole = user?.role || 'Sales Manager';
  const initials = getInitials(userName);

  function signOut() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  function search(event) {
    event.preventDefault();
    const text = query.trim().toLowerCase();
    const match = groups.flatMap(group => group.links).find(([, name]) => name.toLowerCase().includes(text));
    if (match && text) navigate(match[0]);
    else setNotice(text ? `No page found for "${query.trim()}"` : 'Type a page name to search.');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-[fadeIn_0.5s_ease-out]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden animate-[fadeIn_0.3s_ease-out]" />
      )}

      {/* ===== SIDEBAR (Always dark) ===== */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-900 px-4 py-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Close (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-800 hover:rotate-90 md:hidden"
        >
          ×
        </button>

        {/* Brand */}
        <Link
          to="/dashboard"
          className="mb-8 inline-block text-2xl font-bold tracking-tight text-white transition-all duration-300 hover:scale-105 hover:tracking-wide"
          onClick={() => setSidebarOpen(false)}
        >
          BJ Technologies<span className="text-indigo-400 animate-pulse">.</span>
        </Link>

        {/* Workspace switcher */}
        <button className="group mb-6 flex w-full items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-left transition-all duration-300 hover:border-indigo-500/60 hover:bg-slate-800 hover:-translate-y-0.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
            BJ
          </span>
          <span className="flex-1 overflow-hidden">
            <b className="block truncate text-sm font-semibold text-white">CRM Studio for all companies</b>
            <small className="block truncate text-xs text-slate-400">Sales workspace</small>
          </span>
          <span className="text-slate-400 transition-transform duration-300 group-hover:translate-y-0.5">⌄</span>
        </button>

        {/* Nav groups */}
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div
              key={group.title}
              className="animate-[slideUp_0.5s_ease-out_both]"
              style={{ animationDelay: `${gi * 100}ms` }}
            >
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {group.title}
              </p>
              <nav className="flex flex-col gap-1" aria-label={group.title}>
                {group.links.map(([to, label, icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out hover:translate-x-1 hover:scale-[1.02] ${
                        isActive
                          ? 'bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500/30 font-semibold'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center text-base transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span className="transition-all duration-300 group-hover:tracking-wide">{label}</span>
                    {location.pathname === to && (
                      <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Profile chip */}
        <div className="mt-8 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300 hover:bg-slate-800">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-xs font-bold text-white shadow-md transition-transform duration-500 hover:rotate-[360deg]">
              {initials}
            </span>
            <span className="flex-1 overflow-hidden">
              <b className="block truncate text-sm font-semibold text-white">{userName}</b>
              <small className="block truncate text-xs text-slate-400">{userRole}</small>
            </span>
            <button
              title="Sign out"
              aria-label="Sign out"
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 hover:scale-110"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 backdrop-blur-xl transition-colors duration-300 md:px-6">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="group flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 md:hidden"
          >
            <span className="block h-[2px] w-5 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 group-hover:w-6" />
            <span className="block h-[2px] w-5 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 group-hover:w-4" />
            <span className="block h-[2px] w-5 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 group-hover:w-6" />
          </button>

          {/* Search */}
          <form
            className="group relative flex flex-1 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 max-w-md"
            onSubmit={search}
          >
            <span aria-hidden="true" className="text-slate-400 transition-transform duration-300 group-focus-within:scale-125 group-focus-within:text-indigo-500">⌕</span>
            <input
              aria-label="Search workspace"
              value={query}
              onChange={event => { setQuery(event.target.value); setNotice(''); }}
              placeholder="Search contacts, deals..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <kbd className="hidden rounded border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-400 transition-all duration-300 group-focus-within:border-indigo-400 group-focus-within:text-indigo-500 sm:inline-block">↵</kbd>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 md:inline">
              {pageNames[location.pathname] || 'Workspace'}
            </span>
            <span className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 md:inline-block" />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 hover:rotate-12 active:scale-95"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              <span className="inline-block transition-transform duration-500 hover:rotate-180">
                {theme === 'dark' ? '☼' : '◐'}
              </span>
            </button>
            <NotificationsPanel />
            <Link
              to="/profile"
              title={userName}
              aria-label="My profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-xs font-bold text-white shadow-md transition-transform duration-500 hover:scale-110 hover:rotate-[360deg]"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Toast */}
        {notice && (
          <div
            className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 shadow-sm animate-[slideDown_0.4s_ease-out] md:mx-6"
            role="status"
          >
            <span className="animate-[fadeIn_0.5s_ease-out]">{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Dismiss" className="ml-3 flex h-6 w-6 items-center justify-center rounded-md transition-all duration-300 hover:bg-indigo-500/10 hover:rotate-90">×</button>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 animate-[fadeIn_0.6s_ease-out]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}