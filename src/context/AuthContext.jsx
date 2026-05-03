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

  // Google Sign-In with referral code support
  const googleLogin = async (token, referralCode = null) => {
    try {
      if (!token || typeof token !== 'string') {
        console.error('❌ Invalid token format:', token);
        throw new Error('Invalid Google token received');
      }
      
      // Prepare payload with optional referral code
      const payload = { token: token };
      if (referralCode) {
        payload.referralCode = referralCode;
        console.log('Google login with referral code:', referralCode);
      }
      
      const { data } = await API.post('/auth/google-signin', payload);
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
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
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  // Regular login
  const login = async (loginData) => {
    try {
      const { data } = await API.post('/auth/login', { 
        emailOrUsername: loginData.emailOrUsername, 
        password: loginData.password,
        sourceWebsite: 'cleartitle1'
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

  // Register with referral code support
  const register = async (registerData) => {
    try {
      const dataToSend = {
        ...registerData,
        sourceWebsite: registerData.sourceWebsite || 'cleartitle1'
      };
      
      console.log('Registering user from:', dataToSend.sourceWebsite);
      if (dataToSend.referralCode) {
        console.log('With referral code:', dataToSend.referralCode);
      }
      
      const { data } = await API.post('/auth/register', dataToSend);
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
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

  const loginWithTruecaller = async (truecallerData) => {
    try {
      const { token, user } = truecallerData;
      
      if (!token || !user) {
        throw new Error('Invalid Truecaller login data');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('requiresPhoneUpdate', user.requiresPhoneUpdate || false);
      
      if (user.sourceWebsite) {
        localStorage.setItem('currentWebsite', user.sourceWebsite);
      }
      
      setUser(user);
      setRequiresPhoneUpdate(user.requiresPhoneUpdate || false);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Truecaller login error:', error);
      throw error;
    }
  };

  const logout = () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.warn('Error disabling Google auto select:', error);
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('requiresPhoneUpdate');
    localStorage.removeItem('currentWebsite');
    localStorage.removeItem('websiteLogins');
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
    loginWithTruecaller,
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