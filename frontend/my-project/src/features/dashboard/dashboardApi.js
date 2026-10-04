import { apiRequest } from '../../services/apiClient';

export const getDashboard = () => apiRequest('/dashboard');
