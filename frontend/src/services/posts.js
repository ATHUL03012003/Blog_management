import api from './api';

const API_BASE = 'http://localhost:8000';

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function fetchPublishedPosts() {
  const { data } = await api.get('/api/posts/');
  return data;
}

export async function fetchPostBySlug(slug) {
  const { data } = await api.get(`/api/posts/${slug}/`);
  return data;
}
