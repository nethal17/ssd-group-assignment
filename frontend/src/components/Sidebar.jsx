import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  DollarOutlined, 
  BarChartOutlined,
  HistoryOutlined,
  LogoutOutlined,
  LineChartOutlined,
  RollbackOutlined
} from '@ant-design/icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    
    {
      key: 'final-dashboard',
      icon: <LineChartOutlined />,
      label: 'Dashboard',
      path: '/final-summary'
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Payments',
      path: '/payment-dashboard'
    },
    {
      key: 'charts',
      icon: <BarChartOutlined />,
      label: 'Charts',
      path: '/charts'
    },
    {
      key: 'product-history',
      icon: <HistoryOutlined />,
      label: 'Product History',
      path: '/pay-history'
    },
    {
      key: 'refunds',
      icon: <RollbackOutlined />,
      label: 'Refund',
      path: '/refunds'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`bg-black h-screen shadow-lg fixed left-0 top-0 pt-16 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {isExpanded && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-700">
          
        </div>
      </div>
    </div>
  );
};

export default Sidebar;