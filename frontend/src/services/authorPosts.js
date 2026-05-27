import api from './api';

function buildFormData(payload) {
  const fd = new FormData();
  if (payload.title != null) fd.append('title', payload.title);
  if (payload.content != null) fd.append('content', payload.content);
  if (payload.excerpt != null) fd.append('excerpt', payload.excerpt);
  if (payload.category != null && payload.category !== '') {
    fd.append('category', String(payload.category));
  }
  if (payload.coverFile) {
    fd.append('image', payload.coverFile);
  }
  if (payload.tags?.length) {
    payload.tags.forEach((id) => fd.append('tags', String(id)));
  }
  return fd;
}

function hasFilePayload(payload) {
  return Boolean(payload.coverFile);
}

export async function fetchMyPosts() {
  const { data } = await api.get('/api/posts/my-posts/');
  return data;
}

export async function createPost(payload) {
  const body = hasFilePayload(payload)
    ? buildFormData(payload)
    : {
        title: payload.title,
        content: payload.content,
        excerpt: payload.excerpt || '',
        category: payload.category || null,
        tags: payload.tags || [],
      };
  const { data } = await api.post('/api/posts/create/', body);
  return data;
}

export async function updatePost(slug, payload) {
  const body = hasFilePayload(payload)
    ? buildFormData(payload)
    : {
        title: payload.title,
        content: payload.content,
        excerpt: payload.excerpt || '',
        category: payload.category ?? null,
        tags: payload.tags || [],
      };
  const { data } = await api.put(`/api/posts/${slug}/update/`, body);
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

export async function uploadContentImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await api.post('/api/posts/upload-image/', fd);
  return data;
}

/** Strip HTML for plain-text checks */
export function getPlainTextFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || '').trim();
}
