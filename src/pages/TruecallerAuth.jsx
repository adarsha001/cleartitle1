import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import axios from 'axios';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);

  const handleTruecaller = () => {
    setLoading(true);
    
    // 1. Configuration constants
    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704"; // Get from Truecaller Dashboard
    const nonce = Math.random().toString(36).substring(7);
    
    // 2. The Deep Link URL
    // Note: Use your actual production URL for privacy/terms
    const tcUrl = `truecallersdk://truesdk/web_verify?type=btmsheet&requestNonce=${nonce}&partnerKey=${partnerKey}&partnerName=cleartitle1&lang=en&skipGui=true`;

    // 3. Attempt to open Truecaller
    window.location.href = tcUrl;

    // 4. Fallback if app isn't installed
    setTimeout(() => {
      if (document.hasFocus()) {
        setLoading(false);
        alert("Truecaller app not found. Please login manually.");
      }
    }, 2500);
  };

  return (
    <button
      onClick={handleTruecaller}
      disabled={loading}
      className="w-full bg-[#0087ff] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0070d5] transition-all"
    >
      <Phone size={20} />
      {loading ? "Opening Truecaller..." : "Verify with Truecaller"}
    </button>
  );
};

export default TruecallerAuth;