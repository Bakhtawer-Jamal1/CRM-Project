import { useCallback, useEffect, useMemo, useState } from 'react';

export default function FeatureList({ title, subtitle, api, fields, columns, searchKeys }) {
  const singular = { Contacts: 'Contact', Companies: 'Company', Deals: 'Deal', Tasks: 'Task' }[title] || title;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({});

  const loadItems = useCallback(async () => {
    const result = await api.list();
    return Array.isArray(result) ? result : result[api.key] || result.items || [];
  }, [api]);

  const refresh = useCallback(async () => {
    try {
      setItems(await loadItems());
    } catch (err) { setError(err.message || `${title} load nahi ho saka.`); }
    finally { setLoading(false); }
  }, [loadItems, title]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await loadItems();
        if (active) setItems(result);
      } catch (err) {
        if (active) setError(err.message || `${title} load nahi ho saka.`);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [loadItems, title]);

  const filtered = useMemo(
    () => items.filter(item => searchKeys.some(key => String(item[key] || '').toLowerCase().includes(query.toLowerCase()))),
    [items, query, searchKeys]
  );

  function openForm(item = null) {
    setEditing(item);
    setForm(Object.fromEntries(fields.map(field => {
      const value = item ? item[field.name] ?? '' : field.defaultValue || '';
      return [field.name, field.type === 'date' && value ? String(value).slice(0, 10) : value];
    })));
    setFormOpen(true); setError('');
  }

  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await api.update(editing._id, form);
      else await api.create(form);
      setFormOpen(false); setEditing(null); await refresh();
    } catch (err) { setError(err.message || 'Save nahi ho saka.'); }
    finally { setBusy(false); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item[columns[0].key] || singular}?`)) return;
    setError('');
    try {
      await api.remove(item._id);
      setItems(current => current.filter(row => row._id !== item._id));
    } catch (err) { setError(err.message || 'Delete nahi ho saka.'); }
  }

  return (
    <section className="animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-[slideUp_0.5s_ease-out_both]">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">WORKSPACE / CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <button
          onClick={() => openForm()}
          className="group inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95 sm:self-auto"
        >
          <span className="text-base transition-transform duration-300 group-hover:rotate-90 group-hover:scale-125">＋</span>
          <span className="transition-all duration-300 group-hover:tracking-wide">Add {singular}</span>
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-300 shadow-sm animate-[slideDown_0.4s_ease-out]">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 flex h-6 w-6 items-center justify-center rounded-md transition-all duration-300 hover:bg-red-500/10 hover:rotate-90" aria-label="Dismiss">×</button>
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md animate-[slideUp_0.6s_ease-out_both]">
        <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <strong className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{filtered.length}</strong>
            <span> records</span>
          </div>
          <label className="group relative flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-md hover:border-slate-300 dark:hover:border-slate-600 sm:w-72">
            <span className="text-xs font-medium text-slate-400 transition-colors duration-300 group-focus-within:text-indigo-500">Search</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                {columns.map((column, i) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-[fadeIn_0.5s_ease-out_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500" />
                      <span className="animate-pulse text-sm">Loading {title.toLowerCase()}...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="group border-b border-slate-100 dark:border-slate-800/60 transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:shadow-sm animate-[slideUp_0.4s_ease-out_both]"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {columns.map(column => (
                      <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                        {column.key === 'value' ? `$${Number(item[column.key] || 0).toLocaleString()}`
                          : ['status', 'stage'].includes(column.key) ? (
                            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-500/40">
                              {item[column.key] || '—'}
                            </span>
                          ) : (item[column.key] || '—')}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openForm(item)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(item)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-16 text-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-2xl text-slate-400 transition-transform duration-500 hover:rotate-90 hover:scale-110">＋</span>
                      <b className="text-slate-700 dark:text-slate-300">{query ? 'No matching records' : `No ${title.toLowerCase()} yet`}</b>
                      <small className="text-slate-500 dark:text-slate-400">{query ? 'Try another search.' : `Add your first ${singular.toLowerCase()} to get started.`}</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]"
          onMouseDown={event => { if (event.target === event.currentTarget) setFormOpen(false); }}
        >
          <form
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl animate-[slideUp_0.4s_ease-out] sm:p-6"
            onSubmit={save}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">CRM RECORD</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editing ? `Edit ${singular}` : `Add ${singular}`}
                </h2>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:rotate-90 hover:text-slate-700 dark:hover:text-slate-200"
                onClick={() => setFormOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field, i) => (
                <label
                  key={field.name}
                  className={`flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 animate-[slideUp_0.4s_ease-out_both] ${field.wide ? 'sm:col-span-2' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {field.label}
                  {field.options ? (
                    <select
                      required={field.required}
                      value={form[field.name] || ''}
                      onChange={event => setForm(current => ({ ...current, [field.name]: event.target.value }))}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type || 'text'}
                      min={field.type === 'number' ? '0' : undefined}
                      value={form[field.name] || ''}
                      onChange={event => setForm(current => ({ ...current, [field.name]: event.target.value }))}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300 dark:hover:border-slate-600"
                    />
                  )}
                </label>
              ))}
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300 animate-[slideDown_0.4s_ease-out]">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm active:scale-95"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={busy}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                <span className="transition-all duration-300 group-hover:tracking-wide">
                  {busy ? 'Saving...' : 'Save record'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}