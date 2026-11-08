import { apiRequest } from '../../services/apiClient';

export const employeesApi = {
  key: 'employees',
  list: () => apiRequest('/employees'),
  create: body => apiRequest('/employees', { method: 'POST', body }),
  update: (id, body) => apiRequest(`/employees/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  remove: id => apiRequest(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
