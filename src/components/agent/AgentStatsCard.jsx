// src/components/agent/AgentStatsCard.jsx
const AgentStatsCard = ({ icon: Icon, iconBgColor, iconColor, title, value, subtitle, valueColor = 'text-gray-900' }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
      </div>
      <h4 className="text-gray-600 font-medium">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

export default AgentStatsCard;