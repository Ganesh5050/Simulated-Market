// API Configuration for PipeIt
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pipe-it-backend.onrender.com';

// Helper function for API calls
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await apiFetch('/health');
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};
