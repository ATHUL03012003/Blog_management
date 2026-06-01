import api from './api';

export async function fetchAllPostsAdmin() {
  const { data } = await api.get('/api/posts/admin/all/');
  return data;
}

export async function deletePostAdmin(slug) {
  const { data } = await api.delete(`/api/posts/${slug}/delete/`);
  return data;
}
