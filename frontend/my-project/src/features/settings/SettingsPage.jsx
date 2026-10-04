import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const defaults = { name: 'Ayesha Khan', email: 'ayesha.test01@example.com', weeklySummary: true, taskReminders: true };

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('meridian-settings') || '{}');
      return { ...defaults, ...stored, name: stored.name || user?.name || defaults.name, email: stored.email || user?.email || defaults.email };
    } catch { return defaults; }
  });
  const [saved, setSaved] = useState(false);

  function update(key, value) {
    setSaved(false);
    setSettings(current => ({ ...current, [key]: value }));
  }

  function save() {
    // 1) localStorage mein save
    localStorage.setItem('meridian-settings', JSON.stringify(settings));

    // 2) AuthContext mein bhi update — sidebar/topbar turant change ho
    setUser(prev => ({ ...(prev || {}), name: settings.name, email: settings.email }));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600";

  const sectionClass = "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both] sm:p-6";

  return (
    <section className="animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-[slideUp_0.5s_ease-out_both]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">WORKSPACE / PREFERENCES</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile and workspace preferences.</p>
        </div>
        <span
          aria-live="polite"
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-500 ${
            saved
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className={`inline-block h-2 w-2 rounded-full ${saved ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {saved ? 'Changes saved' : 'Saved on this device'}
        </span>
      </header>

      <div className="space-y-4">
        <section className={sectionClass} style={{ animationDelay: '150ms' }}>
          <header className="mb-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-base text-white shadow-md transition-transform duration-500 hover:rotate-12 hover:scale-110">◉</span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Profile</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your account details shown in the workspace.</p>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
              <input value={settings.name} onChange={event => update('name', event.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
              <input type="email" value={settings.email} onChange={event => update('email', event.target.value)} className={inputClass} />
            </label>
          </div>
        </section>

        <section className={sectionClass} style={{ animationDelay: '250ms' }}>
          <header className="mb-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-base text-white shadow-md transition-transform duration-500 hover:rotate-12 hover:scale-110">◐</span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Appearance</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose how Meridian looks on this device.</p>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Color theme">
            {[
              { key: 'light', label: 'Light', sub: 'Clean and bright', preview: 'bg-gradient-to-br from-white to-slate-100 border-slate-200' },
              { key: 'dark', label: 'Dark', sub: 'Easy on the eyes', preview: 'bg-gradient-to-br from-slate-800 to-slate-950 border-slate-700' },
            ].map((option, i) => {
              const active = theme === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => theme !== option.key && toggleTheme()}
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                    active
                      ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={{ animationDelay: `${350 + i * 80}ms` }}
                >
                  <span className={`h-10 w-10 shrink-0 rounded-lg border ${option.preview} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`} />
                  <span className="flex-1 overflow-hidden">
                    <b className="block text-sm font-semibold text-slate-900 dark:text-white">{option.label}</b>
                    <small className="block text-xs text-slate-500 dark:text-slate-400">{option.sub}</small>
                  </span>
                  {active && <i className="not-italic flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs text-white shadow-md animate-[fadeIn_0.3s_ease-out]">✓</i>}
                </button>
              );
            })}
          </div>
        </section>

        <section className={sectionClass} style={{ animationDelay: '350ms' }}>
          <header className="mb-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-base text-white shadow-md transition-transform duration-500 hover:rotate-12 hover:scale-110">♧</span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Notifications</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose which updates you want to receive.</p>
            </div>
          </header>
          <div className="space-y-2">
            {[
              { key: 'weeklySummary', title: 'Weekly summary', sub: 'A recap of your pipeline and activity.' },
              { key: 'taskReminders', title: 'Task reminders', sub: 'Reminders for upcoming and overdue tasks.' },
            ].map((row) => (
              <label key={row.key} className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm">
                <span className="flex-1">
                  <b className="block text-sm font-semibold text-slate-900 dark:text-white transition-all duration-300 group-hover:tracking-wide">{row.title}</b>
                  <small className="block text-xs text-slate-500 dark:text-slate-400">{row.sub}</small>
                </span>
                <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                  <input type="checkbox" checked={settings[row.key]} onChange={event => update(row.key, event.target.checked)} className="peer sr-only" />
                  <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${settings[row.key] ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${settings[row.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both] sm:flex-row sm:items-center" style={{ animationDelay: '600ms' }}>
        <p className="text-xs text-slate-500 dark:text-slate-400">Preferences are saved locally in this browser.</p>
        <button
          type="button"
          onClick={save}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95"
        >
          <span className="text-base transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">✓</span>
          <span className="transition-all duration-300 group-hover:tracking-wide">Save changes</span>
        </button>
      </footer>
    </section>
  );
}