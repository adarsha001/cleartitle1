import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import axios from 'axios';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = 'https://saimr-backend-1.onrender.com';

  useEffect(() => {
    // Listen for Truecaller's response - it sends a JWT token
    const handleTruecallerResponse = (event) => {
      console.log("Raw message received:", event.data);
      
      // Truecaller sends the verification token
      if (event.data && typeof event.data === 'object') {
        // Check for token in response
        if (event.data.token) {
          console.log("Token received from Truecaller");
          sendTokenToBackend(event.data.token);
        }
        // Some versions send credential
        else if (event.data.credential) {
          console.log("Credential received from Truecaller");
          sendTokenToBackend(event.data.credential);
        }
      }
      
      // Check for string response (might be JSON string)
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.token) {
            sendTokenToBackend(parsed.token);
          } else if (parsed.credential) {
            sendTokenToBackend(parsed.credential);
          }
        } catch (e) {
          // If it's a plain token string
          if (event.data.length > 50) { // JWT tokens are long
            sendTokenToBackend(event.data);
          }
        }
      }
    };

    // Check URL for token (some versions return via redirect)
    const checkUrlForToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const credential = urlParams.get('credential');
      const verificationToken = urlParams.get('verificationToken');
      
      if (token) {
        sendTokenToBackend(token);
        return true;
      }
      if (credential) {
        sendTokenToBackend(credential);
        return true;
      }
      if (verificationToken) {
        sendTokenToBackend(verificationToken);
        return true;
      }
      return false;
    };
    
    // Check if we're returning from Truecaller
    const isReturningFromTruecaller = sessionStorage.getItem('truecaller_in_progress');
    if (isReturningFromTruecaller) {
      sessionStorage.removeItem('truecaller_in_progress');
      
      setTimeout(() => {
        const handled = checkUrlForToken();
        if (!handled) {
          setLoading(false);
          alert("No verification data received from Truecaller. Please try again.");
        }
      }, 1000);
    }
    
    window.addEventListener('message', handleTruecallerResponse);
    
    return () => {
      window.removeEventListener('message', handleTruecallerResponse);
    };
  }, []);

  const sendTokenToBackend = async (token) => {
    setLoading(true);
    
    try {
      console.log("Sending token to backend:", token.substring(0, 50) + "...");
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/truecaller/verify`, {
        verificationToken: token,
        sourceWebsite: 'cleartitle1'
      });
      
      console.log("Backend response:", response.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (onFetchUser) {
          onFetchUser(response.data.user);
        }
        
        window.location.href = '/profile';
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Backend error:", error);
      console.error("Error details:", error.response?.data);
      alert(error.response?.data?.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleTruecaller = () => {
    setLoading(true);
    
    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    sessionStorage.setItem('truecaller_in_progress', 'true');
    sessionStorage.setItem('truecaller_nonce', requestNonce);
    
    const tcUrl = `truecallersdk://truesdk/web_verify?` +
      `type=btmsheet` +
      `&requestNonce=${requestNonce}` +
      `&partnerKey=${partnerKey}` +
      `&partnerName=cleartitle1` +
      `&lang=en`;
    
    console.log("Launching Truecaller with URL:", tcUrl);
    window.location.href = tcUrl;
    
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        sessionStorage.removeItem('truecaller_in_progress');
        alert("Truecaller didn't respond. Please make sure:\n1. Truecaller app is installed\n2. You have internet connection\n3. Try again");
      }
    }, 20000);
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