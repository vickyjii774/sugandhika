import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api.service.js';

const TOKEN_KEY = 'sugandhika_admin_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.getMe();
      if (result.success && result.data) {
        setCurrentUser(result.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    if (result.success && result.data?.token) {
      localStorage.setItem(TOKEN_KEY, result.data.token);
      setCurrentUser(result.data.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    throw new Error(result.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout API errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        login,
        logout,
        getToken,
        refetch: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
