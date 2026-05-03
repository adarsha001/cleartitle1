// components/agent/AgentApplicationModal.jsx
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckCircleIcon, GiftIcon, UserGroupIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const AgentApplicationModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [referralCode, setReferralCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [agentData, setAgentData] = useState(null);

  const generateReferralLink = (code) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send empty string if no referral code (not null)
    const result = await onSubmit(referralCode || '');
    if (result && result.success) {
      setAgentData(result.data);
      setShowSuccess(true);
    }
  };

  const handleCopyLink = () => {
    if (agentData?.referralCode) {
      const link = generateReferralLink(agentData.referralCode);
      navigator.clipboard.writeText(link);
      alert('Referral link copied to clipboard!');
    }
  };

  const handleCopyCode = () => {
    if (agentData?.referralCode) {
      navigator.clipboard.writeText(agentData.referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleSkip = () => {
    onSubmit('');
    onClose();
  };

  if (showSuccess) {
    const referralLink = agentData?.referralCode ? generateReferralLink(agentData.referralCode) : '';

    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <Dialog.Title as="h3" className="mt-4 text-lg font-semibold leading-6 text-gray-900">
                      Congratulations! You're Now an Agent
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Your agent ID has been created. Share your referral code with others to earn rewards!
                      </p>
                    </div>

                    {/* Agent ID Display */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Your Agent ID</div>
                      <div className="text-xl font-bold text-blue-600">{agentData?.agentId}</div>
                    </div>

                    {/* Referral Code Display */}
                    <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-left">
                          <div className="text-sm text-gray-600">Your Referral Code</div>
                          <div className="text-2xl font-bold text-purple-600 font-mono">
                            {agentData?.referralCode}
                          </div>
                        </div>
                        <button
                          onClick={handleCopyCode}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="text-left text-sm text-gray-600 mb-2">Share this link</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                          {referralLink}
                        </code>
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>

                    {/* Referral Info */}
                    {agentData?.referredBy && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          🎉 You were referred by <strong>{agentData.referredBy.name}</strong>
                          <br />
                          <span className="text-xs">Agent ID: {agentData.referredBy.agentId}</span>
                        </div>
                      </div>
                    )}

                    {/* Stats Preview */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <GiftIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Rewards</div>
                        <div className="text-lg font-bold text-green-600">₹0</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <UserGroupIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Referrals</div>
                        <div className="text-lg font-bold text-blue-600">0</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setShowSuccess(false);
                          onClose();
                        }}
                      >
                        Continue to Dashboard
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Complete Agent Registration
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <GiftIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Earn Rewards as an Agent!</p>
                        <p>Share your referral code with friends. When they join as agents, you earn ₹100 and 5% commission on property deals!</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        id="referralCode"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="Enter referral code if you have one"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        maxLength="20"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Know another agent? Enter their code to connect and get started!
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Creating...' : 'Complete Registration'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AgentApplicationModal;