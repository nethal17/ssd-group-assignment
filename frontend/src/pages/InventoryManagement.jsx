import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LayoutDashboard, Package, List, PieChart, Grid } from 'lucide-react';
import { InventoryManagerDashboard } from './InventoryManagerDashboard';
import { InventoryPage } from './InventoryPage';
import { useNavigate, useLocation } from 'react-router-dom';
import { InventoryChartpage } from './InventoryChartpage';
import { InventoryCategoryPage } from './InventoryCategoryPage';
import { FiBell, FiFileText, FiPieChart, FiDatabase, FiList, FiGrid } from "react-icons/fi";
import { ReportsAndAnalytics } from './ReportsAndAnalytics';

const InventoryManagement = () => {
  const [activeComponent, setActiveComponent] = useState('inventory');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set default view to inventory when component mounts
    if (location.pathname === '/inventory-management') {
      setActiveComponent('inventory');
    }
  }, [location]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'listings':
        return <InventoryManagerDashboard />;
      case 'inventory':
        return <InventoryPage />;
      case 'charts':
        return <InventoryChartpage/>;
      case 'category':
        return <InventoryCategoryPage/>;
      case 'reports':
        return <ReportsAndAnalytics />;
      default:
        return <InventoryPage />;
    }
  };

  const handleNavigation = (component) => {
    if (component === 'dashboard') {
      navigate('/admin-dashboard');
    } else {
      setActiveComponent(component);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inventory', icon: FiDatabase, label: 'Inventory' },
    { id: 'listings', icon: FiList, label: 'Listings' },
    { id: 'charts', icon: FiPieChart, label: 'Charts' },
    { id: 'category', icon: FiGrid, label: 'Category' },
    { id: 'reports', icon: FiFileText, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div 
          className={`fixed left-0 z-40 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${
            isSidebarHovered ? 'w-64' : 'w-16'
          } bg-[#101540] text-white flex flex-col items-center py-4`}
          style={{ top: '64px' }}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          <div className="flex flex-col items-center space-y-2 w-full">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`p-3 rounded-lg w-full text-center cursor-pointer transition-colors ${
                  activeComponent === item.id ? 'bg-[#ffffff20]' : 'hover:bg-[#ffffff15]'
                }`}
              >
                <div className="flex items-center justify-center">
                  <item.icon size={20} className={isSidebarHovered ? 'mr-3' : 'mx-auto'} />
                  {isSidebarHovered && (
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          className={`flex-1 transition-all duration-300 ${
            isSidebarHovered ? 'ml-64' : 'ml-16'
          }`}
        >
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;   









    





    