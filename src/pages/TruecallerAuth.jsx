import React, { useState, useEffect, useRef } from 'react';
import { Phone, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://saimr-backend-1.onrender.com';

const TruecallerAuth = ({ onFetchUser, onSuccess, onError, redirectUrl = '/profile' }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, launching, polling, success, error, fallback
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const cleanup = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleFallback = () => {
    cleanup();
    setStatus('fallback');
    setLoading(false);
    
    const useManual = window.confirm(
      "Truecaller verification timed out or was cancelled. Would you like to verify manually with your phone number?"
    );
    
    if (useManual) {
      const phone = window.prompt(
        "Please enter your phone number with country code (e.g., +1234567890):"
      );
      
      if (phone && phone.trim().length >= 10) {
        manualVerification(phone.trim());
      } else {
        setStatus('error');
        setErrorMessage('Phone number is required for verification');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } else {
      setStatus('idle');
    }
  };

  const manualVerification = async (phoneNumber) => {
    setLoading(true);
    setStatus('verifying');
    setErrorMessage('');
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/truecaller/manual`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber, 
          sourceWebsite: 'cleartitle1' 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStatus('success');
        
        // Callbacks
        if (onFetchUser) onFetchUser(data.user);
        if (onSuccess) onSuccess(data.user);
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Verification failed. Please try again.');
      setLoading(false);
      
      setTimeout(() => {
        if (status === 'error') setStatus('idle');
      }, 5000);
    }
  };

  const handleTruecaller = () => {
    setLoading(true);
    setStatus('launching');
    setErrorMessage('');
    setAttemptCount(0);
    
    cleanup();

    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build Truecaller URL
    const tcUrl = new URL('truecallersdk://truesdk/web_verify');
    const params = {
      type: 'btmsheet',
      requestNonce: requestNonce,
      partnerKey: partnerKey,
      partnerName: 'cleartitle1',
      lang: 'en',
      privacyUrl: 'https://cleartitle1.com/privacy',
      termsUrl: 'https://cleartitle1.com/terms',
      loginPrefix: 'Sign in with',
      loginSuffix: 'Truecaller',
      ctaPrefix: 'Continue',
      ctaColor: '%230087ff',
      ctaTextColor: '%23ffffff',
      btnShape: 'round',
      skipOption: 'Skip for now',
      ttl: '30000'
    };

    Object.entries(params).forEach(([key, value]) => {
      tcUrl.searchParams.set(key, value);
    });

    const finalUrl = tcUrl.toString();
    console.log('Launching Truecaller with URL:', finalUrl);
    console.log('Request Nonce:', requestNonce);

    // Attempt to open Truecaller
    try {
      window.location.href = finalUrl;
    } catch (error) {
      console.error('Failed to launch Truecaller:', error);
    }

    setStatus('polling');

    // Start polling for session
    const maxAttempts = 30; // 30 * 2s = 60 seconds
    const pollInterval = 2000; // 2 seconds

    pollRef.current = setInterval(async () => {
      setAttemptCount(prev => {
        const newCount = prev + 1;
        
        if (newCount >= maxAttempts) {
          cleanup();
          setLoading(false);
          handleFallback();
        }
        
        return newCount;
      });
      
      try {
        console.log(`Polling attempt ${attemptCount + 1}/${maxAttempts} for:`, requestNonce);
        
        const res = await fetch(`${BACKEND_URL}/api/auth/truecaller/session/${requestNonce}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (res.status === 404) {
          // Session not ready yet
          console.log('Session not ready yet');
          return;
        }

        if (res.status === 202) {
          // Waiting for verification
          console.log('Waiting for verification...');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          
          if (data.ready) {
            console.log('Verification successful!', data.user);
            cleanup();
            
            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setStatus('success');
            setLoading(false);
            
            // Callbacks
            if (onFetchUser) onFetchUser(data.user);
            if (onSuccess) onSuccess(data.user);
            
            // Redirect after short delay
            timeoutRef.current = setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1000);
          }
        } else {
          console.error('Unexpected response:', res.status);
        }
      } catch (error) {
        console.error('Polling error:', error);
        
        // Don't stop polling on network errors, but log them
        if (attemptCount >= maxAttempts - 5) {
          console.warn('Approaching max attempts with errors');
        }
      }
    }, pollInterval);

    // Fallback timeout (backup)
    timeoutRef.current = setTimeout(() => {
      if (status === 'polling' || status === 'launching') {
        console.log('Global timeout reached, falling back');
        cleanup();
        setLoading(false);
        handleFallback();
      }
    }, 65000); // 65 seconds total timeout
  };

  // Render different button states
  const renderButton = () => {
    const baseClasses = "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200";
    
    switch (status) {
      case 'launching':
        return (
          <button disabled className={`${baseClasses} bg-blue-400 text-white cursor-wait`}>
            <Loader size={20} className="animate-spin" />
            Launching Truecaller...
          </button>
        );
      
      case 'polling':
        return (
          <button disabled className={`${baseClasses} bg-blue-400 text-white cursor-wait`}>
            <Loader size={20} className="animate-spin" />
            Verifying... ({attemptCount}/30)
          </button>
        );
      
      case 'verifying':
        return (
          <button disabled className={`${baseClasses} bg-blue-400 text-white cursor-wait`}>
            <Loader size={20} className="animate-spin" />
            Verifying phone number...
          </button>
        );
      
      case 'success':
        return (
          <button disabled className={`${baseClasses} bg-green-500 text-white`}>
            <CheckCircle size={20} />
            Verified! Redirecting...
          </button>
        );
      
      case 'error':
        return (
          <button 
            onClick={handleTruecaller}
            className={`${baseClasses} bg-red-500 hover:bg-red-600 text-white`}
          >
            <AlertCircle size={20} />
            Error - Try Again
          </button>
        );
      
      default:
        return (
          <button
            onClick={handleTruecaller}
            disabled={loading}
            className={`${baseClasses} bg-[#0087ff] hover:bg-[#0070d5] text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Phone size={20} />
            {loading ? "Please wait..." : "Verify with Truecaller"}
          </button>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {renderButton()}
      
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </p>
        </div>
      )}
      
      {status === 'polling' && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Waiting for Truecaller verification...
            <br />
            <button 
              onClick={handleFallback}
              className="text-blue-500 hover:text-blue-700 underline mt-1"
            >
              Cancel and verify manually
            </button>
          </p>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-blue-500 hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default TruecallerAuth;