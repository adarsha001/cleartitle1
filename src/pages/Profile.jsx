// Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { checkAgentStatus, getAgentDashboard, applyForAgent } from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Edit, Home, MessageSquare, TrendingUp, UserPlus, Gift, X } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import EditProfileForm from './EditProfileForm';
import EnquiriesList from './EnquiriesList';
import MyProperties from '../components/MyProperties.jsx';
import AgentApplicationModal from '../components/agent/AgentApplicationModal';
import AgentDashboard from '../components/agent/AgentDashboard';
import ReferralCodeInput from './ReferralCodeInput';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [userEnquiries, setUserEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posted');
  const [isEditing, setIsEditing] = useState(false);
  
  // Agent states
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [hasAgentProfile, setHasAgentProfile] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [isApplyingForAgent, setIsApplyingForAgent] = useState(false);
  const [agentStats, setAgentStats] = useState(null);
  const [showCompleteRegistration, setShowCompleteRegistration] = useState(false);
  
  // Referral states
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState(null);
  
  const navigate = useNavigate();
  const { updateUser, logout, user } = useAuth();

  const fetchUserProfile = async () => {
    try {
      const profileResponse = await API.get('/users/profile');
      setUserData(profileResponse.data.user);
      updateUser(profileResponse.data.user);
      return profileResponse.data.user;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Modal Referral Component with proper user ID handling
  const ModalReferral = () => {
    if (!showReferralModal) return null;
    
    // Get the current user ID
    const currentUserId = userData?._id || user?.id;
    
    // Debug log
    console.log('ModalReferral - Current User ID:', currentUserId);
    console.log('ModalReferral - userData:', userData);
    
    if (!currentUserId) {
      return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl w-full bg-red-500/20 rounded-xl p-6 border border-red-500">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Unable to Load Referral</h3>
              <p className="text-white/70">User information not found. Please refresh the page and try again.</p>
              <button
                onClick={() => setShowReferralModal(false)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-2xl w-full">
          <button
            onClick={() => setShowReferralModal(false)}
            className="absolute -top-10 right-0 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <ReferralCodeInput
            userId={currentUserId}
            onReferralApplied={async (agent) => {
              setShowReferralModal(false);
              setReferralSuccess(agent);
              // Refresh user data to update referral info
              await fetchUserProfile();
              // Auto-hide success message after 5 seconds
              setTimeout(() => setReferralSuccess(null), 5000);
            }}
            onSkip={() => setShowReferralModal(false)}
            isRequired={false}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileResponse = await API.get('/users/profile');
        const user = profileResponse.data.user;
        setUserData(user);
        
        // Check agent status
        await checkAgentStatusHandler();
        
        // Check if user is agent but hasn't completed registration
        if (user.userType === 'agent' && !hasAgentProfile) {
          setShowCompleteRegistration(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'enquiries') fetchUserEnquiries();
    if (activeTab === 'agent-dashboard' && hasAgentProfile) fetchAgentDashboardHandler();
  }, [activeTab, hasAgentProfile]);

  const checkAgentStatusHandler = async () => {
    try {
      const response = await checkAgentStatus();
      if (response.data.hasAgentProfile) {
        setHasAgentProfile(true);
        setAgentData(response.data.data);
        setShowCompleteRegistration(false);
      }
    } catch (error) {
      console.error('Error checking agent status:', error);
    }
  };

  const fetchAgentDashboardHandler = async () => {
    try {
      const response = await getAgentDashboard();
      if (response.data.success) {
        setAgentStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching agent dashboard:', error);
    }
  };

  const fetchUserEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const response = await API.get('/users/my-enquiries');
      setUserEnquiries(response.data.enquiries || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setUserEnquiries([]);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  const handleDeleteEnquiry = (enquiryId) => {
    setUserEnquiries(prev => prev.filter(e => e._id !== enquiryId));
  };

  const handleSaveProfile = async (updateData) => {
    try {
      const response = await API.put('/users/profile', updateData);
      if (response.data.success) {
        setUserData(response.data.user);
        updateUser(response.data.user);
        
        // If password was updated, show message and optionally logout
        if (response.data.passwordUpdated) {
          alert('Password changed successfully! Please login again.');
          logout();
          navigate('/login');
          return;
        }
        
        // Check if user type changed to agent and needs registration
        if (response.data.user.userType === 'agent' && !hasAgentProfile) {
          setShowCompleteRegistration(true);
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleAgentApplication = async (referralCode) => {
    setIsApplyingForAgent(true);
    try {
      const response = await applyForAgent(referralCode);
      
      if (response.data.success) {
        setHasAgentProfile(true);
        setAgentData(response.data.data);
        setShowCompleteRegistration(false);
        
        // Refresh user data to get updated agent profile reference
        const updatedUser = await fetchUserProfile();
        
        setTimeout(() => {
          setShowAgentModal(false);
          setActiveTab('agent-dashboard');
          fetchAgentDashboardHandler();
        }, 2000);
        
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Error applying for agent:', error);
      alert(error.response?.data?.message || 'Error creating agent profile');
      return { success: false };
    } finally {
      setIsApplyingForAgent(false);
    }
  };

  const copyReferralCode = () => {
    if (agentData?.referralCode) {
      navigator.clipboard.writeText(agentData.referralCode);
      alert('Referral code copied!');
    }
  };

  const copyReferralLink = () => {
    if (agentData?.referralCode) {
      const link = `${window.location.origin}/register?ref=${agentData.referralCode}`;
      navigator.clipboard.writeText(link);
      alert('Referral link copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-4">There was an error loading your profile information.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Referral Success Toast */}
        {referralSuccess && (
          <div className="fixed top-24 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span>Successfully referred by {referralSuccess.name}!</span>
            </div>
          </div>
        )}

        <ProfileHeader 
          userData={userData}
          avatarPreview={userData?.avatar}
          isEditing={isEditing}
          activeTab={activeTab}
          onEditClick={() => { setIsEditing(true); setActiveTab('edit'); }}
          onNavigateBack={navigate}
          showCompleteRegistration={showCompleteRegistration}
          onCompleteRegistration={() => setShowAgentModal(true)}
        />

        {/* Completion Registration Banner */}
        {showCompleteRegistration && userData.userType === 'agent' && !hasAgentProfile && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Complete Your Agent Registration</h4>
                  <p className="text-sm text-gray-600">Get your unique referral code and start earning rewards!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAgentModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Complete Registration
                </button>
                <button
                  onClick={() => setShowReferralModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Add Referral Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referral Section for Regular Users (Non-Agents) */}
        {userData.userType !== 'agent' && !hasAgentProfile && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Have a Referral Code?</h4>
                  <p className="text-sm text-gray-600">Enter a referral code to get special benefits!</p>
                </div>
              </div>
              <button
                onClick={() => setShowReferralModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Add Referral Code
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
            <button
              onClick={() => { setActiveTab('posted'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'posted' && !isEditing
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" /> My Properties
            </button>
            <button
              onClick={() => { setActiveTab('enquiries'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'enquiries' && !isEditing
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> My Enquiries
            </button>
            {hasAgentProfile && (
              <button
                onClick={() => { setActiveTab('agent-dashboard'); setIsEditing(false); }}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'agent-dashboard' && !isEditing
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Agent Dashboard
              </button>
            )}
            <button
              onClick={() => { setActiveTab('edit'); setIsEditing(true); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'edit' && isEditing
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {activeTab === 'posted' && !isEditing && <MyProperties />}
          
          {activeTab === 'enquiries' && !isEditing && (
            <EnquiriesList 
              enquiries={userEnquiries}
              onDelete={handleDeleteEnquiry}
              loading={enquiriesLoading}
            />
          )}
          
          {activeTab === 'agent-dashboard' && !isEditing && hasAgentProfile && (
            <AgentDashboard
              agentData={agentData}
              agentStats={agentStats}
              onCopyCode={copyReferralCode}
              onCopyLink={copyReferralLink}
            />
          )}
          
          {activeTab === 'edit' && isEditing && (
            <EditProfileForm 
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={() => { setIsEditing(false); setActiveTab('posted'); }}
            />
          )}
        </div>
      </div>

      {/* Agent Application Modal */}
      <AgentApplicationModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSubmit={handleAgentApplication}
        isLoading={isApplyingForAgent}
      />

      {/* Referral Code Modal */}
      <ModalReferral />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}