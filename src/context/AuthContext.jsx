// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresPhoneUpdate, setRequiresPhoneUpdate] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const phoneUpdateFlag = localStorage.getItem('requiresPhoneUpdate');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRequiresPhoneUpdate(phoneUpdateFlag === 'true');
        } else {
          setUser(null);
          setRequiresPhoneUpdate(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setUser(null);
        setRequiresPhoneUpdate(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('requiresPhoneUpdate');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Google Sign-In
// In your AuthContext.jsx
// In your AuthContext.js - Fix the googleLogin function
const googleLogin = async (googleData) => {
  try {
    console.log('🔍 Google login data:', googleData);
    
    // Extract token - handle both string and object inputs
    let token;
    if (typeof googleData === 'string') {
      token = googleData;
    } else if (googleData && googleData.token) {
      token = googleData.token;
    } else {
      throw new Error('Invalid Google login data');
    }
    
    console.log('✅ Extracted token length:', token?.length);
    console.log('✅ Token first 50 chars:', token?.substring(0, 50));
    
    // Send only the token string to backend
    const { data } = await API.post('/auth/google-signin', {
      token: token
    });
    
    if (data.success && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
      
      // Store website info if available from backend
      if (data.user.sourceWebsite) {
        localStorage.setItem('currentWebsite', data.user.sourceWebsite);
      }
      if (data.user.websiteLogins) {
        localStorage.setItem('websiteLogins', JSON.stringify(data.user.websiteLogins));
      }
      
      setUser(data.user);
      setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
      
      return { success: true, user: data.user };
    } else {
      throw new Error(data.message || 'Google sign-in failed');
    }
  } catch (error) {
    console.error('❌ Google login error:', error);
    throw error;
  }
};

  // Regular login
const login = async (loginData) => {
  try {
    const { data } = await API.post('/auth/login', { 
      emailOrUsername: loginData.emailOrUsername, 
      password: loginData.password,
      sourceWebsite:  'cleartitle1' // Add sourceWebsite
    });
    
    if (data.success && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
      
      setUser(data.user);
      setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
      
      return { success: true, user: data.user };
    } else {
      throw new Error(data.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};
// context/AuthContext.jsx
const register = async (registerData) => {
  try {
    // Ensure sourceWebsite is included (default to cleartitle1 if not provided)
    const dataToSend = {
      ...registerData,
      sourceWebsite: registerData.sourceWebsite || 'cleartitle1'
    };
    
    console.log('Registering user from:', dataToSend.sourceWebsite);
    
    const { data } = await API.post('/auth/register', dataToSend);
    
    if (data.success && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
      
      // Store website login info
      localStorage.setItem('currentWebsite', dataToSend.sourceWebsite);
      localStorage.setItem('websiteLogins', JSON.stringify(data.user.websiteLogins || {}));
      
      setUser(data.user);
      setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
      
      return { success: true, user: data.user };
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
        setUser(data.user);
        setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear Google session if exists
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('requiresPhoneUpdate');
    setUser(null);
    setRequiresPhoneUpdate(false);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const clearPhoneUpdateFlag = () => {
    setRequiresPhoneUpdate(false);
    localStorage.removeItem('requiresPhoneUpdate');
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    updateProfile,
    loading,
    requiresPhoneUpdate,
    clearPhoneUpdateFlag,
    isAuthenticated: !!user,
    userInfo: user ? {
      id: user.id || user._id,
      name: user.name,
      username: user.username,
      gmail: user.gmail,
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isGoogleAuth: user.isGoogleAuth,
      avatar: user.avatar,
      requiresPhoneUpdate: user.requiresPhoneUpdate
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};