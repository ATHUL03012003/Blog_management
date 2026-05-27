import api from './api';

export async function fetchProfile() {
  const { data } = await api.get('/api/auth/profile/');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/api/auth/profile/', payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await api.post('/api/auth/change-password/', payload);
  return data;
}

/** List readers/authors for admin promotion (admin/superadmin only). */
export async function fetchManageableUsers(role) {
  const params = role !== undefined && role !== '' ? { role } : {};
  const { data } = await api.get('/api/auth/users/', { params });
  return data;
}

/** Promote reader → author or demote author → reader (admin/superadmin only). */
export async function adminSetUserRole(userId, role) {
  const { data } = await api.patch(`/api/auth/users/${userId}/role/`, { role });
  return data;
}
