import api from './api';

export async function fetchReviewQueue() {
  const { data } = await api.get('/api/posts/review-queue/');
  return data;
}

export async function approvePost(slug) {
  const { data } = await api.post(`/api/posts/${slug}/approve/`);
  return data;
}

export async function rejectPost(slug, { rejection_reason, improvement_areas }) {
  const { data } = await api.post(`/api/posts/${slug}/reject/`, {
    rejection_reason,
    improvement_areas,
  });
  return data;
}

export async function fetchPost(slug) {
  const { data } = await api.get(`/api/posts/${slug}/`);
  return data;
}
