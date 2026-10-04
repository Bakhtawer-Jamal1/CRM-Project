import { apiRequest } from '../../services/apiClient';

export async function login(email, password) {
  const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  sessionStorage.setItem('crm_token', data.token);
  if (data.user) sessionStorage.setItem('crm_user', JSON.stringify(data.user));
  return data.user;
}

export async function registerUser(payload) {
  const data = await apiRequest('/auth/register', { method: 'POST', body: payload, auth: false });
  if (data.token) sessionStorage.setItem('crm_token', data.token);
  if (data.user) sessionStorage.setItem('crm_user', JSON.stringify(data.user));
  return data.user;
}