import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// Create Auth Context
export const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current logged-in user
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error message

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      // Try to get saved user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.log('Not authenticated:', err);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (loginData) => {
    try {
      setError('');
      setLoading(true);
      
      // Support both old format (email, password) and new format (object)
      const requestData = typeof loginData === 'string' ? 
        { email: loginData, password: arguments[1] } : 
        loginData;
      
      const response = await axiosClient.post('/auth/login', requestData);

      const userData = response.data.user;
      setUser(userData);
      
      // Save user to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (registrationData) => {
    try {
      setError('');
      setLoading(true);
      
      // Support both old format (name, email, password, role) and new format (object)
      const requestData = typeof registrationData === 'string' ? 
        { 
          name: registrationData, 
          email: arguments[1], 
          password: arguments[2], 
          role: arguments[3] 
        } : 
        registrationData;
      
      const response = await axiosClient.post('/auth/register', requestData);

      const userData = response.data.user;
      setUser(userData);
      
      // Save user to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError, // To clear errors manually
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};