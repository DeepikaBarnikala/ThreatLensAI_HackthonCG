import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('threatlens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('threatlens_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('threatlens_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('threatlens_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('threatlens_token', access_token);
    localStorage.setItem('threatlens_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (registration) => {
    const res = await authApi.register(registration);
    const { access_token, user: registeredUser } = res.data;
    setToken(access_token);
    setUser(registeredUser);
    localStorage.setItem('threatlens_token', access_token);
    localStorage.setItem('threatlens_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('threatlens_token');
    localStorage.removeItem('threatlens_user');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'Admin') return true; // Admin has superuser access
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      hasRole,
      isAuthenticated: !!user,
      role: user?.role
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
