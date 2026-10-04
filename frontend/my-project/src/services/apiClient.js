const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = rawApiUrl.replace(/\/+$/, '');
const BASE_API_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('crm_token');
  if (auth && token) headers.Authorization = 'Bearer ' + token;
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${BASE_API_URL}${safePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
