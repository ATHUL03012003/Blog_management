const KEY_ACCESS = 'access';
const KEY_REFRESH = 'refresh';
const KEY_USER = 'user';

// Session-only auth by default: tokens/user live in sessionStorage (cleared when browser closes).
// We also support reading legacy localStorage values to avoid breaking existing users.
const SESSION = sessionStorage;
const PERSISTENT = localStorage;

export const clearStoredSession = () => {
  [SESSION, PERSISTENT].forEach((store) => {
    store.removeItem(KEY_ACCESS);
    store.removeItem(KEY_REFRESH);
    store.removeItem(KEY_USER);
  });
};

export const loadStoredUser = () => {
  const storedUser = SESSION.getItem(KEY_USER) ?? PERSISTENT.getItem(KEY_USER);
  if (!storedUser || storedUser === 'undefined' || storedUser === 'null') return null;

  try {
    const parsed = JSON.parse(storedUser);
    if (!parsed || typeof parsed !== 'object') {
      clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
};

export const saveSessionAuth = ({ access, refresh, user }) => {
  if (!access || !refresh || !user) {
    throw new Error('Invalid session response from server');
  }

  // Clear any legacy persistent auth first, then write session-only.
  clearStoredSession();
  SESSION.setItem(KEY_ACCESS, access);
  SESSION.setItem(KEY_REFRESH, refresh);
  SESSION.setItem(KEY_USER, JSON.stringify(user));
};

export const getStoredAccessToken = () => SESSION.getItem(KEY_ACCESS) ?? PERSISTENT.getItem(KEY_ACCESS);
export const getStoredRefreshToken = () => SESSION.getItem(KEY_REFRESH) ?? PERSISTENT.getItem(KEY_REFRESH);
