// context/LikesContext.js - UPDATED VERSION
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

// Simple reducer
const likesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LIKED_PROPERTIES':
      return { 
        ...state, 
        likedProperties: action.payload, 
        loading: false, 
        error: null 
      };
    case 'ADD_LIKED_PROPERTY':
      return { 
        ...state, 
        likedProperties: [...state.likedProperties, action.payload],
        loading: false 
      };
    case 'REMOVE_LIKED_PROPERTY':
      return { 
        ...state, 
        likedProperties: state.likedProperties.filter(id => id !== action.payload),
        loading: false 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET_LIKES':
      return { likedProperties: [], loading: false, error: null };
    default:
      return state;
  }
};

const initialState = {
  likedProperties: [],
  loading: false,
  error: null,
};

const LikesContext = createContext();

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};

export const LikesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(likesReducer, initialState);
  const { user } = useAuth();

  // Fetch user's liked properties
  const fetchLikedProperties = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'RESET_LIKES' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        dispatch({ type: 'SET_LIKED_PROPERTIES', payload: [] });
        return;
      }

      console.log('📡 Fetching liked properties from API...');
      
      // Use a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://saimr-backend-1.onrender.com/api/property-units/likes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('✅ API Response status:', response.status);
      
      // If error, just return empty array (don't show error)
      if (response.status === 400 || response.status === 401 || response.status === 404) {
        console.log('⚠️ API returned error, using empty array');
        dispatch({ type: 'SET_LIKED_PROPERTIES', payload: [] });
        return;
      }

      if (!response.ok) {
        console.log('❌ Response not OK, using empty array');
        dispatch({ type: 'SET_LIKED_PROPERTIES', payload: [] });
        return;
      }

      const data = await response.json();
      console.log('📦 API Response data:', data);
      
      if (data.success) {
        let likedIds = [];
        
        // Handle different response formats
        if (Array.isArray(data.data)) {
          if (data.data.length > 0) {
            // If it's an array of strings (property IDs)
            if (typeof data.data[0] === 'string') {
              likedIds = data.data;
            }
            // If it's an array of objects
            else if (data.data[0].propertyId) {
              likedIds = data.data.map(item => item.propertyId).filter(Boolean);
            }
            // If it's an array of property objects
            else if (data.data[0]._id) {
              likedIds = data.data.map(item => item._id).filter(Boolean);
            }
          }
        }
        
        console.log('🎯 Setting liked properties:', likedIds);
        dispatch({ type: 'SET_LIKED_PROPERTIES', payload: likedIds });
      } else {
        console.log('⚠️ API returned success: false');
        dispatch({ type: 'SET_LIKED_PROPERTIES', payload: [] });
      }
      
    } catch (error) {
      console.log('❌ Error fetching liked properties (silent fail):', error.name);
      // Silently fail - don't show error to user
      dispatch({ type: 'SET_LIKED_PROPERTIES', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Initialize liked properties
  useEffect(() => {
    if (user) {
      fetchLikedProperties();
    } else {
      dispatch({ type: 'RESET_LIKES' });
    }
  }, [user, fetchLikedProperties]);

  // Toggle like/unlike
  const toggleLike = async (propertyId) => {
    if (!user) {
      toast.error('Please login to save favorites');
      return false;
    }

    if (!propertyId) {
      toast.error('Invalid property');
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return false;
      }

      console.log(`🔄 Toggling like for property: ${propertyId}`);
      
      const response = await fetch(
        `https://saimr-backend-1.onrender.com/api/property-units/likes/toggle/${propertyId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Toggle response status:', response.status);
      
      if (!response.ok) {
        // Try to get error message
        let errorMessage = 'Failed to update favorite';
        try {
          const errorText = await response.text();
          console.error('Toggle error text:', errorText);
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Ignore parsing error
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Toggle result:', result);
      
      if (result.success) {
        // Update local state based on result
        if (result.isLiked) {
          dispatch({ type: 'ADD_LIKED_PROPERTY', payload: propertyId });
          toast.success('Added to favorites');
        } else {
          dispatch({ type: 'REMOVE_LIKED_PROPERTY', payload: propertyId });
          toast.success('Removed from favorites');
        }
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to update favorite');
      }
      
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      toast.error(error.message || 'Failed to update favorite');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check if a property is liked
  const checkIsPropertyLiked = (propertyId) => {
    return state.likedProperties.includes(propertyId);
  };

  const value = {
    // State
    likedProperties: state.likedProperties,
    loading: state.loading,
    error: state.error,
    
    // Functions
    isPropertyLiked: checkIsPropertyLiked,
    toggleLike,
    fetchLikedProperties,
  };

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
};