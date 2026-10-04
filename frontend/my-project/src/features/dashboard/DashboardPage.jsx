import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from './dashboardApi';
import { useAuth } from '../../context/AuthContext';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const safeDemo = { openPipeline: 0, contacts: 0, companies: 0, openTasks: 0, overdueTasks: 0, completedTasks: 0, dealsByStage: [], trend: [], activities: [] };
const money = value => `$${Number(value || 0).toLocaleString()}`;

function points(values) {
  const max = Math.max(1, ...values.map(Number));
  return values.map((value, index) => `${50 + index * 88},${176 - (Number(value) / max) * 132}`).join(' ');
}

function TrendChart({ trend }) {
  const leadPoints = points(trend.map(item => item.leads));
  const wonPoints = points(trend.map(item => item.won));
  const maxLead = Math.max(1, ...trend.map(row => Number(row.leads)));
  const maxWon = Math.max(1, ...trend.map(row => Number(row.won)));
  return (
    <div className="w-full animate-[fadeIn_0.7s_ease-out_both]" style={{ animationDelay: '200ms' }}>
      <svg viewBox="0 0 640 220" role="img" aria-label="Weekly lead and won deal activity chart" preserveAspectRatio="none" className="h-48 w-full sm:h-56">
        <defs>
          <linearGradient id="lead-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#29966a" stopOpacity=".25" />
            <stop offset="1" stopColor="#29966a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[44, 86, 128, 170].map(y => (
          <line key={y} x1="44" x2="610" y1={y} y2={y} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <polygon points={`50,176 ${leadPoints} 578,176`} fill="url(#lead-area)" className="animate-[fadeIn_0.8s_ease-out_both]" style={{ animationDelay: '400ms' }} />
        <polyline points={leadPoints} fill="none" stroke="#29966a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[fadeIn_0.8s_ease-out_both]" style={{ animationDelay: '500ms' }} />
        <polyline points={wonPoints} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" className="animate-[fadeIn_0.8s_ease-out_both]" style={{ animationDelay: '600ms' }} />
        {trend.map((item, index) => (
          <g key={item.day || index} className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: `${700 + index * 60}ms` }}>
            <circle cx={50 + index * 88} cy={176 - (Number(item.leads) / maxLead) * 132} r="4" fill="#29966a" />
            <circle cx={50 + index * 88} cy={176 - (Number(item.won) / maxWon) * 132} r="3.5" fill="#6366f1" />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between px-4 text-[11px] font-medium text-slate-400 dark:text-slate-500 sm:text-xs">
        {trend.map((item, index) => (
          <span key={item.day || index} className="transition-colors duration-300 hover:text-indigo-500">
            {item.day || weekdays[index]}
          </span>
        ))}
      </div>
    </div>
  );
}

function Ring({ completed, total }) {
  const ratio = total ? Math.min(1, completed / total) : 0;
  const circumference = 302;
  const dashOffset = circumference - ratio * circumference;
  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center animate-[fadeIn_0.6s_ease-out_both]" style={{ animationDelay: '300ms' }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${completed} of ${total} tasks complete`}>
        <circle cx="60" cy="60" r="48" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" />
        <circle cx="60" cy="60" r="48" fill="none" stroke="url(#ring-gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-1000 ease-out" />
        <defs>
          <linearGradient id="ring-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{total ? Math.round(ratio * 100) : 0}%</strong>
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">complete</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [live, setLive] = useState(null);
  const [demo, setDemo] = useState(safeDemo);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboard().then(data => { if (active) setLive(data); }).catch(err => { if (active) setApiError(err.message); });
    fetch('/demo-data/dashboard.json').then(response => response.ok ? response.json() : null).then(data => { if (active && data) { setDemo({ ...safeDemo, ...data }); setDemoAvailable(true); } }).catch(() => {});
    return () => { active = false; };
  }, []);

  const view = useMemo(() => {
    const actual = live || {};
    return {
      ...demo, ...actual,
      openPipeline: Number(actual.openPipeline) || demo.openPipeline,
      contacts: Number(actual.contacts) || demo.contacts,
      companies: Number(actual.companies) || demo.companies,
      openTasks: Number(actual.openTasks) || demo.openTasks,
      overdueTasks: Number(actual.overdueTasks) || demo.overdueTasks,
      completedTasks: Number(actual.completedTasks) || demo.completedTasks,
      dealsByStage: actual.dealsByStage?.length ? actual.dealsByStage : demo.dealsByStage,
    };
  }, [live, demo]);

  const demoUsed = demoAvailable && (!live || !live.dealsByStage?.length || !live.trend?.length || !live.activities?.length || ['contacts', 'companies', 'openTasks'].some(key => !Number(live[key])));
  const stats = [
    { label: 'Open pipeline', value: money(view.openPipeline), note: '+12% from last month', tone: 'green', mark: '$' },
    { label: 'Deals won', value: Number(view.dealsWon || 0).toLocaleString(), note: '+8% from last month', tone: 'blue', mark: '↗' },
    { label: 'Avg. deal size', value: money(view.averageDealSize), note: '+5% from last month', tone: 'gold', mark: '◇' },
    { label: 'Win rate', value: `${Number(view.winRate || 0).toFixed(1)}%`, note: `${view.contacts} contacts tracked`, tone: 'rose', mark: '%' },
  ];
  const maxStage = Math.max(1, ...view.dealsByStage.map(stage => Number(stage.count || 0)));
  const complete = Number(view.completedTasks) || 0;

  const toneClasses = {
    green: 'from-emerald-500/10 to-emerald-500/0 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    blue: 'from-blue-500/10 to-blue-500/0 ring-blue-500/20 text-blue-600 dark:text-blue-400',
    gold: 'from-amber-500/10 to-amber-500/0 ring-amber-500/20 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500/10 to-rose-500/0 ring-rose-500/20 text-rose-600 dark:text-rose-400',
  };

  return (
    <section className="animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-[slideUp_0.5s_ease-out_both]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">MONDAY, YOUR CRM AT A GLANCE</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide sm:text-3xl">Good morning, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here is what is happening across your relationships and pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className={`inline-block h-2 w-2 rounded-full ${demoUsed ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            {demoUsed ? 'Demo preview data' : 'Live CRM data'}
          </div>
          <Link to="/deals" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95">
            <span className="text-base transition-transform duration-300 group-hover:rotate-90 group-hover:scale-125">＋</span>
            <span className="transition-all duration-300 group-hover:tracking-wide">Add a deal</span>
          </Link>
        </div>
      </header>

      {apiError && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 animate-[slideDown_0.4s_ease-out]">
          Live dashboard request: {apiError}. Showing clearly marked sample data where records are empty.
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <article key={stat.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${toneClasses[stat.tone]} blur-2xl opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-125`} />
            <div className="relative flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</span>
              <i className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset text-sm not-italic transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${toneClasses[stat.tone]}`}>{stat.mark}</i>
            </div>
            <strong className="relative mt-3 block text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 group-hover:tracking-wide">{stat.value}</strong>
            <small className="relative mt-1 block text-xs text-slate-500 dark:text-slate-400">{stat.note}</small>
          </article>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:shadow-md lg:col-span-2 animate-[slideUp_0.6s_ease-out_both]" style={{ animationDelay: '200ms' }}>
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Weekly performance</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">New leads and deals won this week</p>
            </div>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Last 7 days</span>
          </header>
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><i className="inline-block h-2 w-6 rounded-full bg-emerald-500" /> Leads</span>
            <span className="flex items-center gap-2"><i className="inline-block h-2 w-6 rounded-full bg-indigo-500" /> Deals won</span>
          </div>
          <TrendChart trend={view.trend?.length ? view.trend : safeDemo.trend} />
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both]" style={{ animationDelay: '300ms' }}>
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Task health</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Open task completion</p>
            </div>
            <span className="cursor-default text-slate-400 transition-colors duration-300 hover:text-slate-600 dark:hover:text-slate-200">•••</span>
          </header>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Ring completed={complete} total={Number(view.openTasks) + complete} />
            <div className="flex-1 space-y-3 text-sm">
              {[
                { label: 'Completed', value: complete, color: 'bg-indigo-500' },
                { label: 'Open', value: view.openTasks, color: 'bg-slate-300 dark:bg-slate-600' },
                { label: 'Overdue', value: view.overdueTasks, color: 'bg-rose-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <i className={`inline-block h-2.5 w-2.5 rounded-full ${row.color}`} /> {row.label}
                  </span>
                  <b className="text-slate-900 dark:text-white">{row.value}</b>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Keep follow-ups moving to maintain momentum.</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both]" style={{ animationDelay: '400ms' }}>
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Deal pipeline</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Opportunities by stage</p>
            </div>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {view.dealsByStage.reduce((sum, stage) => sum + Number(stage.count || 0), 0)} deals
            </span>
          </header>
          <div className="space-y-3">
            {view.dealsByStage.map((stage, index) => (
              <div key={stage._id || stage.stage} className="animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: `${500 + index * 80}ms` }}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{stage._id || stage.stage}</span>
                  <b className="text-slate-900 dark:text-white">{stage.count}</b>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out" style={{ width: `${Math.max(3, Number(stage.count || 0) / maxStage * 100)}%` }} />
                </div>
              </div>
            ))}
            {!view.dealsByStage.length && <p className="text-center text-sm text-slate-400 dark:text-slate-500">No deal-stage data yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-500 hover:shadow-md animate-[slideUp_0.6s_ease-out_both]" style={{ animationDelay: '500ms' }}>
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Recent activity</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest team updates</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </header>
          <div className="space-y-3">
            {(view.activities || []).map((activity, index) => (
              <div key={`${activity.name}-${index}`} className="group flex items-start gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:-translate-y-0.5 animate-[slideUp_0.5s_ease-out_both]" style={{ animationDelay: `${600 + index * 80}ms` }}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                  ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-500', 'from-rose-500 to-orange-400', 'from-blue-500 to-cyan-500'][index % 4]
                } bg-gradient-to-br`}>
                  {activity.initials}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <b className="text-slate-900 dark:text-white">{activity.name}</b> {activity.action}{' '}
                  <strong className="font-medium text-indigo-600 dark:text-indigo-400">{activity.target}</strong>
                  <small className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">{activity.when}</small>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {demoUsed && (
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 animate-[fadeIn_0.5s_ease-out]">
          Sample values are for preview only. Real CRM values appear when records exist.
        </p>
      )}
    </section>
  );
}