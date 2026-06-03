import api from './api';

export async function fetchAllPostsAdmin() {
  const { data } = await api.get('/api/posts/admin/all/');
  return data;
}

export async function fetchPost(slug) {
  const { data } = await api.get(`/api/posts/${slug}/`);
  return data;
}

export async function deletePost(slug) {
  await api.delete(`/api/posts/${slug}/delete/`);
}

export { fetchReviewQueue, approvePost, rejectPost } from './editorPosts';
