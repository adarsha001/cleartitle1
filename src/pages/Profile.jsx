// Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { checkAgentStatus, getAgentDashboard, applyForAgent } from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Edit, Home, MessageSquare, TrendingUp, UserPlus, Gift } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import EditProfileForm from './EditProfileForm';
import EnquiriesList from './EnquiriesList';
import MyProperties from '../components/MyProperties.jsx';
import AgentApplicationModal from '../components/agent/AgentApplicationModal';
import AgentDashboard from '../components/agent/AgentDashboard';

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
  
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await API.get('/users/profile');
        setUserData(profileResponse.data.user);
        await checkAgentStatusHandler();
        
        // Check if user is agent but hasn't completed registration
        if (profileResponse.data.user.userType === 'agent' && !hasAgentProfile) {
          setShowCompleteRegistration(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
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
        const profileResponse = await API.get('/users/profile');
        setUserData(profileResponse.data.user);
        updateUser(profileResponse.data.user);
        
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!userData) return <div className="min-h-screen flex items-center justify-center text-red-600">Error loading profile</div>;

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
              <button
                onClick={() => setShowAgentModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Complete Registration
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
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" /> My Properties
            </button>
            <button
              onClick={() => { setActiveTab('enquiries'); setIsEditing(false); }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'enquiries' && !isEditing
                  ? 'border-blue-900 text-blue-900'
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
                    ? 'border-blue-900 text-blue-900'
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
                  ? 'border-blue-900 text-blue-900'
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
    </div>
  );
}