import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function GoogleLogin() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Google SDK
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          ux_mode: "popup",
          itp_support: true
        });

        // Render Google Sign-In button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              locale: "en"
            }
          );

          // Also display the One Tap UI
          window.google.accounts.id.prompt(notification => {
            if (notification.isNotDisplayed()) {
              console.log('One Tap not displayed:', notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              console.log('One Tap skipped:', notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
              console.log('One Tap dismissed:', notification.getDismissedReason());
            }
          });
        }
      }
    };

    // Load Google SDK script
    const loadGoogleSDK = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        script.onerror = () => {
          console.error("Failed to load Google Sign-In script");
          setError("Google Sign-In is temporarily unavailable");
        };
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    loadGoogleSDK();

    return () => {
      // Cleanup
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await googleLogin(response.credential);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed');
      console.error('Google sign-in error:', err);
      
      // Revoke token on error
      if (window.google && window.google.accounts) {
        window.google.accounts.id.revoke(response.credential, done => {
          console.log('Token revoked due to error');
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manual trigger for Google Sign-In
  const triggerGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is not available. Please refresh the page.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Sign-In Button */}
      <div className="space-y-2">
        <div ref={googleButtonRef} className="google-signin-container"></div>
        
        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-white/70">
              <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
              Signing in with Google...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Google Sign-In Benefits */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-4 h-4"
          />
          Benefits of Google Sign-In
        </h4>
        <ul className="space-y-1 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>One-click login</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Enhanced security</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>No passwords to remember</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Auto email verification</span>
          </li>
        </ul>
      </div>

      {/* Security Info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs text-white/50">
          <Shield className="w-3 h-3" />
          <span>Google Sign-In uses secure OAuth 2.0 protocol</span>
        </div>
      </div>

      {/* Alternative method */}
      <div className="text-center">
        <button
          onClick={triggerGoogleSignIn}
          className="text-yellow-300 text-sm hover:text-yellow-400 transition-colors underline"
        >
          Having trouble with the button? Click here
        </button>
      </div>
    </div>
  );
}