import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = 'https://saimr-backend-1.onrender.com';

  useEffect(() => {
    // Check URL for handshake or token when returning
    const checkForTruecallerResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const requestId = urlParams.get('requestId');
      const status = urlParams.get('status');
      const accessToken = urlParams.get('accessToken');
      
      console.log("URL params:", { requestId, status, accessToken });
      
      // If we have a handshake status
      if (requestId && status === 'flow_invoked') {
        console.log("Handshake received, sending acknowledgment");
        await acknowledgeHandshake(requestId);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // If we have an access token
      if (accessToken) {
        console.log("Access token received");
        await fetchUserProfile(accessToken, requestId);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // Check if we're returning from Truecaller
      const isReturning = sessionStorage.getItem('truecaller_in_progress');
      if (isReturning && !accessToken) {
        sessionStorage.removeItem('truecaller_in_progress');
        setLoading(false);
      }
    };
    
    checkForTruecallerResponse();
  }, []);

  const acknowledgeHandshake = async (requestId) => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/truecaller/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      console.log("Handshake acknowledged");
    } catch (error) {
      console.error("Handshake acknowledgment failed:", error);
    }
  };

  const fetchUserProfile = async (accessToken, requestId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/truecaller/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          accessToken: accessToken,
          requestNonce: requestId,
          sourceWebsite: 'cleartitle1'
        })
      });
      
      const data = await response.json();
      console.log("Profile fetch response:", data);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onFetchUser) {
          onFetchUser(data.user);
        }
        
        window.location.href = '/profile';
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleTruecaller = () => {
    setLoading(true);
    
    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentUrl = window.location.href.split('?')[0];
    
    // Store for tracking
    sessionStorage.setItem('truecaller_in_progress', 'true');
    sessionStorage.setItem('truecaller_nonce', requestNonce);
    
    // Build the Truecaller deep link URL with all parameters
    const tcUrl = `truecallersdk://truesdk/web_verify?` +
      `type=btmsheet` +
      `&requestNonce=${requestNonce}` +
      `&partnerKey=${partnerKey}` +
      `&partnerName=cleartitle1` +
      `&lang=en` +
      `&privacyUrl=${encodeURIComponent('https://cleartitle1.com/privacy')}` +
      `&termsUrl=${encodeURIComponent('https://cleartitle1.com/terms')}` +
      `&loginPrefix=Sign in with` +
      `&loginSuffix=Truecaller` +
      `&ctaPrefix=Continue` +
      `&ctaColor=%230087ff` +
      `&ctaTextColor=%23ffffff` +
      `&btnShape=round` +
      `&skipOption=Skip for now` +
      `&ttl=30000` +
      `&redirectUrl=${encodeURIComponent(currentUrl)}`;
    
    console.log("Launching Truecaller with URL:", tcUrl);
    
    // Launch Truecaller
    window.location.href = tcUrl;
    
    // Fallback timeout (10 seconds as per docs)
    setTimeout(() => {
      if (loading && document.hasFocus()) {
        // Truecaller app is NOT installed
        setLoading(false);
        sessionStorage.removeItem('truecaller_in_progress');
        const useManual = confirm("Truecaller app not found. Would you like to verify manually?");
        if (useManual) {
          const phone = prompt("Enter your phone number:");
          if (phone && phone.length >= 10) {
            manualVerification(phone);
          }
        }
      } else if (loading) {
        // Truecaller app opened, waiting for callback
        console.log("Truecaller app opened, waiting for callback...");
      }
    }, 10000);
  };

  const manualVerification = async (phoneNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/truecaller/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          sourceWebsite: 'cleartitle1'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/profile';
      }
    } catch (error) {
      alert("Verification failed");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTruecaller}
      disabled={loading}
      className="w-full bg-[#0087ff] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0070d5] transition-all disabled:opacity-50"
    >
      <Phone size={20} />
      {loading ? "Verifying..." : "Verify with Truecaller"}
    </button>
  );
};

export default TruecallerAuth;