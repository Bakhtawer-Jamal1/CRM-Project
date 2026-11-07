import { apiRequest } from '../../services/apiClient';

export const getContacts = () => apiRequest('/contacts');
export const createContact = body => apiRequest('/contacts', { method: 'POST', body });
export const deleteContact = id => apiRequest(`/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const updateContact = (id, body) => apiRequest(`/contacts/${encodeURIComponent(id)}`, { method: 'PUT', body });

export const contactsApi = {
  key: 'contacts', list: getContacts, create: createContact,
  update: updateContact, remove: deleteContact,
};
