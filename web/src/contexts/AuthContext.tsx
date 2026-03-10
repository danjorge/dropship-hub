import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/utils/storage';
import { authApi } from '@/lib/api/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const token = storage.getAccessToken();
    setAccessToken(token);
    
    // Fetch user data if token exists
    if (token) {
      authApi.getCurrentUser()
        .then(response => {
          setUser(response.user);
        })
        .catch(() => {
          // Token might be invalid, clear it
          storage.clearAll();
          setAccessToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    storage.setAccessToken(token);
    setAccessToken(token);
    setUser(userData);
  };

  const logout = () => {
    storage.clearAll();
    setAccessToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
