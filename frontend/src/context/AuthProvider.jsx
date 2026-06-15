import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import {
  clearStoredSession,
  isAccessTokenExpired,
  isSessionExpired,
  loadStoredUser,
  markSessionStarted,
  touchSessionActivity,
} from '../utils/authStorage';
import { SESSION_CHECK_INTERVAL_MS } from '../constants/session';
import { ROLE_MAP } from '../constants/roles';
import { AuthContext } from './authContext';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const expireSession = useCallback(() => {
    clearStoredSession();
    setUser(null);
    navigate('/sign-in', { replace: true });
  }, [navigate]);

  const refreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return false;

    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
      localStorage.setItem('access', response.data.access);
      touchSessionActivity();
      return true;
    } catch {
      return false;
    }
  }, []);

  const restoreSession = useCallback(async () => {
    if (isSessionExpired()) {
      clearStoredSession();
      setUser(null);
      return;
    }

    if (isAccessTokenExpired()) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearStoredSession();
        setUser(null);
        return;
      }
    }

    setUser(loadStoredUser());
  }, [refreshAccessToken]);

  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  useEffect(() => {
    if (!user) return undefined;

    const checkExpiry = () => {
      if (isSessionExpired()) {
        expireSession();
      }
    };

    const onActivity = () => touchSessionActivity();

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    const intervalId = window.setInterval(checkExpiry, SESSION_CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(intervalId);
    };
  }, [user, expireSession]);

  const persistSession = (data) => {
    const { access, refresh, user: userData } = data;

    if (!access || !refresh || !userData) {
      throw new Error('Invalid session response from server');
    }

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    markSessionStarted();
    setUser(userData);

    if (userData?.role !== undefined && ROLE_MAP[userData.role]) {
      navigate(`/${ROLE_MAP[userData.role]}`);
    } else {
      navigate('/');
    }
  };

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/api/auth/login/', { identifier, password });
      persistSession(res.data);
      return { success: true };
    } catch (error) {
      if (error.message === 'Invalid session response from server') {
        clearStoredSession();
        return { success: false, error: 'Login succeeded but session data was invalid' };
      }
      const data = error.response?.data;
      return {
        success: false,
        error: data?.error || data?.detail || 'Login failed',
      };
    }
  };

  const loginWithGoogle = async (token, action = 'login') => {
    try {
      const res = await api.post('/api/auth/google/', { token, action });
      persistSession(res.data);
      return { success: true };
    } catch (error) {
      if (error.message === 'Invalid session response from server') {
        clearStoredSession();
        return { success: false, error: 'Google login succeeded but session data was invalid' };
      }
      const data = error.response?.data;
      return {
        success: false,
        error: data?.error || data?.detail || 'Google login failed',
      };
    }
  };

  const register = async (userDataConfig) => {
    try {
      await api.post('/api/auth/register/', userDataConfig);
      return { success: true };
    } catch (error) {
      let errorMsg = 'Registration failed';
      if (error.response?.data) {
        const keys = Object.keys(error.response.data);
        if (keys.length > 0) {
          errorMsg = `${keys[0]}: ${error.response.data[keys[0]]}`;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    navigate('/sign-in');
  };

  const updateSessionUser = (userData) => {
    if (!userData) return;
    localStorage.setItem('user', JSON.stringify(userData));
    touchSessionActivity();
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateSessionUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
