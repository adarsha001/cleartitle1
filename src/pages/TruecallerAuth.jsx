import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import axios from 'axios';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);

  // Set backend URL directly
  const BACKEND_URL = 'https://saimr-backend-1.onrender.com';

  useEffect(() => {
    // CRITICAL: Listen for Truecaller's response
    const handleTruecallerResponse = (event) => {
      console.log("Raw message received:", event.data);
      
      // Truecaller sends data in different formats
      let userData = null;
      
      // Format 1: Direct object
      if (event.data && typeof event.data === 'object') {
        if (event.data.phone_number || event.data.phoneNumber) {
          userData = event.data;
        }
      }
      
      // Format 2: Stringified JSON
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.phone_number || parsed.phoneNumber) {
            userData = parsed;
          }
        } catch (e) {}
      }
      
      // Format 3: Check for Truecaller specific properties
      if (event.data && (event.data.type === 'truecaller_success' || event.data.status === 'success')) {
        userData = event.data.data || event.data;
      }
      
      if (userData) {
        console.log("Truecaller user data:", userData);
        sendToBackend(userData);
      }
    };

    // Check URL for returned data (some Truecaller versions use URL params)
    const checkUrlForData = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const phone = urlParams.get('phone');
      const data = urlParams.get('data');
      
      if (data) {
        try {
          const decoded = JSON.parse(decodeURIComponent(data));
          sendToBackend(decoded);
          return true;
        } catch(e) {}
      }
      
      if (token || phone) {
        sendToBackend({ verificationToken: token, phoneNumber: phone });
        return true;
      }
      
      // Check hash fragment
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get('token');
        if (hashToken) {
          sendToBackend({ verificationToken: hashToken });
          return true;
        }
      }
      
      return false;
    };
    
    // Check if we're returning from Truecaller
    const isReturningFromTruecaller = sessionStorage.getItem('truecaller_in_progress');
    if (isReturningFromTruecaller) {
      sessionStorage.removeItem('truecaller_in_progress');
      
      // Give time for postMessage
      setTimeout(() => {
        const handled = checkUrlForData();
        if (!handled) {
          // If no data found after 2 seconds, maybe user cancelled
          setLoading(false);
        }
      }, 500);
    }
    
    window.addEventListener('message', handleTruecallerResponse);
    
    return () => {
      window.removeEventListener('message', handleTruecallerResponse);
    };
  }, []);

  const sendToBackend = async (userData) => {
    setLoading(true);
    
    try {
      const payload = {
        phoneNumber: userData.phone_number || userData.phoneNumber || userData.mobile,
        firstName: userData.given_name || userData.firstName || userData.name,
        lastName: userData.family_name || userData.lastName,
        email: userData.email,
        verificationToken: userData.token || userData.verificationToken,
        sourceWebsite: 'cleartitle1'
      };
      
      console.log("Sending to backend:", payload);
      
      // Using the Render.com backend URL directly
      const response = await axios.post(`${BACKEND_URL}/api/auth/truecaller/verify`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
      
      // Clean URL if needed
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const handleTruecaller = () => {
    setLoading(true);
    
    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Mark that we're launching Truecaller
    sessionStorage.setItem('truecaller_in_progress', 'true');
    sessionStorage.setItem('truecaller_nonce', requestNonce);
    
    const tcUrl = `truecallersdk://truesdk/web_verify?` +
      `type=btmsheet` +
      `&requestNonce=${requestNonce}` +
      `&partnerKey=${partnerKey}` +
      `&partnerName=cleartitle1` +
      `&lang=en`;
    
    console.log("Launching Truecaller with URL:", tcUrl);
    
    // Launch Truecaller
    window.location.href = tcUrl;
    
    // Fallback timeout (20 seconds)
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