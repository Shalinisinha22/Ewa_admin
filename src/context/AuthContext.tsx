import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem('ewaUser');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axiosInstance.post('/users/login', { email, password });
      
      if (data && data.isAdmin) {
        localStorage.setItem('ewaUser', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
      } else {
        throw new Error('Unauthorized access');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Invalid credentials';
    }
  };

  const logout = () => {
    localStorage.removeItem('ewaUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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