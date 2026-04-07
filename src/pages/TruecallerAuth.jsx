import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';

const BACKEND_URL = 'https://saimr-backend-1.onrender.com';

const TruecallerAuth = ({ onFetchUser }) => {
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  // Clean up polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleTruecaller = () => {
    setLoading(true);

    const partnerKey = "MfIGp766770c7f5bd44ebaceb278acf625704";
    const requestNonce = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      `&ttl=30000`;

    window.location.href = tcUrl;

    // Poll backend every 2s for up to 60s
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 2000;
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/truecaller/session/${requestNonce}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ready) {
            clearInterval(pollRef.current);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (onFetchUser) onFetchUser(data.user);
            window.location.href = '/profile';
            return;
          }
        }
      } catch (_) {}

      if (elapsed >= 60000) {
        clearInterval(pollRef.current);
        setLoading(false);
        const useManual = window.confirm("Truecaller app not found. Verify manually?");
        if (useManual) {
          const phone = window.prompt("Enter your phone number:");
          if (phone?.length >= 10) manualVerification(phone);
        }
      }
    }, 2000);
  };

  const manualVerification = async (phoneNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/truecaller/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, sourceWebsite: 'cleartitle1' })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/profile';
      }
    } catch (_) {
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