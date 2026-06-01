import api from './api';

export async function fetchCategories() {
  const { data } = await api.get('/api/categories/');
  return data;
}

export async function fetchCategoryPosts(slug) {
  const { data } = await api.get(`/api/categories/${slug}/posts/`);
  return data;
}
