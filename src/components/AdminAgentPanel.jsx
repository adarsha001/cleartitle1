// components/AdminAgentPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Gift, Calendar, TrendingUp, Eye, Phone, Mail, 
  MapPin, Clock, DollarSign, ChevronLeft, ChevronRight,
  Search, X, UserPlus, Star, Award, Shield, AlertCircle,
  CheckCircle, XCircle, User, Building2, Activity,
  RefreshCw, Loader
} from 'lucide-react';
import adminAgentService from '../api/adminAgentService';

const AdminAgentPanel = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalReferrals: 0,
    totalRewards: 0,
    totalAppointments: 0,
    topAgentsByReferrals: [],
    topAgentsByRewards: []
  });
  
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [referredUsers, setReferredUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [agentSummary, setAgentSummary] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAgentService.getAllAgents({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response.success) {
        setAgents(response.agents || []);
        setTotalPages(response.totalPages || 1);
        setTotalAgents(response.total || 0);
      } else {
        setError(response.message || 'Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch global stats
  const fetchStats = async () => {
    try {
      const response = await adminAgentService.getGlobalAgentStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch agent details (summary, referrals, appointments)
  const fetchAgentDetails = async (agentId) => {
    setLoadingDetails(true);
    try {
      // Fetch all data in parallel
      const [summaryRes, usersRes, appointmentsRes] = await Promise.all([
        adminAgentService.getAgentSummary(agentId),
        adminAgentService.getAgentReferredUsers(agentId),
        adminAgentService.getAgentAppointments(agentId)
      ]);
      
      if (summaryRes.success) {
        setSelectedAgent(summaryRes.agent);
        setAgentSummary(summaryRes.agent.stats);
      }
      if (usersRes.success) setReferredUsers(usersRes.referredUsers || []);
      if (appointmentsRes.success) setAppointments(appointmentsRes.appointments || []);
      
    } catch (error) {
      console.error('Error fetching agent details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Update agent status
  const handleStatusToggle = async (agentId, currentStatus) => {
    try {
      const response = await adminAgentService.updateAgentStatus(agentId, {
        isActive: !currentStatus,
        reason: !currentStatus ? 'Activated by admin' : 'Suspended by admin'
      });
      
      if (response.success) {
        fetchAgents();
        if (selectedAgent?.agentId === agentId) {
          fetchAgentDetails(agentId);
        }
        alert(response.message);
      } else {
        alert(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update agent status');
    }
  };

  // View agent details
  const handleViewAgent = async (agent) => {
    setSelectedAgent(agent);
    setShowAgentModal(true);
    setActiveTab('overview');
    await fetchAgentDetails(agent.agentId);
  };

  // Initial load
  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, [currentPage, searchTerm]);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Suspended
        </span>
      );
    }
  };

  const getAppointmentStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-yellow-100 text-yellow-700',
      visited: 'bg-blue-100 text-blue-700',
      interested: 'bg-purple-100 text-purple-700',
      negotiation: 'bg-orange-100 text-orange-700',
      closed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return badges[status] || badges.scheduled;
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className={`p-3 ${color} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );

  if (loading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management Panel</h1>
            <p className="text-gray-600 mt-2">Manage all agents, view their referrals and appointments</p>
          </div>
          <button
            onClick={() => {
              fetchAgents();
              fetchStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Agents" value={stats.totalAgents} icon={Users} color="bg-blue-600" />
        <StatCard title="Total Referrals" value={stats.totalReferrals} icon={UserPlus} color="bg-green-600" />
        <StatCard title="Total Rewards" value={`₹${(stats.totalRewards || 0).toLocaleString()}`} icon={Gift} color="bg-yellow-600" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="bg-purple-600" />
      </div>

      {/* Top Agents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top by Referrals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Agents by Referrals
            </h3>
          </div>
          <div className="p-4">
            {stats.topAgentsByReferrals?.length > 0 ? (
              <div className="space-y-3">
                {stats.topAgentsByReferrals.map((agent, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleViewAgent(agent)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">ID: {agent.agentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{agent.referralCount} referrals</p>
                      <p className="text-xs text-gray-500">₹{agent.rewards?.toLocaleString() || 0} earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No referral data available</p>
            )}
          </div>
        </div>

        {/* Top by Rewards */}
        {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Agents by Rewards
            </h3>
          </div>
          <div className="p-4">
            {stats.topAgentsByRewards?.length > 0 ? (
              <div className="space-y-3">
                {stats.topAgentsByRewards.map((agent, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleViewAgent(agent)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">ID: {agent.agentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">₹{agent.rewards?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{agent.referralCount} referrals</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No rewards data available</p>
            )}
          </div>
        </div> */}
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">All Agents</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, agent ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {agents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No agents found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rewards</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{agent.agentId}</p>
                          </div>
                        </div>
                        </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{agent.email}</div>
                        <div className="text-xs text-gray-500">{agent.phoneNumber}</div>
                        </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600 text-lg">{agent.referralCount || 0}</span>
                        </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-yellow-600">₹{(agent.rewards || 0).toLocaleString()}</span>
                        </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-purple-600 text-lg">{agent.onboardedClients?.length || 0}</span>
                        </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(agent.isActive)}
                        </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewAgent(agent)}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalAgents} total agents)
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Agent Details Modal */}
      {showAgentModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-500 font-mono text-sm">{selectedAgent.agentId}</p>
                      {getStatusBadge(selectedAgent.isActive)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAgentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 bg-gray-50">
              {['overview', 'referrals', 'appointments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium text-sm capitalize border-b-2 transition flex items-center gap-2 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' && <Activity className="w-4 h-4" />}
                  {tab === 'referrals' && <UserPlus className="w-4 h-4" />}
                  {tab === 'appointments' && <Calendar className="w-4 h-4" />}
                  {tab === 'overview' && 'Overview'}
                  {tab === 'referrals' && `Referrals (${referredUsers.length})`}
                  {tab === 'appointments' && `Appointments (${appointments.length})`}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="text-center py-12">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading agent data...</p>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{agentSummary?.totalReferrals || referredUsers.length}</p>
                          <p className="text-sm text-gray-600">Total Referrals</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">₹{(selectedAgent.rewards || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Total Rewards</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-purple-600">{agentSummary?.totalAppointments || appointments.length}</p>
                          <p className="text-sm text-gray-600">Total Appointments</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{agentSummary?.closedAppointments || appointments.filter(a => a.status === 'closed').length}</p>
                          <p className="text-sm text-gray-600">Closed Deals</p>
                        </div>
                      </div>

                      {/* Agent Info */}
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          Agent Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{selectedAgent.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{selectedAgent.phoneNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="font-medium text-gray-900">
                              {selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Referral Code</p>
                            <p className="font-mono text-sm text-gray-900">{selectedAgent.referralCode}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleStatusToggle(selectedAgent.agentId, selectedAgent.isActive)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                            selectedAgent.isActive
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {selectedAgent.isActive ? 'Suspend Agent' : 'Activate Agent'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Referrals Tab */}
                  {activeTab === 'referrals' && (
                    <div>
                      {referredUsers.length === 0 ? (
                        <div className="text-center py-12">
                          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No referrals yet</p>
                          <p className="text-gray-400 text-sm mt-1">This agent hasn't referred any users</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {referredUsers.map((referral, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-bold">
                                    {referral.user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{referral.user?.name || 'Unknown User'}</p>
                                  <p className="text-sm text-gray-500">{referral.user?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  referral.status === 'converted' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {referral.status === 'converted' ? 'Converted' : 'Active'}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">Reward: ₹{referral.rewardAmount}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(referral.referredAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Appointments Tab */}
                  {activeTab === 'appointments' && (
                    <div>
                      {appointments.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No appointments yet</p>
                          <p className="text-gray-400 text-sm mt-1">No property viewing appointments scheduled</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {appointments.map((apt, idx) => (
                            <div key={apt.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    <p className="font-semibold text-gray-900">{apt.property?.title || 'Property'}</p>
                                  </div>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {apt.property?.address}, {apt.property?.city}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Client: {apt.client?.name} ({apt.client?.email})
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusBadge(apt.status)}`}>
                                    {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)}
                                  </span>
                                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-1 justify-end">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(apt.appointmentDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3" />
                                    {apt.appointmentTime}
                                  </p>
                                  {apt.dealValue && (
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                      Deal: ₹{apt.dealValue.toLocaleString()}
                                    </p>
                                  )}
                                  {apt.rewardEarned > 0 && (
                                    <p className="text-xs text-yellow-600">
                                      Reward: ₹{apt.rewardEarned}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {apt.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                                  <p className="text-sm text-gray-700">{apt.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentPanel;