export function getAdminPaths(base) {
  return {
    home: base,
    users: `${base}/users`,
    allPosts: `${base}/posts`,
    review: `${base}/review`,
    reviewPost: (slug) => `${base}/review/${slug}`,
    categories: `${base}/categories`,
    profile: `${base}/profile`,
  };
}

export const adminPaths = getAdminPaths('/admin');
export const superadminPaths = getAdminPaths('/superadmin');
