// src/components/agent/AgentReferralSection.jsx
import { Gift, Share2, Copy } from 'lucide-react';

const AgentReferralSection = ({ referralCode, onCopyCode, onCopyLink }) => {
  const generateReferralLink = (code) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  };

  const referralLink = referralCode ? generateReferralLink(referralCode) : '';

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      onCopyCode?.();
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      onCopyLink?.();
    }
  };

  if (!referralCode) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-purple-600" />
        Your Referral Program
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Code</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-purple-200 font-mono text-lg font-bold text-purple-600">
              {referralCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Link</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-purple-200 text-sm truncate">
              {referralLink}
            </code>
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentReferralSection;