import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../api/endpoints';
import { userAPI } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await userAPI.login(email, password);
      const { tokens, user: userData } = response.data;
      const newToken = tokens?.access;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await userAPI.register(userData);
      const { tokens, user: newUser } = response.data;
      const newToken = tokens?.access;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    userAPI.logout();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
