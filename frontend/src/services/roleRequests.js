import api from './api';

export async function createRoleChangeRequest(payload) {
  const { data } = await api.post('/api/auth/role-requests/', payload);
  return data;
}

export async function fetchMyRoleChangeRequests() {
  const { data } = await api.get('/api/auth/role-requests/mine/');
  return data;
}

export async function fetchPendingRoleChangeRequests() {
  const { data } = await api.get('/api/auth/role-requests/pending/');
  return data;
}

export async function reviewRoleChangeRequest(requestId, payload) {
  const { data } = await api.patch(`/api/auth/role-requests/${requestId}/review/`, payload);
  return data;
}

export async function fetchNotifications(unreadOnly = false) {
  const params = unreadOnly ? { unread: '1' } : {};
  const { data } = await api.get('/api/auth/notifications/', { params });
  return data;
}

export async function fetchNotificationUnreadCount() {
  const { data } = await api.get('/api/auth/notifications/unread-count/');
  return data;
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.patch(`/api/auth/notifications/${notificationId}/read/`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/api/auth/notifications/mark-all-read/');
  return data;
}
