export function createAdminPaths(base = '/admin') {
  return {
    home: base,
    users: `${base}/users`,
    posts: `${base}/posts`,
    newPost: `${base}/posts/new`,
    post: (slug) => `${base}/posts/${slug}`,
    editPost: (slug) => `${base}/posts/${slug}/edit`,
    review: `${base}/review`,
    reviewPost: (slug) => `${base}/review/${slug}`,
    categories: `${base}/categories`,
    profile: `${base}/profile`,
  };
}

export function getAdminBaseFromPath(pathname) {
  return pathname.startsWith('/superadmin') ? '/superadmin' : '/admin';
}

export function getAdminNavItems(base) {
  return [
    { label: 'Overview', path: base, exact: true },
    { label: 'Users', path: `${base}/users` },
    { label: 'All posts', path: `${base}/posts` },
    { label: 'New post', path: `${base}/posts/new` },
    { label: 'Review queue', path: `${base}/review` },
    { label: 'Categories', path: `${base}/categories` },
    { label: 'Profile', path: `${base}/profile` },
  ];
}
