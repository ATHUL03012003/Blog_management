const BASE = '/superadmin';

export const superadminPaths = {
  home: BASE,
  users: `${BASE}/users`,
  posts: `${BASE}/posts`,
  newPost: `${BASE}/posts/new`,
  post: (slug) => `${BASE}/posts/${slug}`,
  editPost: (slug) => `${BASE}/posts/${slug}/edit`,
  review: `${BASE}/review`,
  reviewPost: (slug) => `${BASE}/review/${slug}`,
  categories: `${BASE}/categories`,
  profile: `${BASE}/profile`,
};

export const SUPERADMIN_NAV_ITEMS = [
  { label: 'Overview', path: superadminPaths.home, exact: true },
  { label: 'All users', path: superadminPaths.users },
  { label: 'All posts', path: superadminPaths.posts },
  { label: 'New post', path: superadminPaths.newPost },
  { label: 'Review queue', path: superadminPaths.review },
  { label: 'Categories', path: superadminPaths.categories },
  { label: 'Profile', path: superadminPaths.profile },
];
