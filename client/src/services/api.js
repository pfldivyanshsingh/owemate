import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('owemate_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('owemate_token');
      localStorage.removeItem('owemate_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Users
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
};

// Groups
export const groupAPI = {
  getAll: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  getById: (id) => api.get(`/groups/${id}`),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  leave: (id) => api.post(`/groups/${id}/leave`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  invite: (groupId, email) => api.post(`/groups/${groupId}/invite`, { email }),
  getInvitations: () => api.get('/groups/invitations'),
  respondToInvite: (token, action) => api.post(`/groups/invitations/${token}/respond`, { action }),
};

// Expenses
export const expenseAPI = {
  getGroupExpenses: (groupId, params) => api.get(`/groups/${groupId}/expenses`, { params }),
  addExpense: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),
  getExpense: (id) => api.get(`/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getAll: (params) => api.get('/expenses', { params }),
};

// Balances & Settlements
export const balanceAPI = {
  getGroupBalances: (groupId) => api.get(`/groups/${groupId}/balances`),
  settleUp: (groupId, data) => api.post(`/groups/${groupId}/settle`, data),
  getTransactions: (groupId) => api.get(`/groups/${groupId}/transactions`),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Analytics
export const analyticsAPI = {
  getMy: () => api.get('/analytics/me'),
  getGlobal: () => api.get('/analytics/global'),
  getAdmin: () => api.get('/analytics/admin'),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// My Money (Personal)
export const personalAPI = {
  getTransactions: (params) => api.get('/my-money/transactions', { params }),
  addTransaction: (data) => api.post('/my-money/transactions', data),
  updateTransaction: (id, data) => api.put(`/my-money/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/my-money/transactions/${id}`),
  getAnalytics: () => api.get('/my-money/analytics'),
  getCategories: () => api.get('/my-money/categories'),
  addCategory: (data) => api.post('/my-money/categories', data),
};

export default api;
