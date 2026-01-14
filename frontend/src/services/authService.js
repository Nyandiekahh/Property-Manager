// frontend/src/services/authService.js - Django Authentication Service
import api from './api';

const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Signup
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup/', userData);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/password-reset/', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password with token
  async resetPasswordWithToken(token, email, newPassword) {
    try {
      const response = await api.post('/auth/password-reset-confirm/', {
        token,
        email,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update password (when logged in)
  async updatePassword(oldPassword, newPassword) {
    try {
      const response = await api.post('/auth/password-change/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh token (if using JWT refresh tokens)
  async refreshToken() {
    try {
      const response = await api.post('/auth/token/refresh/');
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;