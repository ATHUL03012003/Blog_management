import api from './api';

const API_BASE = 'http://localhost:8000';

/** Cloudinary HTTPS URLs (with CDN optimizations); legacy /media/ paths get API base prefix. */
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('res.cloudinary.com') && path.includes('/upload/')) {
      return path.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return path;
  }
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
