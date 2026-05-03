// src/components/agent/AgentDashboard.jsx
import { Users, Gift, Calendar, TrendingUp } from 'lucide-react';
import AgentStatsCard from './AgentStatsCard';
import AgentReferralSection from './AgentReferralSection';
import AgentQuickActions from './AgentQuickActions';

const AgentDashboard = ({ agentData, agentStats, onCopyCode, onCopyLink }) => {
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
      value: agentStats?.stats?.totalAppointments || 0,
      subtitle: 'Scheduled property visits'
    },
    {
      icon: TrendingUp,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Conversion Rate',
      value: `${agentStats?.stats?.conversionRate?.toFixed(1) || 0}%`,
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
        </div>
      </div>

      {/* Referral Section */}
      <AgentReferralSection
        referralCode={agentData?.referralCode}
        onCopyCode={onCopyCode}
        onCopyLink={onCopyLink}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <AgentStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <AgentQuickActions />
    </div>
  );
};

export default AgentDashboard;