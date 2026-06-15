import api from './api';

export async function fetchPostComments(slug) {
  const { data } = await api.get(`/api/posts/${slug}/comments/`);
  return data;
}

export async function createComment(slug, payload) {
  const { data } = await api.post(`/api/posts/${slug}/comments/`, payload);
  return data;
}

export async function updateComment(commentId, payload) {
  const { data } = await api.put(`/api/comments/${commentId}/update/`, payload);
  return data;
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/api/comments/${commentId}/delete/`);
  return data;
}

export async function moderateDeleteComment(commentId, reason) {
  const { data } = await api.post(`/api/comments/${commentId}/moderate-delete/`, { reason });
  return data;
}

export async function togglePostLike(slug) {
  const { data } = await api.post(`/api/posts/${slug}/like/`);
  return data;
}

export async function fetchLikeStatus(slug) {
  const { data } = await api.get(`/api/posts/${slug}/like/`);
  return data;
}

export async function toggleCommentsEnabled(slug, commentsEnabled) {
  const { data } = await api.post(`/api/posts/${slug}/comments/toggle/`, {
    comments_enabled: commentsEnabled,
  });
  return data;
}
