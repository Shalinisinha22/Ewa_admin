import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  status: string;
  storeName?: string;
  storeId?: string;
  role: string;
  permissions: string[];
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validate token on app start
  const validateToken = async () => {
    try {
      const userInfo = localStorage.getItem('admin');
      if (!userInfo) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userInfo);
      if (!parsedUser.token) {
        localStorage.removeItem('admin');
        setLoading(false);
        return;
      }

      // Verify token with backend
      const { data } = await axiosInstance.get('/admin/profile');
      
      if (data) {
        // Update user data with latest from server
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          status: data.status,
          storeName: data.storeName,
          storeId: data.storeId,
          role: data.role,
          permissions: data.permissions,
          token: parsedUser.token // Keep the existing token
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Update localStorage with latest data
        localStorage.setItem('admin', JSON.stringify(userData));
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('admin');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('Token validation error:', error);
      // Clear invalid token
      localStorage.removeItem('admin');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post('/admin/login', { email, password });
      
      if (data && data.token) {
        // Clear any existing tokens first
        localStorage.removeItem('admin');
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('auth-state');
        
        // Store the complete user data including storeId
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          status: data.status,
          storeName: data.storeName,
          storeId: data.storeId,
          role: data.role,
          permissions: data.permissions,
          token: data.token
        };
        
        localStorage.setItem('admin', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Invalid credentials';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('admin');
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('auth-state');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('admin', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};