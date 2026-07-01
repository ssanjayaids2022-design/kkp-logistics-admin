import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

export interface PasswordResetRequest {
  id: string;
  userId: string;
  username: string;
  name: string;
  reason?: string;
  at: string;
  status: 'pending' | 'resolved';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  changePassword: (userId: string, newPassword: string) => boolean;
  requestPasswordReset: (username: string, reason?: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default user accounts
const DEFAULT_USERS = [
  { username: 'chairman', password: 'chair123', data: { id: 'USR-002', name: 'Chairman (CEO)', email: 'chairman@kkptransports.com', role: 'CHAIRMAN' as const, scope: 'National (Full Access)', status: 'Active' } },
  { username: 'manager', password: 'mgr123', data: { id: 'USR-001', name: 'General Manager', email: 'manager@kkptransports.com', role: 'MANAGER' as const, scope: 'National (Full Access)', status: 'Active' } },
  { username: 'loadadmin', password: 'load123', data: { id: 'USR-003', name: 'Load Dispatcher', email: 'loadadmin@kkptransports.com', role: 'LOAD_ADMIN' as const, scope: 'South Region (Chennai/Cbe)', status: 'Active' } },
  { username: 'karthik', password: 'admin123', data: { id: 'USR-004', name: 'Karthik Raja', email: 'karthik.r@kkptransports.com', role: 'MANAGER' as const, scope: 'Tamil Nadu Operations', status: 'Active' } },
  { username: 'priya', password: 'admin123', data: { id: 'USR-005', name: 'Priya Sharma', email: 'priya.s@kkptransports.com', role: 'LOAD_ADMIN' as const, scope: 'North Region (Delhi)', status: 'Suspended' } },
];

// Seed default accounts when missing, but DO NOT wipe existing data — otherwise
// an admin's changed password would reset on the next load. Only adds any
// default account that isn't present.
const initializeUsers = () => {
  const stored = localStorage.getItem('kkp_users');
  let users: any[] = [];
  if (stored) {
    try { users = JSON.parse(stored); } catch { users = []; }
  }
  if (!Array.isArray(users) || users.length === 0) {
    localStorage.setItem('kkp_users', JSON.stringify(DEFAULT_USERS));
    return;
  }
  let changed = false;
  for (const d of DEFAULT_USERS) {
    if (!users.find(u => u.username === d.username)) { users.push(d); changed = true; }
  }
  if (changed) localStorage.setItem('kkp_users', JSON.stringify(users));
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUsers();
    
    const syncAuth = () => {
      const storedRole = localStorage.getItem('kkp_auth_role');
      const storedUserId = localStorage.getItem('kkp_auth_user_id');
      if (storedRole && storedUserId) {
        const usersList = JSON.parse(localStorage.getItem('kkp_users') || '[]');
        const found = usersList.find((u: any) => u.data.id === storedUserId);
        if (found) {
          if (found.data.status === 'Suspended') {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('kkp_auth_role');
            localStorage.removeItem('kkp_auth_user_id');
          } else {
            setIsAuthenticated(true);
            setUser(found.data);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('kkp_auth_role');
          localStorage.removeItem('kkp_auth_user_id');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    syncAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kkp_users' || e.key === 'kkp_auth_user_id' || e.key === 'kkp_auth_role') {
        syncAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (username: string, password: string): boolean => {
    initializeUsers();
    const usersList = JSON.parse(localStorage.getItem('kkp_users') || '[]');
    const cleanedLoginId = username.trim().toLowerCase();
    const found = usersList.find((u: any) => {
      const matchUsername = u.username && u.username.toLowerCase() === cleanedLoginId;
      const matchEmail = u.data && u.data.email && u.data.email.toLowerCase() === cleanedLoginId;
      return (matchUsername || matchEmail) && u.password === password;
    });
    if (found) {
      if (found.data.status === 'Suspended') {
        return false;
      }
      // Record login time (manager can review these in Admin Management).
      const lastLogin = new Date().toISOString();
      found.data.lastLogin = lastLogin;
      const withLogin = usersList.map((u: any) => (u.data.id === found.data.id ? found : u));
      localStorage.setItem('kkp_users', JSON.stringify(withLogin));

      setIsAuthenticated(true);
      setUser(found.data);
      localStorage.setItem('kkp_auth_role', found.data.role);
      localStorage.setItem('kkp_auth_user_id', found.data.id);
      return true;
    }
    return false;
  };

  // Manager-only password change (caller enforces role + chairman guard).
  const changePassword = (userId: string, newPassword: string): boolean => {
    const users = JSON.parse(localStorage.getItem('kkp_users') || '[]');
    let ok = false;
    const updated = users.map((u: any) => {
      if (u.data.id === userId) { ok = true; return { ...u, password: newPassword }; }
      return u;
    });
    if (ok) localStorage.setItem('kkp_users', JSON.stringify(updated));
    return ok;
  };

  // An admin asks the manager to reset their password (stored as a request).
  const requestPasswordReset = (username: string, reason?: string): boolean => {
    const users = JSON.parse(localStorage.getItem('kkp_users') || '[]');
    const id = (username || '').trim().toLowerCase();
    const target = users.find((u: any) =>
      u.username?.toLowerCase() === id || u.data?.email?.toLowerCase() === id);
    if (!target) return false;
    const reqs: PasswordResetRequest[] = JSON.parse(localStorage.getItem('kkp_pwd_requests') || '[]');
    reqs.unshift({
      id: `REQ-${Date.now()}`,
      userId: target.data.id,
      username: target.username,
      name: target.data.name,
      reason,
      at: new Date().toISOString(),
      status: 'pending',
    });
    localStorage.setItem('kkp_pwd_requests', JSON.stringify(reqs));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('kkp_auth_role');
    localStorage.removeItem('kkp_auth_user_id');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      
      const currentUsers = JSON.parse(localStorage.getItem('kkp_users') || '[]');
      const updatedUsers = currentUsers.map((u: any) => {
        if (u.data.id === prev.id) {
          return { ...u, data: { ...u.data, ...data } };
        }
        return u;
      });
      localStorage.setItem('kkp_users', JSON.stringify(updatedUsers));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, changePassword, requestPasswordReset, loading }}>
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
