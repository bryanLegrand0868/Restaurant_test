import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  const checkAuthState = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if it's a user token or admin token
      const adminToken = localStorage.getItem('adminToken');

      if (adminToken) {
        // Verify admin token with backend
        const response = await axios.get(`${API_URL}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (response.data) {
          setAdmin(response.data);
        }
      } else {
        // Verify user token with backend
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Auth state verification error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  }, []);

  // User login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
      
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User registration
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, userData);
      
      const { token, ...newUserData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUserData);
      
      toast.success('Registration successful!');
      return newUserData;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const adminLogin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { username, password });
      
      const { token, ...adminData } = response.data;
      
      localStorage.setItem('adminToken', token);
      setAdmin(adminData);
      
      toast.success('Admin login successful!');
      return adminData;
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed. Please try again.';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setUser(null);
    setAdmin(null);
    toast.info('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/api/users/profile`, 
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(prev => ({ ...prev, ...response.data }));
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (photoFile) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await axios.post(
        `${API_URL}/api/users/profile/photo`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      setUser(prev => ({ ...prev, profilePhoto: response.data.profilePhoto }));
      toast.success('Profile photo updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload photo. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    admin,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: !!admin,
    login,
    register,
    adminLogin,
    logout,
    updateProfile,
    uploadProfilePhoto,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
