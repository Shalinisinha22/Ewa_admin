import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL:'https://ewa-back.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding auth headers for public endpoints
    const publicEndpoints = [
      '/admin/login',
      '/admin/forgot-password',
      '/admin/reset-password',
      '/admin/super-admin'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      // Get token and storeId from localStorage
      const userInfo = localStorage.getItem('admin');
      if (userInfo) {
        try {
          const { token, storeId } = JSON.parse(userInfo);
          // Add token to headers if it exists
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          // Add storeId as query parameter if it exists
          if (storeId && !config.params) {
            config.params = { storeId };
          } else if (storeId) {
            config.params.storeId = storeId;
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
          // Clear invalid data
          localStorage.removeItem('admin');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip auto-redirect for public endpoints
      const publicEndpoints = [
        '/admin/login',
        '/admin/forgot-password',
        '/admin/reset-password',
        '/admin/super-admin'
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (!isPublicEndpoint) {
        // Clear all authentication data
        localStorage.removeItem('admin');
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('auth-state');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;