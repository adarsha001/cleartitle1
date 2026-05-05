// src/components/agent/AgentDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { Users, Gift, Calendar, TrendingUp, Eye, Phone, Mail, MapPin, Clock, DollarSign, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AgentStatsCard from './AgentStatsCard';
import AgentReferralSection from './AgentReferralSection';
import AgentQuickActions from './AgentQuickActions';
import bookingAPI from '../../api/bookingAPI';

const AgentDashboard = ({ agentData, agentStats, onCopyCode, onCopyLink }) => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    scheduled: 0,
    visited: 0,
    interested: 0,
    negotiation: 0,
    closed: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    dealValue: '',
    notes: '',
    followUpDate: '',
    feedback: { rating: 0, comment: '' }
  });

  const appointmentsRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAgentAppointments();
      if (response.success) {
        setAppointments(response.data.appointments);
        setAppointmentStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId) => {
    try {
      const response = await bookingAPI.updateAppointmentStatus(appointmentId, updateData);
      if (response.success) {
        alert('Appointment status updated successfully!');
        setShowUpdateModal(false);
        setSelectedAppointment(null);
        fetchAppointments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error.message || 'Failed to update appointment');
    }
  };

  const scrollToAppointments = () => {
    if (appointmentsRef.current) {
      appointmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Scheduled' },
      visited: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Visited' },
      interested: { color: 'bg-purple-100 text-purple-800', icon: TrendingUp, label: 'Interested' },
      negotiation: { color: 'bg-orange-100 text-orange-800', icon: MessageCircle, label: 'Negotiation' },
      closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Closed' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' }
    };
    const badge = badges[status] || badges.scheduled;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const stats = [
    {
      icon: Users,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Total Referrals',
      value: agentStats?.stats?.totalReferrals || agentData?.referralCount || 0,
      subtitle: 'People who joined using your code'
    },
    {
      icon: Gift,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Total Rewards Earned',
      value: `₹${agentStats?.stats?.totalRewards || agentData?.rewards || 0}`,
      subtitle: 'From referrals and commissions',
      valueColor: 'text-green-600'
    },
    {
      icon: Calendar,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Total Appointments',
      value: appointmentStats.total,
      subtitle: 'Scheduled property visits'
    },
    {
      icon: TrendingUp,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Conversion Rate',
      value: appointmentStats.total > 0 ? `${((appointmentStats.closed / appointmentStats.total) * 100).toFixed(1)}%` : '0%',
      subtitle: 'Appointments to closed deals'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Agent Dashboard</h2>
            <p className="text-blue-100">Agent ID: {agentData?.agentId}</p>
            <p className="text-blue-100 text-sm mt-1">
              Member since: {agentData?.createdAt ? new Date(agentData.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <button
            onClick={scrollToAppointments}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition font-medium text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            View Appointments
          </button>
        </div>
      </div>

      {/* Referral Section */}
      <div className="referral-section">
        <AgentReferralSection
          referralCode={agentData?.referralCode}
          onCopyCode={onCopyCode}
          onCopyLink={onCopyLink}
        />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <AgentStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Appointments Section */}
      <div id="appointments-section" ref={appointmentsRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Appointments Management</h3>
          <p className="text-gray-600 text-sm mt-1">View and manage all client appointments</p>
        </div>

        {/* Appointment Stats Summary */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{appointmentStats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Scheduled</p>
            <p className="text-lg font-bold text-yellow-600">{appointmentStats.scheduled}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Visited</p>
            <p className="text-lg font-bold text-blue-600">{appointmentStats.visited}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Interested</p>
            <p className="text-lg font-bold text-purple-600">{appointmentStats.interested}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Negotiation</p>
            <p className="text-lg font-bold text-orange-600">{appointmentStats.negotiation}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Closed</p>
            <p className="text-lg font-bold text-green-600">{appointmentStats.closed}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Rejected/Cancelled</p>
            <p className="text-lg font-bold text-red-600">{appointmentStats.rejected + appointmentStats.cancelled}</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No appointments yet</p>
              <p className="text-sm text-gray-400 mt-1">When clients book appointments, they will appear here</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Client Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">
                          {appointment.client?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900">{appointment.client?.name || 'Unknown'}</h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="mt-2 space-y-1">
                          {appointment.client?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{appointment.client.email}</span>
                            </div>
                          )}
                          {appointment.client?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{appointment.client.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="flex-1">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Property</p>
                      <p className="font-medium text-gray-900">{appointment.property?.title}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{appointment.property?.address}, {appointment.property?.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Appointment</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-900">{appointment.appointmentTime}</span>
                      </div>
                      {appointment.dealValue && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-semibold">₹{appointment.dealValue.toLocaleString()}</span>
                        </div>
                      )}
                      {appointment.rewardEarned > 0 && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Gift className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">Reward: ₹{appointment.rewardEarned}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setUpdateData({
                          status: appointment.status,
                          dealValue: appointment.dealValue || '',
                          notes: appointment.notes || '',
                          followUpDate: appointment.followUpDate?.split('T')[0] || '',
                          feedback: appointment.feedback || { rating: 0, comment: '' }
                        });
                        setShowUpdateModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Notes if any */}
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{appointment.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <AgentQuickActions onRefresh={fetchAppointments} />

      {/* Update Status Modal */}
      {showUpdateModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Update Appointment</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Client: {selectedAppointment.client?.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Status *
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="visited">Visited</option>
                  <option value="interested">Interested</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Deal Value (only show for closed/negotiation) */}
              {(updateData.status === 'closed' || updateData.status === 'negotiation') && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    value={updateData.dealValue}
                    onChange={(e) => setUpdateData({ ...updateData, dealValue: e.target.value })}
                    placeholder="Enter deal amount"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              )}

              {/* Follow-up Date */}
              {(updateData.status === 'interested' || updateData.status === 'negotiation') && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={updateData.followUpDate}
                    onChange={(e) => setUpdateData({ ...updateData, followUpDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Notes
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                  rows={3}
                  placeholder="Add any notes about this appointment..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              {/* Feedback (only show for closed/rejected) */}
              {(updateData.status === 'closed' || updateData.status === 'rejected') && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Client Feedback
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setUpdateData({ 
                          ...updateData, 
                          feedback: { ...updateData.feedback, rating } 
                        })}
                        className={`w-10 h-10 rounded-full font-bold transition ${
                          updateData.feedback.rating >= rating
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={updateData.feedback.comment}
                    onChange={(e) => setUpdateData({ 
                      ...updateData, 
                      feedback: { ...updateData.feedback, comment: e.target.value } 
                    })}
                    rows={2}
                    placeholder="Client feedback comments..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-bold"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;