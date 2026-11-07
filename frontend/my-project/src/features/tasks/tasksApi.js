import { apiRequest } from '../../services/apiClient';

export const tasksApi = {
  key: 'tasks',
  list: () => apiRequest('/tasks'),
  create: body => apiRequest('/tasks', { method: 'POST', body }),
  update: (id, body) => apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  remove: id => apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
