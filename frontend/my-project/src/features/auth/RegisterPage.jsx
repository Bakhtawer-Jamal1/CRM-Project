import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from './registerApi';
import { useAuth } from '../../context/AuthContext';

function EyeIcon({ open }) {
  return open ? (
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
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    const passwordBytes = new TextEncoder().encode(form.password).length;
    if (passwordBytes < 12 || passwordBytes > 72) return setError('Password must be 12 to 72 bytes.');

    setBusy(true);
    try {
      const user = await registerUser(form);
      if (user) setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setBusy(false);
    }
  }

  const passwordStrength = (() => {
    const bytes = new TextEncoder().encode(form.password).length;
    if (!form.password) return { label: 'Empty', color: 'bg-slate-300 dark:bg-slate-700', width: '0%' };
    if (bytes < 8) return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (bytes < 12) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (bytes < 16) return { label: 'Good', color: 'bg-indigo-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  })();

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 md:flex-row animate-[fadeIn_0.5s_ease-out]">
      <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-6 py-10 text-white md:px-12 md:py-14 animate-[slideUp_0.6s_ease-out_both]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
          <div className="absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />
        </div>

        <b className="relative z-10 text-2xl font-bold tracking-tight transition-all duration-300 hover:scale-105 hover:tracking-wide">
          BJ Technologies<span className="animate-pulse">.</span>
        </b>

        <div className="relative z-10 my-10 max-w-md animate-[slideUp_0.7s_ease-out_both]" style={{ animationDelay: '200ms' }}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/70">GET STARTED</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Build your workspace in seconds.
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Create your BJ Technologies CRM account and start managing every relationship in one place.
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
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            CREATE ACCOUNT
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Sign up for BJ Technologies
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Register a user for your CRM workspace.
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
              <input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                value={form.name}
                onChange={update}
                placeholder="Your full name"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={update}
                placeholder="you@example.com"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={form.password}
                  onChange={update}
                  placeholder="At least 12 characters"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-500 hover:scale-110 active:scale-95"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {form.password && (
                <div className="mt-1 space-y-1 animate-[fadeIn_0.4s_ease-out]">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Strength</span>
                    <span className={
                      passwordStrength.label === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' :
                      passwordStrength.label === 'Good' ? 'text-indigo-600 dark:text-indigo-400' :
                      passwordStrength.label === 'Fair' ? 'text-amber-600 dark:text-amber-400' :
                      'text-rose-600 dark:text-rose-400'
                    }>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm password
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={update}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 pr-11 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:ring-2 focus:shadow-md ${
                    form.confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-400 dark:border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-500 hover:scale-110 active:scale-95"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && (
                <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium animate-[fadeIn_0.3s_ease-out] ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </span>
              )}
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300 animate-[slideDown_0.4s_ease-out]">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            <span className="transition-all duration-300 group-hover:tracking-wide">
              {busy ? 'Creating account...' : 'Create account'}
            </span>
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 transition-all duration-300 hover:tracking-wide hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}