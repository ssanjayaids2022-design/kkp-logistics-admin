import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN: User = {
  id: 'USR-001',
  name: 'Admin User',
  email: 'admin@kkptransports.com',
  role: 'ADMIN',
};

const MOCK_SUPER_ADMIN: User = {
  id: 'USR-002',
  name: 'Super Admin',
  email: 'super@kkptransports.com',
  role: 'SUPER_ADMIN',
};

const USERS = [
  { username: 'admin', password: 'admin123', data: MOCK_ADMIN },
  { username: 'superadmin', password: 'super123', data: MOCK_SUPER_ADMIN },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('kkp_auth_role');
    if (stored) {
      const found = USERS.find(u => u.data.role === stored);
      if (found) {
        setIsAuthenticated(true);
        setUser(found.data);
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const found = USERS.find(u => u.username === username && u.password === password);
    if (found) {
      setIsAuthenticated(true);
      setUser(found.data);
      localStorage.setItem('kkp_auth_role', found.data.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('kkp_auth_role');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
