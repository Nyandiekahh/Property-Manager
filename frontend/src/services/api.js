// frontend/src/services/api.js
import axios from 'axios';
import { auth } from './firebase';

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    // Some backend endpoints expect this header
    config.headers['authorization-uid'] = user.uid;
  }
  return config;
});

// Handle response errors with better error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      console.error('Authentication error - user may need to re-login');
    } else if (error.response?.status === 403) {
      console.error('Permission denied - user not authorized');
    } else if (error.response?.status >= 500) {
      console.error('Server error - backend may be down');
    }
    
    return Promise.reject(error);
  }
);

// Test connection to backend
export const testConnection = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    throw new Error(`Backend connection failed: ${error.message}`);
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
};

export default api;