import { apiRequest } from '../../services/apiClient';

export const companiesApi = {
  key: 'companies',
  list: () => apiRequest('/companies'),
  create: body => apiRequest('/companies', { method: 'POST', body }),
  update: (id, body) => apiRequest(`/companies/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  remove: id => apiRequest(`/companies/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
