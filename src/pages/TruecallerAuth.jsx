

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const TruecallerLogin = () => {
  const [loading, setLoading] = useState(false);
  const pollingInterval = useRef(null);

  const startPolling = (requestId) => {
    setLoading(true);
    
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await axios.get(`https://saimr-backend-1.onrender.com/api/auth/truecaller/status/${requestId}`);
        
        if (response.data.status === "complete") {
          clearInterval(pollingInterval.current);
          setLoading(false);
          
          if (response.data.success) {
            // LOGIN SUCCESS: Save token and redirect
            localStorage.setItem('token', response.data.token);
            window.location.href = "/dashboard"; 
          } else {
            alert(response.data.error || "Login Failed");
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000); // Check every 2 seconds
  };

  const handleLogin = () => {
    const requestId = uuidv4();
    
    // 1. Trigger Truecaller
    const tcUrl = `truecallersdk://truesdk/web_verify?type=btmsheet&requestNonce=${requestId}&partnerKey=MfIGp766770c7f5bd44ebaceb278acf625704&partnerName=cleartitle1&lang=en&privacyUrl=https://cleartitle1.com/privacy&termsUrl=https://cleartitle1.com/terms&ctaColor=%230087FF&ctaTextColor=%23ffffff&btnShape=round&ttl=600000`;
    
    window.location.href = tcUrl;

    // 2. Start checking if the backend received the callback
    startPolling(requestId);

    // Stop polling after 2 minutes (timeout) to save resources
    setTimeout(() => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        setLoading(false);
      }
    }, 120000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(pollingInterval.current);
  }, []);

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}       style={{ padding: '10px 20px', backgroundColor: '#0087FF', color: '#fff', border: 'none', borderRadius: '5px' }}>
        {loading ? "Verifying..." : "Login with Truecaller"}
      </button>
    </div>
  );
};

export default TruecallerLogin;