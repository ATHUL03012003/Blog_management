export const clearStoredSession = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

export const loadStoredUser = () => {
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
