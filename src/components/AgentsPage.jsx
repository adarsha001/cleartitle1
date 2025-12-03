import { useEffect, useState } from "react";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "../api/agentApi";
import AgentForm from "../components/AgentForm";
import { 
  User, Phone, Mail, Building, MapPin, Globe, 
  Edit, Trash2, ChevronDown, ChevronUp, X,
  MessageSquare, Calendar, Star, CheckCircle
} from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await getAgents(page, search);
      setAgents(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error("Error fetching agents:", error);
      alert("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, search]);

  const handleAdd = async (data) => {
    try {
      await createAgent(data);
      setOpenForm(false);
      fetchAgents();
      alert("Agent added successfully!");
    } catch (error) {
      console.error("Error adding agent:", error);
      alert("Failed to add agent");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateAgent(editData._id, data);
      setEditData(null);
      setOpenForm(false);
      fetchAgents();
      alert("Agent updated successfully!");
    } catch (error) {
      console.error("Error updating agent:", error);
      alert("Failed to update agent");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id);
        fetchAgents();
        alert("Agent deleted successfully!");
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert("Failed to delete agent");
      }
    }
  };

  const toggleAgentDetails = (agentId) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(agentId);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "Not provided";
    // Format Indian phone numbers
    if (phone.startsWith("+91")) {
      return phone.replace("+91", "0");
    }
    return phone;
  };

  const renderAgentCard = (agent) => {
    const isExpanded = expandedAgent === agent._id;
    
    return (
      <div key={agent._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        {/* Agent Summary - Always visible */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleAgentDetails(agent._id)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{agent.name}</h3>
                  {agent.company && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {agent.company}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700">{formatPhone(agent.phoneNumber)}</span>
                </div>
                {agent.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700 truncate">{agent.email}</span>
                  </div>
                )}
                {agent.languages && agent.languages.length > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Globe className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">{agent.languages.length} languages</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expand/Collapse Button */}
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button className="text-gray-500 hover:text-gray-700">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Agent Details - Expandable */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            {/* Languages */}
            {agent.languages && agent.languages.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Languages Known
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agent.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Primary Phone</p>
                      <p className="font-medium">{agent.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                  {agent.alternativePhoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Alternative Phone</p>
                        <p className="font-medium">{agent.alternativePhoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {agent.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{agent.email}</p>
                      </div>
                    </div>
                  )}
                  {agent.officeAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Office Address</p>
                        <p className="font-medium">{agent.officeAddress.street || "Not specified"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            {agent.company && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Details
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{agent.company}</p>
                  {agent.officeAddress && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{agent.officeAddress.street}</p>
                      <p>{agent.officeAddress.city}, {agent.officeAddress.state} - {agent.officeAddress.pincode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditData(agent);
                  setOpenForm(true);
                  setExpandedAgent(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Agent
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(agent._id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Agent
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons - Collapsed View */}
        {!isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditData(agent);
                  setOpenForm(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="sm:hidden">Edit</span>
                <span className="hidden sm:inline">Edit Agent</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(agent._id);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sm:hidden">Delete</span>
                <span className="hidden sm:inline">Delete Agent</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agents Management</h1>
              <p className="text-gray-600 mt-1">Manage your real estate agents and their details</p>
            </div>
            <button
              onClick={() => setOpenForm(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto"
            >
              <User className="w-5 h-5" />
              <span>Add New Agent</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents by name, company, phone, or email..."
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-2xl font-bold text-blue-600">{agents.length}</p>
            <p className="text-sm text-gray-600">Total Agents</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.languages && a.languages.length > 0).length}
            </p>
            <p className="text-sm text-gray-600">With Languages</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-2xl font-bold text-purple-600">
              {agents.filter(a => a.company).length}
            </p>
            <p className="text-sm text-gray-600">With Company</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-2xl font-bold text-orange-600">
              {agents.filter(a => a.email).length}
            </p>
            <p className="text-sm text-gray-600">With Email</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading agents...</p>
          </div>
        )}

        {/* Agents List - Mobile Cards View */}
        <div className="md:hidden">
          {!loading && agents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
              <p className="text-gray-600 mt-1">Try adjusting your search or add a new agent</p>
            </div>
          ) : (
            agents.map(renderAgentCard)
          )}
        </div>

        {/* Agents Table - Desktop View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {!loading && agents.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
              <p className="text-gray-600 mt-1">Try adjusting your search or add a new agent</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">Agent</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Contact</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Company</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Languages</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr 
                        key={agent._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleAgentDetails(agent._id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{agent.name}</p>
                              <p className="text-sm text-gray-500">
                                {agent.alternativePhoneNumber ? "2 phones" : "1 phone"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium">{formatPhone(agent.phoneNumber)}</p>
                            {agent.email && (
                              <p className="text-sm text-gray-600">{agent.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {agent.company ? (
                            <div>
                              <p className="font-medium">{agent.company}</p>
                              {agent.officeAddress?.city && (
                                <p className="text-sm text-gray-500">{agent.officeAddress.city}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="p-4">
                          {agent.languages && agent.languages.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {agent.languages.slice(0, 2).map((lang, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {lang}
                                </span>
                              ))}
                              {agent.languages.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{agent.languages.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditData(agent);
                                setOpenForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(agent._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {agents.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {agents.length} agent{agents.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {openForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editData ? 'Edit Agent' : 'Add New Agent'}
                  </h2>
                  <button
                    onClick={() => {
                      setOpenForm(false);
                      setEditData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <AgentForm
                  onSubmit={editData ? handleUpdate : handleAdd}
                  onClose={() => {
                    setOpenForm(false);
                    setEditData(null);
                  }}
                  initialData={editData}
                />
              </div>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
}