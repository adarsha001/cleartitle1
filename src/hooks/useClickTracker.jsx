import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Simple version that combines everything in one hook
const useClickTracker = () => {
  const { user } = useAuth();

  const trackClick = useCallback(async (clickData) => {
    try {
      // Get session ID
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('sessionId', sessionId);
      }

      // Prepare user data
      const userData = user ? {
        userId: user.id || user._id,
        userName: user.name || user.username || user.gmail || user.email
      } : {};

      const trackingData = {
        ...clickData,
        ...userData,
        sessionId: sessionId,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

    //('📤 Sending click data with auth:', trackingData);

      const response = await fetch('/api/clicks/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
    //('✅ Click tracking response:', result);
      return result.success;
    } catch (error) {
      console.error('❌ Click tracking failed:', error);
      return false;
    }
  }, [user]); // user as dependency

  return { trackClick };
};

export default useClickTracker;