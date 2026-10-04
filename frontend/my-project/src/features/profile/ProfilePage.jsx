import { useEffect, useState } from 'react';
import { apiRequest } from '../../services/apiClient';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/users/me')
      .then(result => { if (active) setUser(result.user); })
      .catch(err => { if (active) setError(err.message || 'Could not load profile.'); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl animate-[fadeIn_0.5s_ease-out]">
        <header className="mb-6 animate-[slideUp_0.5s_ease-out_both]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">ACCOUNT</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide sm:text-3xl">
            My profile
          </h1>
        </header>
        <p role="alert" className="flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300 shadow-sm animate-[slideDown_0.4s_ease-out]">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 animate-ping" />
          <span>{error}</span>
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl animate-[fadeIn_0.5s_ease-out]">
        <header className="mb-6 animate-[slideUp_0.5s_ease-out_both]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">ACCOUNT</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">My profile</h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500" />
          <span className="animate-pulse">Loading profile...</span>
        </div>
      </section>
    );
  }

  const initials = user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();

  const details = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Member since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
  ];

  return (
    <section className="mx-auto max-w-3xl animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-6 animate-[slideUp_0.5s_ease-out_both]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">ACCOUNT</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide sm:text-3xl">
          My profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your account details shown across the workspace.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both]">
        <header className="relative flex flex-col items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 px-6 py-6 sm:flex-row sm:items-center sm:gap-5 sm:px-8 sm:py-7">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-transform duration-500 hover:scale-110 hover:rotate-[360deg]">
            {initials}
            <span className="absolute inset-0 rounded-full ring-2 ring-white/40 dark:ring-slate-900/40 animate-pulse" />
          </span>
          <div className="text-center sm:text-left animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: '150ms' }}>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{user.name}</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </header>

        <dl className="divide-y divide-slate-100 dark:divide-slate-800">
          {details.map((row, index) => (
            <div
              key={row.label}
              className="group flex flex-col gap-1 px-6 py-4 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:pl-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 animate-[slideUp_0.5s_ease-out_both]"
              style={{ animationDelay: `${250 + index * 80}ms` }}
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{row.label}</dt>
              <dd className="truncate text-sm font-medium text-slate-900 dark:text-slate-100 transition-all duration-300 group-hover:tracking-wide">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[loadingBar_3s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}