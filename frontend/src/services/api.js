// frontend/src/services/api.js - Django Backend API Service
import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('REACT_APP_API_BASE_URL is not defined in environment variables');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for Django session/cookie handling
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with better error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      console.error('Authentication error - user may need to re-login');
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    const response = await api.get('/health/');
    return response.data;
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    throw new Error(`Backend connection failed: ${error.message}`);
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health/');
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
};

export default api;