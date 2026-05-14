import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const ROLE_MAP = {
  0: 'admin',
  1: 'reader',
  2: 'author',
  3: 'editor',
  4: 'moderator',
  5: 'superadmin'
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists on load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      // Using /api/auth/login/
      const res = await api.post('/api/auth/login/', { identifier, password });
      
      const { access, refresh, user: userData } = res.data; 
      
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      // Redirect based on role
      if (userData?.role !== undefined && ROLE_MAP[userData.role]) {
         navigate(`/${ROLE_MAP[userData.role]}`);
      } else {
         navigate('/');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userDataConfig) => {
    try {
      await api.post('/api/auth/register/', userDataConfig);
      // Auto-login after register, or just return success so the component can redirect to login.
      return { success: true };
    } catch (error) {
       // Detailed validation error handling
       let errorMsg = 'Registration failed';
       if(error.response?.data) {
           const keys = Object.keys(error.response.data);
           if(keys.length > 0) {
               errorMsg = `${keys[0]}: ${error.response.data[keys[0]]}`;
           }
       }
       return { success: false, error: errorMsg };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/sign-in');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
