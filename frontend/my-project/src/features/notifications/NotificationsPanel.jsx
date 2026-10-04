import { useEffect, useState } from 'react';
import { tasksApi } from '../tasks/tasksApi';

function getDueDate(value) {
  const date = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) date.setHours(23, 59, 59, 999);
  return date;
}

export default function NotificationsPanel({ onOpenTasks }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: false, error: '', tasks: [], checkedAt: 0 });

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    tasksApi.list()
      .then(result => {
        const checkedAt = Date.now();
        const cutoff = checkedAt + 24 * 60 * 60 * 1000;
        const tasks = (result.tasks || result || [])
          .filter(task => !task.completed && task.dueDate && getDueDate(task.dueDate).getTime() < cutoff)
          .sort((a, b) => getDueDate(a.dueDate) - getDueDate(b.dueDate))
          .slice(0, 5);
        if (active) setState({ loading: false, error: '', tasks, checkedAt });
      })
      .catch(error => {
        if (active) setState({ loading: false, error: error.message || 'Could not load reminders.', tasks: [], checkedAt: 0 });
      });

    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        aria-expanded={open}
        aria-label="Notifications"
        title="Notifications"
        onClick={() => {
          if (!open) setState({ loading: true, error: '', tasks: [], checkedAt: 0 });
          setOpen(value => !value);
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 active:scale-95"
      >
        <span className="text-base">♧</span>
        <i className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
        <i className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 animate-[fadeIn_0.25s_ease-out]"
          />

          <section
            aria-label="Task notifications"
            className="absolute right-0 z-40 mt-2 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-[slideDown_0.3s_cubic-bezier(0.16,1,0.3,1)_both] sm:w-[360px]"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-3">
              <strong className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Task reminders
              </strong>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:rotate-90 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ×
              </button>
            </header>

            {/* Body */}
            {state.loading ? (
              <p className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500" />
                <span className="animate-pulse">Checking due tasks...</span>
              </p>
            ) : state.error ? (
              <p
                role="alert"
                className="m-3 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2.5 text-sm text-red-700 dark:text-red-300 animate-[slideDown_0.4s_ease-out]"
              >
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 animate-ping" />
                <span>{state.error}</span>
              </p>
            ) : state.tasks.length ? (
              <ul className="max-h-80 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
                {state.tasks.map((task, index) => {
                  const due = getDueDate(task.dueDate);
                  const overdue = due.getTime() < state.checkedAt;
                  return (
                    <li
                      key={task._id}
                      className="animate-[slideUp_0.4s_ease-out_both]"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => { onOpenTasks?.(task); setOpen(false); }}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:pl-5"
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                            overdue
                              ? 'bg-gradient-to-br from-rose-500 to-red-600'
                              : 'bg-gradient-to-br from-amber-500 to-orange-500'
                          }`}
                        >
                          !
                        </span>
                        <span className="flex-1 overflow-hidden">
                          <b className="block truncate text-sm font-semibold text-slate-900 dark:text-white transition-all duration-300 group-hover:tracking-wide">
                            {task.title}
                          </b>
                          <small
                            className={`mt-0.5 block truncate text-xs ${
                              overdue
                                ? 'text-rose-600 dark:text-rose-400 font-medium'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {overdue ? 'Overdue' : 'Due within 24 hours'} · {due.toLocaleDateString()}
                          </small>
                        </span>
                        <span className="mt-2 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-500">
                          →
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400 animate-[fadeIn_0.4s_ease-out]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-xl text-emerald-500 transition-transform duration-500 hover:rotate-12">
                  ✓
                </span>
                <b className="text-slate-700 dark:text-slate-300">No task reminders right now.</b>
                <small className="text-xs text-slate-400 dark:text-slate-500">
                  You are all caught up.
                </small>
              </p>
            )}

            {/* Footer accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[loadingBar_3s_ease-in-out_infinite]" />
          </section>
        </>
      )}
    </div>
  );
}