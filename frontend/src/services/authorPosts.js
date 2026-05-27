import api from './api';

export async function fetchMyPosts() {
  const { data } = await api.get('/api/posts/my-posts/');
  return data;
}

export async function createPost(payload) {
  const { data } = await api.post('/api/posts/create/', payload);
  return data;
}

export async function updatePost(slug, payload) {
  const { data } = await api.put(`/api/posts/${slug}/update/`, payload);
  return data;
}

export async function deletePost(slug) {
  const { data } = await api.delete(`/api/posts/${slug}/delete/`);
  return data;
}

export async function submitPostForReview(slug) {
  const { data } = await api.post(`/api/posts/${slug}/submit-review/`);
  return data;
}

export async function publishPost(slug) {
  const { data } = await api.post(`/api/posts/${slug}/publish/`);
  return data;
}

export async function fetchAuthorPost(slug) {
  const { data } = await api.get(`/api/posts/${slug}/`);
  return data;
}
