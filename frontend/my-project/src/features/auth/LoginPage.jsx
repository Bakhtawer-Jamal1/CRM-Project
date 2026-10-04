import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './authApi';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user) setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 md:flex-row animate-[fadeIn_0.5s_ease-out]">
      <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 py-10 text-white md:px-12 md:py-14 animate-[slideUp_0.6s_ease-out_both]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
          <div className="absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-indigo-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />
        </div>

        <b className="relative z-10 text-2xl font-bold tracking-tight transition-all duration-300 hover:scale-105 hover:tracking-wide">
          BJ Technologies<span className="animate-pulse">.</span>
        </b>

        <div className="relative z-10 my-10 max-w-md animate-[slideUp_0.7s_ease-out_both]" style={{ animationDelay: '200ms' }}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/70">
            CUSTOMER RELATIONSHIP MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Your work, and every relationship, in one place.
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Keep your contacts, companies, deals and tasks moving.
          </p>
        </div>

        <small className="relative z-10 text-xs text-white/60 transition-all duration-300 hover:text-white/90">
          © BJ Technologies
        </small>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-10 md:px-12 animate-[slideUp_0.7s_ease-out_both]" style={{ animationDelay: '150ms' }}>
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl transition-all duration-500 hover:shadow-2xl sm:p-8 animate-[slideUp_0.8s_ease-out_both]"
          style={{ animationDelay: '300ms' }}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            WELCOME BACK
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in with your account, or use a new email and a 12-72 byte password to create one.
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: '550ms' }}>
              Email
              <input
                required
                autoComplete="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: '600ms' }}>
              Password
              <div className="relative">
                <input
                  required
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500 hover:scale-110 active:scale-95"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300 animate-[slideDown_0.4s_ease-out]">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </p>
          )}

          <button
            disabled={busy}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            <span className="transition-all duration-300 group-hover:tracking-wide">
              {busy ? 'Signing in...' : 'Sign in'}
            </span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <Link
            to="/register"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md active:scale-[0.98]"
          >
            <span className="text-base transition-transform duration-300 group-hover:rotate-90 group-hover:scale-125">＋</span>
            <span className="transition-all duration-300 group-hover:tracking-wide">Create a new account</span>
          </Link>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Protected by BJ Technologies · Secure session
          </p>
        </form>
      </section>
    </main>
  );
}