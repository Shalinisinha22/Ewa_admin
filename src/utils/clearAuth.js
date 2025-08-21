// Utility function to clear all authentication data
export const clearAllAuthData = () => {
  const keysToRemove = [
    'admin',
    'authToken',
    'auth-token',
    'token',
    'auth-storage',
    'auth-state',
    'userInfo',
    'user'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('All authentication data cleared');
};

// Function to check what auth data exists
export const checkAuthData = () => {
  const authKeys = [
    'admin',
    'authToken',
    'auth-token',
    'token',
    'auth-storage',
    'auth-state',
    'userInfo',
    'user'
  ];

  const existingData = {};
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      existingData[key] = value;
    }
  });

  console.log('Existing authentication data:', existingData);
  return existingData;
}; 