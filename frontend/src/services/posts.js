import api from './api';

const API_BASE = 'http://localhost:8000';

/** Resolve cover image URL (Cloudinary HTTPS or legacy local /media/ path). */
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
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
