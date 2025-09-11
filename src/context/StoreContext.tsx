import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../config/axios';

interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
}

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  favicon?: string;
  status: string;
  settings: {
    currency: string;
    timezone: string;
    language: string;
    commissionRate: number;
    theme: StoreTheme;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  error: string | null;
  fetchStoreDetails: () => Promise<void>;
  updateStoreTheme: (theme: StoreTheme) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchStoreDetails = async () => {
    if (!user?.storeId || !isAuthenticated) {
      setStore(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/settings/store');
      const storeData = response.data;
      
      setStore(storeData);
      
      // Apply theme to CSS variables
      applyThemeToCSS(storeData.settings.theme);
      
    } catch (err: any) {
      console.error('Error fetching store details:', err);
      setError(err.response?.data?.message || 'Failed to fetch store details');
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToCSS = (theme: StoreTheme) => {
    const root = document.documentElement;
    
    // Convert hex colors to RGB for CSS variables
    const primaryRgb = hexToRgb(theme.primaryColor);
    const secondaryRgb = hexToRgb(theme.secondaryColor);
    
    if (primaryRgb) {
      root.style.setProperty('--color-primary-50', `rgb(${Math.min(255, primaryRgb.r + 200)}, ${Math.min(255, primaryRgb.g + 200)}, ${Math.min(255, primaryRgb.b + 200)})`);
      root.style.setProperty('--color-primary-100', `rgb(${Math.min(255, primaryRgb.r + 150)}, ${Math.min(255, primaryRgb.g + 150)}, ${Math.min(255, primaryRgb.b + 150)})`);
      root.style.setProperty('--color-primary-200', `rgb(${Math.min(255, primaryRgb.r + 100)}, ${Math.min(255, primaryRgb.g + 100)}, ${Math.min(255, primaryRgb.b + 100)})`);
      root.style.setProperty('--color-primary-300', `rgb(${Math.min(255, primaryRgb.r + 50)}, ${Math.min(255, primaryRgb.g + 50)}, ${Math.min(255, primaryRgb.b + 50)})`);
      root.style.setProperty('--color-primary-400', `rgb(${Math.min(255, primaryRgb.r + 25)}, ${Math.min(255, primaryRgb.g + 25)}, ${Math.min(255, primaryRgb.b + 25)})`);
      root.style.setProperty('--color-primary-500', theme.primaryColor);
      root.style.setProperty('--color-primary-600', `rgb(${Math.max(0, primaryRgb.r - 25)}, ${Math.max(0, primaryRgb.g - 25)}, ${Math.max(0, primaryRgb.b - 25)})`);
      root.style.setProperty('--color-primary-700', `rgb(${Math.max(0, primaryRgb.r - 50)}, ${Math.max(0, primaryRgb.g - 50)}, ${Math.max(0, primaryRgb.b - 50)})`);
      root.style.setProperty('--color-primary-800', `rgb(${Math.max(0, primaryRgb.r - 100)}, ${Math.max(0, primaryRgb.g - 100)}, ${Math.max(0, primaryRgb.b - 100)})`);
      root.style.setProperty('--color-primary-900', `rgb(${Math.max(0, primaryRgb.r - 150)}, ${Math.max(0, primaryRgb.g - 150)}, ${Math.max(0, primaryRgb.b - 150)})`);
    }
    
    if (secondaryRgb) {
      root.style.setProperty('--color-secondary-50', `rgb(${Math.min(255, secondaryRgb.r + 200)}, ${Math.min(255, secondaryRgb.g + 200)}, ${Math.min(255, secondaryRgb.b + 200)})`);
      root.style.setProperty('--color-secondary-100', `rgb(${Math.min(255, secondaryRgb.r + 150)}, ${Math.min(255, secondaryRgb.g + 150)}, ${Math.min(255, secondaryRgb.b + 150)})`);
      root.style.setProperty('--color-secondary-200', `rgb(${Math.min(255, secondaryRgb.r + 100)}, ${Math.min(255, secondaryRgb.g + 100)}, ${Math.min(255, secondaryRgb.b + 100)})`);
      root.style.setProperty('--color-secondary-300', `rgb(${Math.min(255, secondaryRgb.r + 50)}, ${Math.min(255, secondaryRgb.g + 50)}, ${Math.min(255, secondaryRgb.b + 50)})`);
      root.style.setProperty('--color-secondary-400', `rgb(${Math.min(255, secondaryRgb.r + 25)}, ${Math.min(255, secondaryRgb.g + 25)}, ${Math.min(255, secondaryRgb.b + 25)})`);
      root.style.setProperty('--color-secondary-500', theme.secondaryColor);
      root.style.setProperty('--color-secondary-600', `rgb(${Math.max(0, secondaryRgb.r - 25)}, ${Math.max(0, secondaryRgb.g - 25)}, ${Math.max(0, secondaryRgb.b - 25)})`);
      root.style.setProperty('--color-secondary-700', `rgb(${Math.max(0, secondaryRgb.r - 50)}, ${Math.max(0, secondaryRgb.g - 50)}, ${Math.max(0, secondaryRgb.b - 50)})`);
      root.style.setProperty('--color-secondary-800', `rgb(${Math.max(0, secondaryRgb.r - 100)}, ${Math.max(0, secondaryRgb.g - 100)}, ${Math.max(0, secondaryRgb.b - 100)})`);
      root.style.setProperty('--color-secondary-900', `rgb(${Math.max(0, secondaryRgb.r - 150)}, ${Math.max(0, secondaryRgb.g - 150)}, ${Math.max(0, secondaryRgb.b - 150)})`);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const updateStoreTheme = (theme: StoreTheme) => {
    if (store) {
      const updatedStore = {
        ...store,
        settings: {
          ...store.settings,
          theme
        }
      };
      setStore(updatedStore);
      applyThemeToCSS(theme);
    }
  };

  // Fetch store details when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.storeId) {
      fetchStoreDetails();
    } else {
      setStore(null);
    }
  }, [isAuthenticated, user?.storeId]);

  return (
    <StoreContext.Provider value={{ 
      store, 
      loading, 
      error, 
      fetchStoreDetails, 
      updateStoreTheme 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
