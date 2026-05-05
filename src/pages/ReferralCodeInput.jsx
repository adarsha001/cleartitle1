// components/ReferralCodeInput.jsx
import { useState, useEffect } from 'react';
import { Gift, Search, CheckCircle, AlertCircle, X, UserPlus, Star, Award, Shield, Lock, User, Mail, Phone } from 'lucide-react';
import referralAPI from '../api/referralAPI';

const ReferralCodeInput = ({ 
  userId,
  onReferralApplied, 
  onSkip, 
  isRequired = false,
  className = '' 
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agentInfo, setAgentInfo] = useState(null);
  const [hasReferral, setHasReferral] = useState(false);
  const [existingReferral, setExistingReferral] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      checkExistingReferral();
    }
  }, [userId]);

  const checkExistingReferral = async () => {
    try {
      const result = await referralAPI.checkReferralStatus(userId);
      if (result.success && result.hasReferral) {
        setHasReferral(true);
        setExistingReferral(result.referralInfo);
      }
    } catch (err) {
      console.error('Error checking referral status:', err);
    }
  };

  const handleSearch = async () => {
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }
    
    if (hasReferral) {
      setError('You have already used a referral code. Only one referral is allowed per user.');
      return;
    }

    if (!userId) {
      setError('User not logged in. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAgentInfo(null);
    
    try {
      const result = await referralAPI.searchAgentByReferralCode(referralCode);
      if (result.success && result.agent) {
        setAgentInfo(result.agent);
      }
    } catch (err) {
      setError(err.message || 'Invalid referral code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyReferral = async () => {
    if (!userId) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    if (hasReferral) {
      setError('You have already used a referral code.');
      return;
    }

    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await referralAPI.applyReferral(userId, referralCode);
      
      if (result.success) {
        setSuccess(`Successfully applied referral code! You've been referred by ${result.agent.name}`);
        setHasReferral(true);
        setExistingReferral({
          agentName: result.agent.name,
          agentCode: result.agent.referralCode,
          appliedAt: new Date().toISOString()
        });
        
        setReferralCode('');
        setAgentInfo(null);
        setShowConfirmDialog(false);
        
        if (onReferralApplied) {
          onReferralApplied(result.agent);
        }
      }
    } catch (err) {
      console.error('Apply referral error:', err);
      setError(err.message || 'Failed to apply referral code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!agentInfo) {
      setError('Please search for a valid referral code first');
      return;
    }
    if (!userId) {
      setError('User not authenticated. Please refresh the page.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
  };

  // If user already has a referral
  if (hasReferral && existingReferral) {
    return (
      <div className={`bg-green-50 rounded-xl p-6 border border-green-200 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Referral Already Applied</h3>
            <p className="text-gray-600 text-sm mb-3">
              You've already been referred by <span className="text-green-600 font-semibold">{existingReferral.agentName}</span>
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Referral Code:</span> {existingReferral.agentCode}<br/>
                <span className="font-semibold">Applied on:</span> {new Date(existingReferral.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Only one referral code can be used per account for security purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">Have a Referral Code?</h3>
          <p className="text-gray-500 text-sm mt-1">
            Enter a referral code to get special benefits and rewards
          </p>
        </div>
        {!isRequired && (
          <button 
            onClick={handleSkip} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
          <button 
            onClick={() => setSuccess('')} 
            className="text-green-500/70 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError('')} 
            className="text-red-500/70 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code (e.g., AG06K6RX176814)"
              disabled={isLoading || hasReferral}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !referralCode.trim() || hasReferral || !userId}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 font-medium text-white"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Verify'}
          </button>
        </div>

        {/* Agent Details Preview */}
        {agentInfo && !hasReferral && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{agentInfo.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-600 flex items-center gap-1">⭐ {agentInfo.ratings?.average || 4.5}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{agentInfo.referralCount || 0} referrals</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Award className="w-3 h-3 text-green-600" />
                    <span>{agentInfo.rewards || 0} rewards earned</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>Verified Agent</span>
                  </div>
                </div>
                {agentInfo.email && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />
                    <span>{agentInfo.email}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleApplyClick}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p>Each user can only use one referral code. This helps prevent abuse and ensures fair reward distribution.</p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && agentInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Referral</h3>
            <p className="text-gray-600 mb-4">
              You are about to apply the referral code from <span className="text-blue-600 font-semibold">{agentInfo.name}</span>.
            </p>
            <div className="bg-yellow-50 rounded-lg p-3 mb-6 border border-yellow-200">
              <p className="text-sm text-yellow-700">
                ⚠️ <span className="font-semibold">Note:</span> This action cannot be undone. Each user can only use one referral code.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyReferral}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReferralCodeInput;