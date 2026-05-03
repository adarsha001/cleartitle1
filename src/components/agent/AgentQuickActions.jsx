// src/components/agent/AgentQuickActions.jsx
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Calendar, Users, BarChart3 } from 'lucide-react';

const actions = [
  {
    id: 'browse',
    title: 'Browse Properties',
    description: 'Find properties for your clients',
    icon: Home,
    iconColor: 'text-blue-600',
    path: '/properties'
  },
  {
    id: 'list',
    title: 'List a Property',
    description: 'Add new property listing',
    icon: Building2,
    iconColor: 'text-green-600',
    path: '/add-property'
  },
  {
    id: 'appointments',
    title: 'Schedule Appointment',
    description: 'Book property visits',
    icon: Calendar,
    iconColor: 'text-orange-600',
    path: null,
    onClick: () => alert('Appointment scheduling coming soon!')
  },
  {
    id: 'referrals',
    title: 'View Referrals',
    description: 'Track your referrals',
    icon: Users,
    iconColor: 'text-purple-600',
    path: null,
    onClick: () => alert('Referral details coming soon!')
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    iconColor: 'text-indigo-600',
    path: null,
    onClick: () => alert('Analytics coming soon!')
  }
];

const AgentQuickActions = () => {
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition group"
          >
            <action.icon className={`w-6 h-6 ${action.iconColor} mb-2 group-hover:scale-110 transition`} />
            <h4 className="font-medium text-gray-900">{action.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentQuickActions;