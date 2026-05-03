// components/agent/AgentPromptDialog.jsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, SparklesIcon, GiftIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AgentPromptDialog = ({ isOpen, onClose, onConfirm }) => {
  const benefits = [
    {
      icon: GiftIcon,
      title: 'Earn Rewards',
      description: 'Get ₹100 for every agent you refer and 5% commission on property deals'
    },
    {
      icon: UsersIcon,
      title: 'Build Network',
      description: 'Connect with other agents and grow your professional network'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Performance',
      description: 'Access detailed analytics and insights about your referrals'
    }
  ];

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                    Become a Real Estate Agent
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600">
                    Great choice! As an agent, you'll get access to exclusive features and earning opportunities.
                  </p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                        <div className="flex justify-center mb-3">
                          <benefit.icon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                        <p className="text-xs text-gray-600">{benefit.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚡ One-time setup: You'll get a unique referral code and agent ID. This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Not Now
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Yes, Become Agent
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
};

export default AgentPromptDialog;