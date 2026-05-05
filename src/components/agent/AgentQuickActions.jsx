// src/components/agent/AgentQuickActions.jsx
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Calendar, 
  Users, 
  BarChart3, 
  Gift, 
  Settings, 
  MessageCircle,
  FileText,
  TrendingUp,
  Star,
  HelpCircle,
  Bell,
  Mail,
  Phone,
  UserPlus,
  ClipboardList,
  PieChart,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AgentQuickActions = ({ onRefresh }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'browse',
      title: 'Browse Properties',
      description: 'Find properties for your clients',
      icon: Home,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/properties'
    },
    {
      id: 'list',
      title: 'List a Property',
      description: 'Add new property listing',
      icon: Building2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/add-property'
    },
    {
      id: 'my-properties',
      title: 'My Properties',
      description: 'Manage your property listings',
      icon: ClipboardList,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      path: '/my-properties'
    },
    {
      id: 'appointments',
      title: 'View Appointments',
      description: 'See all client appointments',
      icon: Calendar,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      onClick: () => {
        const element = document.getElementById('appointments-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'referrals',
      title: 'Share Referral Link',
      description: 'Invite others & earn rewards',
      icon: Gift,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      onClick: () => {
        const referralSection = document.querySelector('.referral-section');
        if (referralSection) {
          referralSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'analytics',
      title: 'Performance Metrics',
      description: 'Track your success rate',
      icon: TrendingUp,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      onClick: () => {
        const statsSection = document.querySelector('.stats-grid');
        if (statsSection) {
          statsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    // {
    //   id: 'rewards',
    //   title: 'Rewards Summary',
    //   description: 'View your earnings',
    //   icon: Award,
    //   iconBg: 'bg-amber-100',
    //   iconColor: 'text-amber-600',
    //   path: '/rewards'
    // },
    // {
    //   id: 'notifications',
    //   title: 'Notifications',
    //   description: 'Stay updated',
    //   icon: Bell,
    //   iconBg: 'bg-red-100',
    //   iconColor: 'text-red-600',
    //   path: '/notifications'
    // },
    // {
    //   id: 'support',
    //   title: 'Support',
    //   description: 'Get help & assistance',
    //   icon: HelpCircle,
    //   iconBg: 'bg-gray-100',
    //   iconColor: 'text-gray-600',
    //   path: '/support'
    // }
  ];

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    } else {
      // Default action for paths not yet implemented
      alert(`Coming soon! The ${action.title} feature will be available shortly.`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Frequently used tools and shortcuts</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className="group bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-200"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentQuickActions;