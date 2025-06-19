// frontend/src/context/AuthContext.js - Enhanced with Forgot Password
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../services/firebase';

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

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Enhanced password reset with backend integration
  const resetPassword = async (email) => {
    try {
      // Use our backend forgot password endpoint for better email templates
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      // Fallback to Firebase reset if backend fails
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: 'Password reset email sent successfully' };
      } catch (firebaseError) {
        throw firebaseError;
      }
    }
  };

  // Reset password with token (for the reset password page)
  const resetPasswordWithToken = async (token, email, newPassword) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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