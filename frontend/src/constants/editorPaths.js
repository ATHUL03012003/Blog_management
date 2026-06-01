export const EDITOR_BASE = '/editor';

export const editorPaths = {
  home: EDITOR_BASE,
  review: `${EDITOR_BASE}/review`,
  reviewPost: (slug) => `${EDITOR_BASE}/review/${slug}`,
  categories: `${EDITOR_BASE}/categories`,
  posts: `${EDITOR_BASE}/posts`,
  newPost: `${EDITOR_BASE}/posts/new`,
  post: (slug) => `${EDITOR_BASE}/posts/${slug}`,
  editPost: (slug) => `${EDITOR_BASE}/posts/${slug}/edit`,
  profile: `${EDITOR_BASE}/profile`,
};
