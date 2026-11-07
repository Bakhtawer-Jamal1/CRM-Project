export default function ContactsUI({ contacts, loading, error, onCreate, onDelete }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 hover:shadow-md animate-[fadeIn_0.5s_ease-out]">
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-4 animate-[slideUp_0.5s_ease-out_both]">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white transition-all duration-300 hover:tracking-wide">Contacts</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add and manage CRM contacts</p>
      </div>

      <form onSubmit={onCreate} className="grid gap-3 border-b border-slate-200 dark:border-slate-800 p-5 sm:grid-cols-2 lg:grid-cols-3 animate-[slideUp_0.6s_ease-out_both]" style={{ animationDelay: '100ms' }}>
        {[
          { name: 'name', placeholder: 'Name', required: true },
          { name: 'email', placeholder: 'Email', required: true, type: 'email' },
          { name: 'phone', placeholder: 'Phone' },
          { name: 'company', placeholder: 'Company' },
          { name: 'jobTitle', placeholder: 'Job title' },
        ].map((field) => (
          <input
            key={field.name}
            name={field.name}
            required={field.required}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
          />
        ))}

        <select name="status" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300 dark:hover:border-slate-600">
          <option value="lead">Lead</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="customer">Customer</option>
          <option value="lost">Lost</option>
        </select>

        <button className="group sm:col-span-2 lg:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]">
          <span className="text-base transition-transform duration-300 group-hover:rotate-90 group-hover:scale-125">＋</span>
          <span className="transition-all duration-300 group-hover:tracking-wide">Add contact</span>
        </button>
      </form>

      {error && (
        <p role="alert" className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300 animate-[slideDown_0.4s_ease-out]">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500 animate-ping" />
          <span>{error}</span>
        </p>
      )}

      {loading ? (
        <p className="flex flex-col items-center gap-3 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500" />
          <span className="animate-pulse">Loading...</span>
        </p>
      ) : contacts.length === 0 ? (
        <p className="flex flex-col items-center gap-2 p-10 text-center text-sm text-slate-500 dark:text-slate-400 animate-[fadeIn_0.5s_ease-out]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-2xl text-slate-400 transition-transform duration-500 hover:rotate-90 hover:scale-110">＋</span>
          <b className="text-slate-700 dark:text-slate-300">No contacts yet.</b>
          <small>Add your first contact above to get started.</small>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400">
              <tr>
                {['Name', 'Email', 'Company', 'Status', ''].map((x, i) => (
                  <th key={x || i} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contacts.map((c, index) => (
                <tr key={c._id} className="group transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:shadow-sm animate-[slideUp_0.4s_ease-out_both]" style={{ animationDelay: `${index * 40}ms` }}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{c.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">{c.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">{c.company || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-500/40">{c.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button type="button" onClick={() => onDelete(c._id)} className="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:shadow-sm active:scale-95">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}