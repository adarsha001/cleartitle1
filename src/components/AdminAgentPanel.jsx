// src/components/AdminAgentPanel.jsx
import React, { useState, useEffect } from 'react';
import { adminAgentService } from '../api/adminAgentService';

const AdminAgentPanel = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('applications');
  
  // State for applications
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [appFilters, setAppFilters] = useState({
    status: 'pending',
    page: 1,
    limit: 10,
    search: ''
  });
  const [appPagination, setAppPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('agentId');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // State for stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    total: 0
  });
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalAction, setModalAction] = useState('approve');
  const [modalForm, setModalForm] = useState({
    licenseNumber: '',
    experienceYears: '',
    specializationAreas: [],
    rejectionReason: '',
    reason: '',
    notes: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setAppLoading(true);
      const response = await adminAgentService.getAgentApplications(appFilters);
      setApplications(response.agents || []);
      setAppPagination({
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setAppLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await adminAgentService.getAgentStats();
      setStats(response.stats || {
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        total: 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [appFilters]);

  // Refresh data
  const refreshData = () => {
    fetchApplications();
    fetchStats();
  };

  // Handle application actions
  const handleActionClick = (agent, action) => {
    setSelectedAgent(agent);
    setModalAction(action);
    setModalForm({
      licenseNumber: '',
      experienceYears: '',
      specializationAreas: [],
      rejectionReason: '',
      reason: '',
      notes: ''
    });
    setShowModal(true);
  };

  // Handle application search
  const handleAppSearch = (e) => {
    setAppFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setAppFilters(prev => ({ ...prev, status, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setAppFilters(prev => ({ ...prev, page }));
  };

  // Handle agent search
  const handleAgentSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError('');
      
      let params = {};
      
      switch (searchBy) {
        case 'agentId':
          // Search by exact agentId
          const agentResponse = await adminAgentService.getAgentById(searchTerm);
          if (agentResponse.agent) {
            setSearchResults([agentResponse.agent]);
          } else {
            setSearchResults([]);
          }
          break;
          
        case 'email':
        case 'phone':
        case 'name':
        case 'company':
          params[searchBy] = searchTerm;
          const searchResponse = await adminAgentService.searchAgents(params);
          setSearchResults(searchResponse.agents || []);
          break;
          
        default:
          break;
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle modal action submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      switch (modalAction) {
        case 'approve':
          await adminAgentService.approveAgent(selectedAgent._id, {
            licenseNumber: modalForm.licenseNumber,
            experienceYears: parseInt(modalForm.experienceYears) || 0,
            specializationAreas: modalForm.specializationAreas,
            notes: modalForm.notes
          });
          break;

        case 'reject':
          if (!modalForm.rejectionReason.trim()) {
            throw new Error('Rejection reason is required');
          }
          await adminAgentService.rejectAgent(selectedAgent._id, {
            rejectionReason: modalForm.rejectionReason,
            notes: modalForm.notes
          });
          break;

        case 'suspend':
          if (!modalForm.reason.trim()) {
            throw new Error('Suspension reason is required');
          }
          await adminAgentService.suspendAgent(selectedAgent._id, {
            reason: modalForm.reason,
            notes: modalForm.notes
          });
          break;

        case 'reactivate':
          await adminAgentService.reactivateAgent(selectedAgent._id, {
            notes: modalForm.notes
          });
          break;

        case 'pending':
          await adminAgentService.setAgentToPending(selectedAgent._id, modalForm.notes);
          break;

        default:
          break;
      }

      // Refresh data and close modal
      refreshData();
      setShowModal(false);
      setSelectedAgent(null);
    } catch (err) {
      setModalError(err.message || 'Action failed');
    } finally {
      setModalLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get modal config
  const getModalConfig = () => {
    switch (modalAction) {
      case 'approve':
        return {
          title: 'Approve Agent',
          buttonText: 'Approve Agent',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          description: 'Approve this agent and create their professional profile.',
        };
      case 'reject':
        return {
          title: 'Reject Agent Application',
          buttonText: 'Reject Application',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          description: 'Reject this agent application with a reason.',
        };
      case 'suspend':
        return {
          title: 'Suspend Agent',
          buttonText: 'Suspend Agent',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          description: 'Temporarily suspend this agent.',
        };
      case 'reactivate':
        return {
          title: 'Reactivate Agent',
          buttonText: 'Reactivate Agent',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          description: 'Reactivate this suspended agent.',
        };
      case 'pending':
        return {
          title: 'Set to Pending',
          buttonText: 'Set to Pending',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          description: 'Move this agent back to pending status.',
        };
      default:
        return {
          title: 'Action',
          buttonText: 'Confirm',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          description: '',
        };
    }
  };

  const modalConfig = getModalConfig();

  // Stat cards data
  const statCards = [
    {
      title: 'Pending',
      value: stats.pending,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: '⏳',
    },
    {
      title: 'Approved',
      value: stats.approved,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: '❌',
    },
    {
      title: 'Suspended',
      value: stats.suspended,
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      icon: '⏸️',
    },
    {
      title: 'Total Agents',
      value: stats.total,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: '👥',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Management Panel</h1>
        <p className="text-gray-600 mt-2">Manage agent registrations and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className={`${stat.bgColor} rounded-lg p-6 shadow`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.textColor} mr-4 text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications
              {stats.pending > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Search Agents
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex space-x-2">
                {['pending', 'approved', 'rejected', 'suspended'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full capitalize ${
                      appFilters.status === status
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={appFilters.search}
                  onChange={handleAppSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Applications List */}
            {appLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-4xl">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">There are no agent applications with the current filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((agent) => (
                        <tr key={agent._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {agent.avatar ? (
                                  <img className="h-10 w-10 rounded-full" src={agent.avatar} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-800 font-medium">
                                      {agent.name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {agent.name} {agent.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{agent.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{agent.gmail}</div>
                            <div className="text-sm text-gray-500">{agent.phoneNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(agent.agentApproval?.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(agent.agentApproval?.status)}`}>
                              {agent.agentApproval?.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {agent.agentApproval?.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleActionClick(agent, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleActionClick(agent, 'reject')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {agent.agentApproval?.status === 'approved' && (
                                <button
                                  onClick={() => handleActionClick(agent, 'suspend')}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  Suspend
                                </button>
                              )}
                              {agent.agentApproval?.status === 'suspended' && (
                                <button
                                  onClick={() => handleActionClick(agent, 'reactivate')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Reactivate
                                </button>
                              )}
                              {agent.agentApproval?.status === 'rejected' && (
                                <button
                                  onClick={() => handleActionClick(agent, 'pending')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Set Pending
                                </button>
                              )}
                              <button className="text-blue-600 hover:text-blue-900">
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {appPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(appPagination.currentPage - 1)}
                        disabled={appPagination.currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(appPagination.currentPage + 1)}
                        disabled={appPagination.currentPage === appPagination.totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(appFilters.page - 1) * appFilters.limit + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(appFilters.page * appFilters.limit, appPagination.total)}
                          </span>{' '}
                          of <span className="font-medium">{appPagination.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          {[...Array(appPagination.totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                appPagination.currentPage === i + 1
                                  ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-6">
            {/* Search Form */}
            <div className="mb-8">
              <form onSubmit={handleAgentSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <label htmlFor="searchBy" className="block text-sm font-medium text-gray-700 mb-1">
                      Search By
                    </label>
                    <select
                      id="searchBy"
                      value={searchBy}
                      onChange={(e) => setSearchBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="agentId">Agent ID</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone Number</option>
                      <option value="name">Name</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                  <div className="flex-2">
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                      Search Term
                    </label>
                    <input
                      type="text"
                      id="searchTerm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={`Enter ${searchBy === 'agentId' ? 'Agent ID (e.g., cleartitle100001)' : searchBy}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="self-end">
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
                {searchError && (
                  <div className="text-red-600 text-sm">{searchError}</div>
                )}
              </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name & Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((agent) => (
                      <tr key={agent._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.agentId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                          <div className="text-sm text-gray-500">{agent.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(agent.user?.agentApproval?.status)}`}>
                            {agent.user?.agentApproval?.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {agent.user?.agentApproval?.status === 'approved' && (
                              <button
                                onClick={() => handleActionClick(agent.user, 'suspend')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Suspend
                              </button>
                            )}
                            {agent.user?.agentApproval?.status === 'suspended' && (
                              <button
                                onClick={() => handleActionClick(agent.user, 'reactivate')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Reactivate
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : searchTerm && !searchLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-4xl">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-500">Try searching with different criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showModal && selectedAgent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalConfig.title}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">{modalConfig.description}</p>
            </div>

            {/* Agent Info */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex-shrink-0">
                  {selectedAgent.avatar ? (
                    <img className="h-12 w-12 rounded-full" src={selectedAgent.avatar} alt="" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-medium text-lg">
                        {selectedAgent.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {selectedAgent.name} {selectedAgent.lastName}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {selectedAgent.gmail} • {selectedAgent.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    Username: @{selectedAgent.username}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="px-6 py-4">
              {modalAction === 'approve' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      License Number (Optional)
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      value={modalForm.licenseNumber}
                      onChange={(e) => setModalForm({ ...modalForm, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter license number if available"
                    />
                  </div>
                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      min="0"
                      value={modalForm.experienceYears}
                      onChange={(e) => setModalForm({ ...modalForm, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div>
                    <label htmlFor="specializationAreas" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization Areas (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="specializationAreas"
                      value={modalForm.specializationAreas.join(', ')}
                      onChange={(e) => setModalForm({ 
                        ...modalForm, 
                        specializationAreas: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Residential, Commercial, Luxury"
                    />
                  </div>
                </div>
              )}

              {(modalAction === 'reject' || modalAction === 'suspend') && (
                <div className="mb-6">
                  <label htmlFor={modalAction === 'reject' ? 'rejectionReason' : 'reason'} className="block text-sm font-medium text-gray-700 mb-1">
                    {modalAction === 'reject' ? 'Rejection Reason' : 'Suspension Reason'} *
                  </label>
                  <textarea
                    id={modalAction === 'reject' ? 'rejectionReason' : 'reason'}
                    value={modalAction === 'reject' ? modalForm.rejectionReason : modalForm.reason}
                    onChange={(e) => setModalForm({ 
                      ...modalForm, 
                      [modalAction === 'reject' ? 'rejectionReason' : 'reason']: e.target.value 
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${modalAction === 'reject' ? 'rejection' : 'suspension'} reason...`}
                    required
                  />
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{modalError}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${modalConfig.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Processing...' : modalConfig.buttonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentPanel;