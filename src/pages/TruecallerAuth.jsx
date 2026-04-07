import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = 'https://saimr-backend-1.onrender.com';

  useEffect(() => {
    // Check for token when component loads (for return from Truecaller)
    const checkForToken = async () => {
      console.log("Checking for Truecaller token in URL...");
      
      const urlParams = new URLSearchParams(window.location.search);
      let token = urlParams.get('token');
      let error = urlParams.get('error');
      let errorMessage = urlParams.get('errorMessage');
      
      // Also check hash fragment
      if (!token) {
        const hash = window.location.hash.substring(1);
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          token = hashParams.get('token');
        }
      }
      
      // Check session storage
      if (!token) {
        token = sessionStorage.getItem('truecaller_pending_token');
      }
      
      if (error) {
        console.error("Truecaller error:", errorMessage);
        alert("Truecaller verification failed: " + (errorMessage || error));
        setLoading(false);
        sessionStorage.removeItem('truecaller_in_progress');
        sessionStorage.removeItem('truecaller_pending_token');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (token) {
        console.log("✅ Token found, sending to backend...");
        sessionStorage.removeItem('truecaller_in_progress');
        sessionStorage.removeItem('truecaller_pending_token');
        await sendTokenToBackend(token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // Check if we're returning from Truecaller
      const isReturning = sessionStorage.getItem('truecaller_in_progress');
      if (isReturning) {
        sessionStorage.removeItem('truecaller_in_progress');
        console.log("Returned from Truecaller but no token found");
        setLoading(false);
        
        // If no token after 2 seconds, show manual input
        setTimeout(() => {
          if (!token && !sessionStorage.getItem('token_processed')) {
            const manualPhone = prompt("Truecaller verification didn't work. Please enter your phone number manually:");
            if (manualPhone && manualPhone.length >= 10) {
              sendManualPhoneToBackend(manualPhone);
            }
          }
        }, 1000);
      }
    };
    
    checkForToken();
  }, []);

  const sendTokenToBackend = async (token) => {
    setLoading(true);
    sessionStorage.setItem('token_processed', 'true');
    
    try {
      console.log("Sending token to backend...");
      
      const response = await fetch(`${BACKEND_URL}/api/auth/truecaller/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          verificationToken: token,
          sourceWebsite: 'cleartitle1'
        })
      });
      
      const data = await response.json();
      console.log("Backend response:", data);
      
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
      console.error("Backend error:", error);
      alert(error.message || "Verification failed. Please try again.");
      setLoading(false);
      sessionStorage.removeItem('token_processed');
    }
  };

  const sendManualPhoneToBackend = async (phoneNumber) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/truecaller/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          firstName: "Manual",
          lastName: "User",
          sourceWebsite: 'cleartitle1'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onFetchUser) {
          onFetchUser(data.user);
        }
        
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error("Manual verification error:", error);
      alert("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleTruecaller = () => {
    setLoading(true);
    
    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current URL without any parameters
    const currentUrl = window.location.href.split('?')[0];
    
    sessionStorage.setItem('truecaller_in_progress', 'true');
    sessionStorage.setItem('truecaller_nonce', requestNonce);
    
    const tcUrl = `truecallersdk://truesdk/web_verify?` +
      `type=btmsheet` +
      `&requestNonce=${requestNonce}` +
      `&partnerKey=${partnerKey}` +
      `&partnerName=cleartitle1` +
      `&lang=en` +
      `&redirectUrl=${encodeURIComponent(currentUrl)}`;
    
    console.log("Launching Truecaller with URL:", tcUrl);
    console.log("Redirect URL:", currentUrl);
    
    // Launch Truecaller
    window.location.href = tcUrl;
    
    // Fallback timeout (30 seconds)
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        sessionStorage.removeItem('truecaller_in_progress');
        const tryManual = confirm("Truecaller didn't respond. Would you like to verify manually with phone number?");
        if (tryManual) {
          const phone = prompt("Enter your phone number:");
          if (phone && phone.length >= 10) {
            sendManualPhoneToBackend(phone);
          }
        }
      }
    }, 30000);
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