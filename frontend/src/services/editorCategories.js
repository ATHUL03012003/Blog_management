import api from './api';

export async function fetchCategories() {
  const { data } = await api.get('/api/categories/');
  return data;
}

export async function createCategory(payload) {
  const { data } = await api.post('/api/categories/create/', payload);
  return data;
}

export async function updateCategory(slug, payload) {
  const { data } = await api.put(`/api/categories/${slug}/update/`, payload);
  return data;
}

export async function fetchTags() {
  const { data } = await api.get('/api/categories/tags/');
  return data;
}

export async function createTag(payload) {
  const { data } = await api.post('/api/categories/tags/create/', payload);
  return data;
}

export async function updateTag(slug, payload) {
  const { data } = await api.put(`/api/categories/tags/${slug}/update/`, payload);
  return data;
}

export async function deleteTag(slug) {
  const { data } = await api.delete(`/api/categories/tags/${slug}/delete/`);
  return data;
}
