import api from './api';

export async function fetchPlatformOverview() {
  const { data } = await api.get('/api/auth/superadmin/overview/');
  return data;
}

export async function fetchAllUsers(role) {
  const params = role !== undefined && role !== '' ? { role } : {};
  const { data } = await api.get('/api/auth/superadmin/users/', { params });
  return data;
}

export async function superadminSetUserRole(userId, role) {
  const { data } = await api.patch(`/api/auth/superadmin/users/${userId}/role/`, { role });
  return data;
}

export async function superadminSetUserActive(userId, isActive) {
  const { data } = await api.patch(`/api/auth/superadmin/users/${userId}/active/`, {
    is_active: isActive,
  });
  return data;
}
