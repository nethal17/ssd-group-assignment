import React, { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { LayoutDashboard, Package, List, PieChart, Grid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBell, FiSearch, FiPieChart, FiDatabase, FiList, FiGrid } from "react-icons/fi";
import { ListingDetails } from "../components/ListingDetails";
import { ListingReviews } from "../components/ListingReviews";

export const DisplayFarmerListings = () => {

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
        return <ListingDetails />;
      case 'reviews':
        return < ListingReviews/>;
      default:
        return <ListingDetails />;
    }
  };

  const handleNavigation = (component) => {
    if (component === 'dashboard') {
      navigate('/profile');
    } else {
      setActiveComponent(component);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'listings', icon: FiList, label: 'Listings' },
    { id: 'reviews', icon: FiPieChart, label: 'reviews' },
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
          className={`flex-grow transition-all duration-300 ease-in-out ${
            isSidebarHovered ? 'ml-64' : 'ml-16'
          }`}
          style={{ marginTop: '64px' }}

        >
          <div className="flex-grow p-4 overflow-auto">
            {renderComponent()}
          </div>
        </div>  
      </div>
    </div>
  );
};

export default DisplayFarmerListings;