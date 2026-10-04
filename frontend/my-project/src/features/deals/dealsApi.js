import { apiRequest } from '../../services/apiClient';

export const dealsApi = {
  key: 'deals',
  list: () => apiRequest('/deals'),
  create: body => apiRequest('/deals', { method: 'POST', body }),
  update: (id, body) => apiRequest(`/deals/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  remove: id => apiRequest(`/deals/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
