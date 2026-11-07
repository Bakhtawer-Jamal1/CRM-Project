const collections = new Set(['companies', 'contacts', 'deals', 'tasks']);
const singularNames = { companies: 'company', contacts: 'contact', deals: 'deal', tasks: 'task' };

function currentUser() {
  const rawUser = sessionStorage.getItem('crm_user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    throw new Error('Could not read the signed-in user from this browser.');
  }
}

function collectionStorageKey(collection) {
  const user = currentUser();
  const identity = user?._id || user?.email?.toLowerCase();
  if (!identity) throw new Error('Sign in before accessing CRM records.');
  return `crm:${encodeURIComponent(identity)}:${collection}`;
}

function readCollection(collection) {
  const raw = localStorage.getItem(collectionStorageKey(collection));
  if (!raw) return [];

  let items;
  try {
    items = JSON.parse(raw);
  } catch {
    throw new Error(`Could not read saved ${collection} from this browser.`);
  }
  if (!Array.isArray(items)) throw new Error(`Saved ${collection} data is invalid.`);
  return items;
}

function saveCollection(collection, items) {
  localStorage.setItem(collectionStorageKey(collection), JSON.stringify(items));
}

function makeId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRecord(collection, body, previous = {}) {
  const record = { ...previous, ...body };
  if (collection === 'deals' && record.value !== undefined) {
    record.value = Number(record.value) || 0;
  }
  if (collection === 'tasks') {
    if (record.status !== undefined) record.completed = record.status === 'completed';
    else if (record.completed !== undefined) record.status = record.completed ? 'completed' : 'pending';
  }
  return record;
}

function createRecord(collection, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('A valid record is required.');
  }
  const now = new Date().toISOString();
  const record = { ...normalizeRecord(collection, body), _id: makeId(), createdAt: now, updatedAt: now };
  const items = readCollection(collection);
  items.unshift(record);
  saveCollection(collection, items);
  return record;
}

function updateRecord(collection, id, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('A valid record is required.');
  }
  const items = readCollection(collection);
  const index = items.findIndex(item => item._id === id);
  if (index < 0) throw new Error('Record not found.');
  items[index] = {
    ...normalizeRecord(collection, body, items[index]),
    _id: items[index]._id,
    createdAt: items[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  saveCollection(collection, items);
  return items[index];
}

function deleteRecord(collection, id) {
  const items = readCollection(collection);
  const remaining = items.filter(item => item._id !== id);
  if (remaining.length === items.length) throw new Error('Record not found.');
  saveCollection(collection, remaining);
  return { message: 'Record deleted.' };
}

function summarizeDashboard() {
  const contacts = readCollection('contacts');
  const companies = readCollection('companies');
  const deals = readCollection('deals');
  const tasks = readCollection('tasks');
  const completedTasks = tasks.filter(task => task.completed || task.status === 'completed');
  const openTasks = tasks.filter(task => !task.completed && task.status !== 'completed');
  const now = new Date();
  const overdueTasks = openTasks.filter(task => task.dueDate && new Date(task.dueDate) < now);
  const dealsByStage = Object.values(deals.reduce((stages, deal) => {
    const stage = deal.stage || 'unspecified';
    stages[stage] ||= { _id: stage, count: 0, value: 0 };
    stages[stage].count += 1;
    stages[stage].value += Number(deal.value) || 0;
    return stages;
  }, {}));
  const wonDeals = deals.filter(deal => deal.stage?.toLowerCase() === 'won');
  const openStages = new Set(['prospecting', 'discovery', 'qualification', 'qualified', 'proposal', 'negotiation']);
  const openPipeline = deals
    .filter(deal => openStages.has(deal.stage?.toLowerCase()))
    .reduce((total, deal) => total + (Number(deal.value) || 0), 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const trend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const inDay = value => {
      const date = new Date(value);
      return date >= day && date < nextDay;
    };
    return {
      day: day.toLocaleDateString('en', { weekday: 'short' }),
      leads: contacts.filter(contact => inDay(contact.createdAt)).length,
      won: wonDeals.filter(deal => inDay(deal.updatedAt || deal.createdAt)).length,
    };
  });

  return {
    contacts: contacts.length,
    companies: companies.length,
    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
    completedTasks: completedTasks.length,
    openPipeline,
    dealsWon: wonDeals.length,
    averageDealSize: wonDeals.length
      ? wonDeals.reduce((total, deal) => total + (Number(deal.value) || 0), 0) / wonDeals.length
      : 0,
    winRate: deals.length ? (wonDeals.length / deals.length) * 100 : 0,
    dealsByStage,
    trend,
    activities: [],
  };
}

function createUser(body) {
  const email = String(body?.email || '').trim();
  const name = String(body?.name || email.split('@')[0] || 'User').trim();
  if (!email) throw new Error('Email is required.');

  const user = {
    _id: encodeURIComponent(email.toLowerCase()),
    name,
    email,
    role: 'Sales Manager',
    createdAt: new Date().toISOString(),
  };
  const token = `local-${makeId()}`;
  sessionStorage.setItem('crm_token', token);
  sessionStorage.setItem('crm_user', JSON.stringify(user));
  return { token, user };
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const authRoute = safePath === '/auth/login' || safePath === '/auth/register';
  if (authRoute && method === 'POST') return createUser(body);

  if (safePath === '/users/me' && method === 'GET') {
    const user = currentUser();
    if (!user) throw new Error('Sign in before viewing your profile.');
    return { user };
  }
  if (safePath === '/dashboard' && method === 'GET') return summarizeDashboard();

  const match = safePath.match(/^\/(companies|contacts|deals|tasks)(?:\/([^/]+))?$/);
  if (!match) throw new Error(`Unsupported local request: ${safePath}`);

  const [, collection, encodedId] = match;
  if (!collections.has(collection)) throw new Error(`Unsupported collection: ${collection}`);

  let id;
  if (encodedId) {
    try {
      id = decodeURIComponent(encodedId);
    } catch {
      throw new Error('Invalid record ID.');
    }
  }

  if (method === 'GET' && !id) {
    const items = readCollection(collection);
    return { [collection]: items, total: items.length, page: 1, limit: items.length };
  }
  if (method === 'POST' && !id) {
    const record = createRecord(collection, body);
    return { [singularNames[collection]]: record };
  }
  if (method === 'PUT' && id) {
    const record = updateRecord(collection, id, body);
    return { [singularNames[collection]]: record };
  }
  if (method === 'DELETE' && id) return deleteRecord(collection, id);

  throw new Error(`Unsupported ${method} request for ${safePath}.`);
}
