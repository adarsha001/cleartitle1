import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const TruecallerLogin = () => {
  const [loading, setLoading] = useState(false);
  const pollingInterval = useRef(null);
  const navigate = useNavigate();

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
            navigate("/");
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
    <div className="">

 
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-200 transform
            flex items-center justify-center space-x-2
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
              </svg>
              <span>Login with Truecaller</span>
            </>
          )}
        </button>
        
     
      </div>

  );
};

export default TruecallerLogin;