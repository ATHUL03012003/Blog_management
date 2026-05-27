export const ROLE_MAP = {
  0: 'admin',
  1: 'reader',
  2: 'author',
  3: 'editor',
  4: 'moderator',
  5: 'superadmin',
};

export const ROLE_LABELS = {
  0: 'Admin',
  1: 'Reader',
  2: 'Author',
  3: 'Editor',
  4: 'Moderator',
  5: 'Super Admin',
};

export const READER_ROLE = 1;
export const AUTHOR_ROLE = 2;
export const ADMIN_ROLE = 0;
export const SUPERADMIN_ROLE = 5;

export const isAdminUser = (role) => role === ADMIN_ROLE || role === SUPERADMIN_ROLE;
