const collections = new Set(['companies', 'contacts', 'deals', 'employees', 'tasks']);
const singularNames = { companies: 'company', contacts: 'contact', deals: 'deal', employees: 'employee', tasks: 'task' };

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

function seedDemoData() {
  const day = 24 * 60 * 60 * 1000;
  const createdAt = daysAgo => new Date(Date.now() - daysAgo * day).toISOString();
  const dueDate = daysFromNow => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().slice(0, 10);
  };
  const makeRecords = entries => entries.map(([days, fields]) => ({
    ...fields,
    _id: makeId(),
    createdAt: createdAt(days),
    updatedAt: createdAt(days),
  }));
  const sampleData = {
    companies: makeRecords([
      [18, { name: 'Northstar Labs', industry: 'Technology', website: 'https://northstarlabs.example', phone: '+1 415 555 0134', address: 'San Francisco, CA' }],
      [14, { name: 'Cedar & Stone', industry: 'Retail', website: 'https://cedarstone.example', phone: '+1 212 555 0186', address: 'New York, NY' }],
      [11, { name: 'Brightpath Health', industry: 'Healthcare', website: 'https://brightpath.example', phone: '+1 617 555 0122', address: 'Boston, MA' }],
      [8, { name: 'Summit Works', industry: 'Manufacturing', website: 'https://summitworks.example', phone: '+1 312 555 0165', address: 'Chicago, IL' }],
      [5, { name: 'Bluebird Finance', industry: 'Financial services', website: 'https://bluebird.example', phone: '+1 206 555 0141', address: 'Seattle, WA' }],
    ]),
    contacts: makeRecords([
      [6, { name: 'Avery Johnson', email: 'avery.johnson@example.com', phone: '+1 415 555 0190', company: 'Northstar Labs', jobTitle: 'Operations Director', status: 'qualified' }],
      [5, { name: 'Maya Patel', email: 'maya.patel@example.com', phone: '+1 212 555 0158', company: 'Cedar & Stone', jobTitle: 'VP of Marketing', status: 'contacted' }],
      [4, { name: 'Noah Williams', email: 'noah.williams@example.com', phone: '+1 617 555 0172', company: 'Brightpath Health', jobTitle: 'Practice Manager', status: 'lead' }],
      [3, { name: 'Sofia Chen', email: 'sofia.chen@example.com', phone: '+1 312 555 0119', company: 'Summit Works', jobTitle: 'Procurement Lead', status: 'qualified' }],
      [2, { name: 'Ethan Brooks', email: 'ethan.brooks@example.com', phone: '+1 206 555 0198', company: 'Bluebird Finance', jobTitle: 'Finance Director', status: 'customer' }],
      [1, { name: 'Amara Okafor', email: 'amara.okafor@example.com', phone: '+1 415 555 0111', company: 'Northstar Labs', jobTitle: 'Product Manager', status: 'contacted' }],
      [0, { name: 'Leo Martin', email: 'leo.martin@example.com', phone: '+1 617 555 0147', company: 'Brightpath Health', jobTitle: 'Founder', status: 'lead' }],
      [0, { name: 'Isla Thompson', email: 'isla.thompson@example.com', phone: '+1 212 555 0194', company: 'Cedar & Stone', jobTitle: 'Sales Manager', status: 'lead' }],
    ]),
    deals: makeRecords([
      [12, { title: 'Northstar onboarding', value: 18500, stage: 'negotiation', company: 'Northstar Labs' }],
      [9, { title: 'Cedar retail rollout', value: 12400, stage: 'proposal', company: 'Cedar & Stone' }],
      [7, { title: 'Brightpath expansion', value: 24300, stage: 'qualification', company: 'Brightpath Health' }],
      [6, { title: 'Summit analytics suite', value: 9800, stage: 'prospecting', company: 'Summit Works' }],
      [4, { title: 'Bluebird advisory plan', value: 15600, stage: 'won', company: 'Bluebird Finance' }],
      [3, { title: 'Northstar support package', value: 7200, stage: 'proposal', company: 'Northstar Labs' }],
      [1, { title: 'Cedar loyalty platform', value: 11200, stage: 'won', company: 'Cedar & Stone' }],
      [0, { title: 'Brightpath partner program', value: 19800, stage: 'qualification', company: 'Brightpath Health' }],
    ]),
    tasks: makeRecords([
      [6, { title: 'Send Northstar proposal', description: 'Share the updated onboarding proposal.', dueDate: dueDate(-1), priority: 'high', status: 'pending', completed: false }],
      [5, { title: 'Prepare Cedar demo', description: 'Tailor the product walkthrough to retail.', dueDate: dueDate(1), priority: 'medium', status: 'pending', completed: false }],
      [4, { title: 'Review Brightpath requirements', description: 'Confirm integration and rollout needs.', dueDate: dueDate(-2), priority: 'high', status: 'pending', completed: false }],
      [3, { title: 'Send Summit recap', description: 'Email the notes from the discovery call.', dueDate: dueDate(2), priority: 'low', status: 'completed', completed: true }],
      [2, { title: 'Book Bluebird follow-up', description: 'Schedule a check-in with the finance team.', dueDate: dueDate(3), priority: 'medium', status: 'pending', completed: false }],
      [1, { title: 'Update opportunity notes', description: 'Record the latest stakeholder feedback.', dueDate: dueDate(4), priority: 'low', status: 'completed', completed: true }],
      [1, { title: 'Share contract draft', description: 'Send the draft agreement for review.', dueDate: dueDate(5), priority: 'high', status: 'pending', completed: false }],
      [0, { title: 'Confirm launch date', description: 'Align the launch date with the client team.', dueDate: dueDate(6), priority: 'medium', status: 'completed', completed: true }],
    ]),
  };
  const user = currentUser();
  if (!user) throw new Error('Could not create sample data without a signed-in user.');
  const seedKey = collectionStorageKey('demo-seeded-v1');
  if (localStorage.getItem(seedKey) === 'true') return;
  const collectionKeys = Object.keys(sampleData).map(collectionStorageKey);
  if (collectionKeys.some(key => localStorage.getItem(key) !== null)) return;
  for (const [collection, records] of Object.entries(sampleData)) {
    const key = collectionStorageKey(collection);
    localStorage.setItem(key, JSON.stringify(records));
  }
  localStorage.setItem(seedKey, 'true');
}

function relativeTime(value) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function summarizeDashboard() {
  seedDemoData();
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
  const user = currentUser();
  const userInitials = String(user?.name || 'User').trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const activities = [
    ...contacts.map(record => ({ record, action: 'added contact', target: record.name })),
    ...companies.map(record => ({ record, action: 'added company', target: record.name })),
    ...deals.map(record => ({ record, action: 'updated deal', target: record.title })),
    ...tasks.map(record => ({
      record,
      action: record.completed ? 'completed task' : 'added task',
      target: record.title,
    })),
  ]
    .sort((a, b) => new Date(b.record.updatedAt || b.record.createdAt) - new Date(a.record.updatedAt || a.record.createdAt))
    .slice(0, 4)
    .map(({ record, action, target }) => ({
      initials: userInitials,
      name: user?.name || 'You',
      action,
      target,
      when: relativeTime(record.updatedAt || record.createdAt),
    }));

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
    activities,
    isSample: localStorage.getItem(collectionStorageKey('demo-seeded-v1')) === 'true',
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
  seedDemoData();
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

  const match = safePath.match(/^\/(companies|contacts|deals|employees|tasks)(?:\/([^/]+))?$/);
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
