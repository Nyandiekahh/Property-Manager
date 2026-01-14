// frontend/src/context/AuthContext.js - Django Backend Auth Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signup = async (email, password, name, phoneNumber) => {
    try {
      const response = await authService.signup({
        email,
        password,
        name,
        phone_number: phoneNumber
      });
      
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await authService.requestPasswordReset(email);
      return { success: true, message: result.message || 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const resetPasswordWithToken = async (token, email, newPassword) => {
    try {
      const result = await authService.resetPasswordWithToken(token, email, newPassword);
      return { success: true, message: result.message || 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    resetPasswordWithToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};