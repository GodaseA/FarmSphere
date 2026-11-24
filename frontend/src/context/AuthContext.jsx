import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token') || null);
  const [loading, setLoading] = useState(false);

  const saveAuthSession = (authData) => {
    localStorage.setItem('agriconnect_token', authData.access_token);
    localStorage.setItem('agriconnect_refresh_token', authData.refresh_token);
    localStorage.setItem('agriconnect_user', JSON.stringify(authData.user));
    setToken(authData.access_token);
    setUser(authData.user);
  };

  const extractErrorMessage = (err, fallback = "Operation failed") => {
    if (!err) return fallback;
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object') {
      if (typeof detail.detail === 'string') return detail.detail;
      if (typeof detail.message === 'string') return detail.message;
      if (Array.isArray(detail)) {
        return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
      }
      return JSON.stringify(detail);
    }
    return err.message || fallback;
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const cleanUser = (username || '').trim();
      const res = await authAPI.login({ username: cleanUser, password });
      saveAuthSession(res.data);
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Invalid email/phone or password");
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const registerFarmer = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.registerFarmer(formData);
      saveAuthSession(res.data);
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Registration failed");
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.registerCustomer(formData);
      saveAuthSession(res.data);
      return { success: true, user: res.data.user };
    } catch (err) {
      const errorMsg = extractErrorMessage(err, "Registration failed");
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agriconnect_refresh_token');
    localStorage.removeItem('agriconnect_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (roleType) => {
    let username = "customer1@agriconnect.test";
    let password = "customer123";

    if (roleType === "admin") {
      username = "admin@agriconnect.test";
      password = "admin123";
    } else if (roleType === "farmer") {
      username = "farmer1@agriconnect.test";
      password = "farmer123";
    } else if (roleType === "farmer_pending") {
      username = "farmer2@agriconnect.test";
      password = "farmer123";
    }

    return await login(username, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        registerFarmer,
        registerCustomer,
        logout,
        quickDemoLogin,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
