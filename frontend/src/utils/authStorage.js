import {
  SESSION_INACTIVITY_MS,
  SESSION_MAX_AGE_MS,
} from '../constants/session';

const LOGIN_AT_KEY = 'sessionLoginAt';
const LAST_ACTIVITY_KEY = 'sessionLastActivityAt';

export const clearStoredSession = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  localStorage.removeItem(LOGIN_AT_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const markSessionStarted = () => {
  const now = String(Date.now());
  localStorage.setItem(LOGIN_AT_KEY, now);
  localStorage.setItem(LAST_ACTIVITY_KEY, now);
};

export const touchSessionActivity = () => {
  if (!localStorage.getItem('access')) return;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
};

const readTimestamp = (key) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : null;
};

export const isSessionExpired = () => {
  const access = localStorage.getItem('access');
  if (!access) return true;

  const now = Date.now();
  const loginAt = readTimestamp(LOGIN_AT_KEY);
  const lastActivity = readTimestamp(LAST_ACTIVITY_KEY);

  if (!loginAt || !lastActivity) return true;
  if (now - loginAt > SESSION_MAX_AGE_MS) return true;
  if (now - lastActivity > SESSION_INACTIVITY_MS) return true;

  const tokenExpiry = getAccessTokenExpiry(access);
  if (tokenExpiry && now >= tokenExpiry) {
    const refresh = localStorage.getItem('refresh');
    if (!refresh || isRefreshTokenExpired(refresh)) {
      return true;
    }
  }

  return false;
};

export const getAccessTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isAccessTokenExpired = (token = localStorage.getItem('access')) => {
  if (!token) return true;
  const expiry = getAccessTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry;
};

const isRefreshTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const loadStoredUser = () => {
  if (isSessionExpired()) {
    clearStoredSession();
    return null;
  }

  const storedUser = localStorage.getItem('user');
  if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
    return null;
  }

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
